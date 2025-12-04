import { useState } from 'react';
import { getDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/config/firebase';
import { clampScore } from '@/lib/constants/scoring';
import { Phase } from '@/lib/types/session';
import { retryUntilSuccess, retryWithBackoff } from '@/lib/utils/retry';

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
            console.log(`⚠️ BATCH RANKING - Empty submission detected, will apply penalty score: ${penaltyScore}`);
          } else if (validation.unchanged) {
            penaltyScore = options.unchangedPenaltyScore ?? 40;
            console.log(`⚠️ BATCH RANKING - Unchanged submission detected, will apply penalty score: ${penaltyScore}`);
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
            maxAttempts: 6,      // Fewer attempts needed with exponential backoff
            delayMs: 500,        // Start faster
            exponentialBackoff: true,  // 500ms, 1s, 2s, 4s, 8s, 16s = 31.5s total coverage
          }
        );
      } catch (err) {
        // Silent timeout
      }

      if (aiSubmissions.length === 0) {
        throw new Error('AI submissions not available after waiting');
      }

      const userSubmission = options.prepareUserSubmission();
      const allSubmissions = [userSubmission, ...aiSubmissions];

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

      const yourRanking = rankings.find((r: any) => r.playerId === options.userId);
      if (!yourRanking) {
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
      console.log(`✅ BATCH RANKING - Submitting phase ${options.phase} with score:`, clampScore(score), 'data:', submissionData);
      await options.submitPhase(options.phase, submissionData);
      console.log(`✅ BATCH RANKING - Successfully saved phase ${options.phase} to session`);

    } catch (error) {
      setError(error as Error);

      if (error instanceof Error && error.message === 'Session not initialized') {
        throw error;
      }

      if (options.fallbackEvaluation) {
        try {
          const fallbackScore = await options.fallbackEvaluation();
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
