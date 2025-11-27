import { useState } from 'react';
import { getDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
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
  submitPhase: (phase: Phase, data: TSubmissionData) => Promise<void>;
  fallbackEvaluation?: () => Promise<number>;
  validateSubmission?: () => { isValid: boolean; isEmpty?: boolean; unchanged?: boolean };
  onEmptySubmission?: (isEmpty: boolean, unchanged?: boolean) => Promise<void>;
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
      if (options.validateSubmission) {
        const validation = options.validateSubmission();
        if (!validation.isValid) {
          if (options.onEmptySubmission) {
            await options.onEmptySubmission(
              validation.isEmpty || false,
              validation.unchanged
            );
            return;
          }
          throw new Error('Invalid submission');
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
            maxAttempts: 10,
            delayMs: 1000,
            exponentialBackoff: false,
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

      const score = yourRanking.score;

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

      // Set the start time for the next phase (after batch ranking completes)
      // This ensures players get the full phase duration
      const nextPhase = options.phase + 1;
      if ((nextPhase === 2 || nextPhase === 3) && options.sessionId) {
        try {
          const sessionRef = doc(db, 'sessions', options.sessionId);
          await updateDoc(sessionRef, {
            [`timing.phase${nextPhase}StartTime`]: serverTimestamp()
          });
          console.log(`✅ BATCH RANKING - Set phase ${nextPhase} start time after ranking completion`);
        } catch (err) {
          console.warn(`⚠️ BATCH RANKING - Failed to set phase ${nextPhase} start time:`, err);
          // Don't fail the submission if this fails
        }
      }

      await options.submitPhase(options.phase, options.prepareSubmissionData(clampScore(score)));

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
