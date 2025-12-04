/**
 * @fileoverview Hook for batch ranking submissions in ranked matches.
 * Handles collecting user + AI submissions, calling batch ranking API,
 * and saving results to Firestore and session.
 */

import { useState } from 'react';
import { getDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/config/firebase';
import { clampScore } from '@/lib/constants/scoring';
import { Phase } from '@/lib/types/session';
import { retryUntilSuccess, retryWithBackoff } from '@/lib/utils/retry';
import { logger, LOG_CONTEXTS } from '@/lib/utils/logger';

function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

function getRequestBodyKey(endpoint: string): string {
  if (endpoint.includes('writings')) return 'writings';
  if (endpoint.includes('feedback')) return 'feedbackSubmissions';
  if (endpoint.includes('revisions')) return 'revisionSubmissions';
  throw new Error(`Unknown endpoint: ${endpoint}`);
}

function getAdditionalBodyParams(endpoint: string, matchState: any): Record<string, any> {
  if (endpoint.includes('writings')) {
    return {
      prompt: matchState.prompt || '',
      promptType: matchState.promptType || 'narrative',
      trait: matchState.trait || 'all',
    };
  }
  return {};
}

interface UseBatchRankingSubmissionOptions<TSubmission, TSubmissionData> {
  phase: Phase;
  matchId: string;
  sessionId?: string;
  userId: string;
  endpoint: string;
  firestoreKey: string;
  rankingsKey: string;
  prepareUserSubmission: () => TSubmission;
  prepareSubmissionData: (score: number) => TSubmissionData;
  submitPhase: (phase: Phase, data: TSubmissionData) => Promise<void | { transitioned: boolean; nextPhase?: Phase }>;
  fallbackEvaluation?: () => Promise<number>;
  validateSubmission?: () => { isValid: boolean; isEmpty?: boolean; unchanged?: boolean };
  /** Penalty scores: isEmpty = 0, unchanged = 40. If not set, uses LLM score. */
  emptyPenaltyScore?: number;
  unchangedPenaltyScore?: number;
}

export function useBatchRankingSubmission<TSubmission, TSubmissionData>(
  options: UseBatchRankingSubmissionOptions<TSubmission, TSubmissionData>
) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const submit = async () => {
    if (isSubmitting) {
      return;
    }
    
    setIsSubmitting(true);
    setError(null);

    try {
      // Check validation but DON'T skip batch ranking
      // Note penalty score to apply after ranking (so AI players still get scored)
      let penaltyScore: number | null = null;
      
      if (options.validateSubmission) {
        const validation = options.validateSubmission();
        if (!validation.isValid) {
          if (validation.isEmpty) {
            penaltyScore = options.emptyPenaltyScore ?? 0;
            logger.warn(LOG_CONTEXTS.BATCH_RANKING, `Empty submission detected, will apply penalty score: ${penaltyScore}`);
          } else if (validation.unchanged) {
            penaltyScore = options.unchangedPenaltyScore ?? 40;
            logger.warn(LOG_CONTEXTS.BATCH_RANKING, `Unchanged submission detected, will apply penalty score: ${penaltyScore}`);
          }
          // Continue with batch ranking so AI players get their scores
        }
      }

      let aiSubmissions: any[] = [];
      let matchState: any = null;

      try {
        await retryWithBackoff(
          async () => {
            const matchDoc = await getDoc(doc(db, 'matchStates', options.matchId));
            if (!matchDoc.exists()) {
              throw new Error('Match state not found');
            }

            matchState = matchDoc.data();
            const submissions = getNestedValue(matchState, options.firestoreKey) || [];

            if (submissions.length === 0) {
              throw new Error('AI submissions not ready');
            }

            aiSubmissions = submissions;
            return true;
          },
          {
            maxAttempts: 20,     // Wait up to ~100s for AI content (generated on component mount)
            delayMs: 5000,       // 5 seconds between attempts
            exponentialBackoff: false,  // Linear polling for predictable timing
          }
        );
      } catch (err) {
        // Log the timeout/error so it's visible in console
        logger.warn(LOG_CONTEXTS.BATCH_RANKING, 'Failed to fetch AI submissions after retries', {
          phase: options.phase,
          firestoreKey: options.firestoreKey,
          error: err instanceof Error ? err.message : String(err),
        });
      }

      if (aiSubmissions.length === 0) {
        logger.error(LOG_CONTEXTS.BATCH_RANKING, 'AI submissions still empty after retries', undefined, {
          phase: options.phase,
          firestoreKey: options.firestoreKey,
        });
        throw new Error('AI submissions not available after waiting');
      }
      
      logger.info(LOG_CONTEXTS.BATCH_RANKING, `Found ${aiSubmissions.length} AI submissions for phase ${options.phase}`);

      const userSubmission = options.prepareUserSubmission();
      const allSubmissions = [userSubmission, ...aiSubmissions];

      // Debug: Log submission metadata (dev only, no PII)
      logger.debug(LOG_CONTEXTS.BATCH_RANKING, `Submitting ${allSubmissions.length} total submissions for phase ${options.phase}`, {
        aiSubmissionCount: aiSubmissions.length,
        hasUserSubmission: !!(userSubmission as any).playerId,
      });

      const requestBody: Record<string, any> = {
        [getRequestBodyKey(options.endpoint)]: allSubmissions,
        ...getAdditionalBodyParams(options.endpoint, matchState),
      };

      const apiCall = async () => {
        const response = await fetch(options.endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          throw new Error(`Batch ranking API returned ${response.status}`);
        }

        const data = await response.json();
        const rankings = data.rankings;

        if (!rankings || rankings.length === 0) {
          throw new Error('No rankings returned from API');
        }

        return rankings;
      };

      const rankings = await retryUntilSuccess(apiCall, {
        maxAttempts: 3,
        delayMs: 1000,
        exponentialBackoff: true,
      });

      if (!rankings) {
        throw new Error('Batch ranking API failed after 3 attempts');
      }

      // Debug: Log ranking metadata (dev only, no PII)
      const userRankingExists = rankings.some((r: any) => r.playerId === options.userId);
      logger.debug(LOG_CONTEXTS.BATCH_RANKING, `API returned ${rankings.length} rankings for phase ${options.phase}`, {
        rankingCount: rankings.length,
        userRankingFound: userRankingExists,
      });

      const yourRanking = rankings.find((r: any) => r.playerId === options.userId);
      if (!yourRanking) {
        logger.error(LOG_CONTEXTS.BATCH_RANKING, 'User ranking not found!', undefined, {
          phase: options.phase,
          rankingCount: rankings.length,
        });
        throw new Error('Your ranking not found');
      }

      // Apply penalty score if submission was empty/unchanged, otherwise use LLM score
      const score = penaltyScore !== null ? penaltyScore : yourRanking.score;

      const userFeedback: any = {
        strengths: yourRanking.strengths || [],
        improvements: yourRanking.improvements || [],
      };
      
      if (options.phase === 1) {
        userFeedback.traitFeedback = yourRanking.traitFeedback || {};
        userFeedback.nextSteps = (yourRanking.improvements || []).slice(0, 3).map((imp: string) => {
          if (imp.includes('because/but/so') || imp.includes('sentence expansion')) {
            return 'Practice sentence expansion: Add "because", "but", or "so" to show deeper thinking';
          }
          if (imp.includes('appositive')) {
            return 'Try appositives: Add description using commas (e.g., "Sarah, a curious student, wrote...")';
          }
          if (imp.includes('transition')) {
            return 'Use transition words: Connect ideas with "First", "Then", "However", "Therefore"';
          }
          return imp;
        });
      } else if (options.phase === 3) {
        userFeedback.suggestions = yourRanking.suggestions || [];
      }

      const matchRef = doc(db, 'matchStates', options.matchId);
      await updateDoc(matchRef, {
        [options.rankingsKey]: rankings,
        [`feedback.${options.userId}.phase${options.phase}`]: userFeedback,
      });

      const submissionData = options.prepareSubmissionData(clampScore(score));
      logger.info(LOG_CONTEXTS.BATCH_RANKING, `Submitting phase ${options.phase} with score: ${clampScore(score)}`);
      await options.submitPhase(options.phase, submissionData);
      logger.info(LOG_CONTEXTS.BATCH_RANKING, `Successfully saved phase ${options.phase} to session`);

    } catch (error) {
      setError(error as Error);

      if (error instanceof Error && error.message === 'Session not initialized') {
        throw error;
      }

      if (options.fallbackEvaluation) {
        logger.warn(LOG_CONTEXTS.BATCH_RANKING, 'Using fallback evaluation (AI players will NOT be scored)', {
          phase: options.phase,
          originalError: error instanceof Error ? error.message : String(error),
        });
        try {
          const fallbackScore = await options.fallbackEvaluation();
          logger.info(LOG_CONTEXTS.BATCH_RANKING, `Fallback evaluation completed with score: ${fallbackScore}`);
          await options.submitPhase(
            options.phase,
            options.prepareSubmissionData(clampScore(fallbackScore))
          );
        } catch (fallbackError) {
          if (fallbackError instanceof Error && fallbackError.message === 'Session not initialized') {
            throw fallbackError;
          }
          throw fallbackError;
        }
      } else {
        throw error;
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return { submit, isSubmitting, error };
}
