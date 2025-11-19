import { useState } from 'react';
import { getDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/config/firebase';
import { clampScore } from '@/lib/constants/scoring';
import { Phase } from '@/lib/types/session';

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

      // Call batch ranking API
      const requestBody: Record<string, any> = {
        [getRequestBodyKey(options.endpoint)]: allSubmissions,
        ...getAdditionalBodyParams(options.endpoint, matchState),
      };

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

      // Find user's ranking
      const yourRanking = rankings.find((r: any) => r.playerId === options.userId);
      if (!yourRanking) {
        throw new Error('Your ranking not found');
      }

      const score = yourRanking.score;
      console.log(`🎯 You ranked #${yourRanking.rank} with score ${score}`);

      // Store rankings in Firestore
      const matchRef = doc(db, 'matchStates', options.matchId);
      await updateDoc(matchRef, {
        [options.rankingsKey]: rankings,
      });

      // Submit phase with clamped score
      await options.submitPhase(options.phase, options.prepareSubmissionData(clampScore(score)));

      console.log(`✅ Batch ranking submission complete for phase ${options.phase}`);
    } catch (error) {
      console.error(`❌ Batch ranking failed for phase ${options.phase}:`, error);
      setError(error as Error);

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

