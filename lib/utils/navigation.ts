import { clampScore } from '@/lib/constants/scoring';

/**
 * Parameters for building results page URL
 */
export interface ResultsURLParams {
  matchId: string;
  trait: string;
  promptId: string;
  promptType: string;
  originalContent: string;
  revisedContent: string;
  wordCount: number;
  revisedWordCount: number;
  writingScore: number;
  feedbackScore: number;
  revisionScore: number;
  aiScores?: string;
}

/**
 * Build results page URL with encoded parameters
 */
export function buildResultsURL(params: ResultsURLParams): string {
  const queryParams = new URLSearchParams({
    matchId: params.matchId,
    trait: params.trait,
    promptId: params.promptId,
    promptType: params.promptType,
    originalContent: encodeURIComponent(params.originalContent),
    revisedContent: encodeURIComponent(params.revisedContent),
    wordCount: params.wordCount.toString(),
    revisedWordCount: params.revisedWordCount.toString(),
    writingScore: params.writingScore.toString(),
    feedbackScore: params.feedbackScore.toString(),
    revisionScore: clampScore(params.revisionScore).toString(),
    ...(params.aiScores && { aiScores: params.aiScores }),
  });
  
  return `/ranked/results?${queryParams.toString()}`;
}

