import { useState } from 'react';
import { getDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/config/firebase';
import { clampScore } from '@/lib/constants/scoring';
import { Phase } from '@/lib/types/session';
import { retryUntilSuccess } from '@/lib/utils/retry';

/**
 * Helper to get nested value from object using dot notation path
 */
function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

/**
 * Get request body key based on endpoint
 */
function getRequestBodyKey(endpoint: string): string {
  if (endpoint.includes('writings')) return 'writings';
  if (endpoint.includes('feedback')) return 'feedbackSubmissions';
  if (endpoint.includes('revisions')) return 'revisionSubmissions';
  throw new Error(`Unknown endpoint: ${endpoint}`);
}

/**
 * Get additional body parameters based on endpoint
 */
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
  userId: string;
  endpoint: string; // '/api/batch-rank-writings' | '/api/batch-rank-feedback' | '/api/batch-rank-revisions'
  firestoreKey: string; // 'aiWritings.phase1' | 'aiFeedbacks.phase2' | 'aiRevisions.phase3'
  rankingsKey: string; // 'rankings.phase1' | 'rankings.phase2' | 'rankings.phase3'
  prepareUserSubmission: () => TSubmission;
  prepareSubmissionData: (score: number) => TSubmissionData;
  submitPhase: (phase: Phase, data: TSubmissionData) => Promise<void>;
  fallbackEvaluation?: () => Promise<number>;
  validateSubmission?: () => { isValid: boolean; isEmpty?: boolean; unchanged?: boolean };
  onEmptySubmission?: (isEmpty: boolean, unchanged?: boolean) => Promise<void>;
}

/**
 * Hook for handling batch ranking submissions
 * Consolidates the common pattern of:
 * 1. Getting AI submissions from Firestore
 * 2. Preparing user + AI submissions
 * 3. Calling batch ranking API
 * 4. Finding user's ranking
 * 5. Storing rankings in Firestore
 * 6. Submitting phase with score
 * 7. Fallback to individual evaluation on error
 */
export function useBatchRankingSubmission<TSubmission, TSubmissionData>(
  options: UseBatchRankingSubmissionOptions<TSubmission, TSubmissionData>
) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const submit = async () => {
    // Prevent duplicate submissions
    if (isSubmitting) {
      console.warn(`⚠️ Phase ${options.phase} - Already submitting, ignoring duplicate call`);
      return;
    }
    
    setIsSubmitting(true);
    setError(null);

    try {
      // Validation
      if (options.validateSubmission) {
        const validation = options.validateSubmission();
        console.log(`🔍 Phase ${options.phase} - Validation result:`, validation);
        if (!validation.isValid) {
          // Handle empty/unchanged submission
          if (options.onEmptySubmission) {
            console.warn(`⚠️ Phase ${options.phase} - Invalid submission detected, handling empty submission`);
            await options.onEmptySubmission(
              validation.isEmpty || false,
              validation.unchanged
            );
            return;
          }
          throw new Error('Invalid submission');
        }
      }

      // Get AI submissions from Firestore
      const matchDoc = await getDoc(doc(db, 'matchStates', options.matchId));
      if (!matchDoc.exists()) {
        throw new Error('Match state not found');
      }

      const matchState = matchDoc.data();
      const aiSubmissions = getNestedValue(matchState, options.firestoreKey) || [];

      if (aiSubmissions.length === 0) {
        throw new Error('AI submissions not available');
      }

      // Prepare all submissions
      const userSubmission = options.prepareUserSubmission();
      const submissionAny = userSubmission as any;
      console.log(`📝 Phase ${options.phase} - User submission prepared:`, {
        hasContent: !!submissionAny.content,
        contentLength: submissionAny.content?.length || 0,
        contentPreview: submissionAny.content?.substring(0, 50) || '',
        wordCount: submissionAny.wordCount || 'N/A',
      });
      
      const allSubmissions = [userSubmission, ...aiSubmissions];

      console.log(`📊 Batch ranking ${allSubmissions.length} submissions for phase ${options.phase}...`);

      // Call batch ranking API with retry logic
      const requestBody: Record<string, any> = {
        [getRequestBodyKey(options.endpoint)]: allSubmissions,
        ...getAdditionalBodyParams(options.endpoint, matchState),
      };

      // Retry API call up to 3 times with exponential backoff
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
        onRetry: (attempt) => {
          console.log(`🔄 Phase ${options.phase} - Retrying batch ranking API (attempt ${attempt}/3)...`);
        },
      });

      if (!rankings) {
        throw new Error('Batch ranking API failed after 3 attempts');
      }

      // Find user's ranking
      const yourRanking = rankings.find((r: any) => r.playerId === options.userId);
      if (!yourRanking) {
        throw new Error('Your ranking not found');
      }

      const score = yourRanking.score;
      console.log(`🎯 You ranked #${yourRanking.rank} with score ${score}`);

      // Extract user's feedback from ranking
      const userFeedback: any = {
        strengths: yourRanking.strengths || [],
        improvements: yourRanking.improvements || [],
      };
      
      // Phase-specific feedback fields
      if (options.phase === 1) {
        // Phase 1: Writing - includes traitFeedback and can generate nextSteps
        userFeedback.traitFeedback = yourRanking.traitFeedback || {};
        // Generate nextSteps from improvements
        userFeedback.nextSteps = (yourRanking.improvements || []).slice(0, 3).map((imp: string) => {
          // Extract TWR strategy mentioned and create actionable step
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
      } else if (options.phase === 2) {
        // Phase 2: Peer Feedback - feedback on feedback quality
        // No additional fields needed
      } else if (options.phase === 3) {
        // Phase 3: Revision - includes suggestions
        userFeedback.suggestions = yourRanking.suggestions || [];
      }

      // Store rankings AND user's feedback in Firestore
      const matchRef = doc(db, 'matchStates', options.matchId);
      await updateDoc(matchRef, {
        [options.rankingsKey]: rankings,
        [`feedback.${options.userId}.phase${options.phase}`]: userFeedback,
      });

      console.log(`✅ Stored feedback for phase ${options.phase}:`, {
        hasStrengths: userFeedback.strengths?.length > 0,
        hasImprovements: userFeedback.improvements?.length > 0,
      });

      // Submit phase with clamped score
      await options.submitPhase(options.phase, options.prepareSubmissionData(clampScore(score)));

      console.log(`✅ Batch ranking submission complete for phase ${options.phase}`);
    } catch (error) {
      console.error(`❌ Batch ranking failed for phase ${options.phase}:`, error);
      setError(error as Error);

      // Don't retry if session is not initialized - this is a fatal error
      if (error instanceof Error && error.message === 'Session not initialized') {
        console.error('❌ Session not initialized - cannot submit phase');
        throw error;
      }

      // Fallback to individual evaluation if provided
      if (options.fallbackEvaluation) {
        try {
          console.log('🔄 Attempting fallback evaluation...');
          const fallbackScore = await options.fallbackEvaluation();
          await options.submitPhase(
            options.phase,
            options.prepareSubmissionData(clampScore(fallbackScore))
          );
          console.log('✅ Fallback evaluation complete');
        } catch (fallbackError) {
          // Don't retry if session is not initialized
          if (fallbackError instanceof Error && fallbackError.message === 'Session not initialized') {
            console.error('❌ Session not initialized - cannot use fallback');
            throw fallbackError;
          }
          console.error('❌ Fallback evaluation failed:', fallbackError);
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

