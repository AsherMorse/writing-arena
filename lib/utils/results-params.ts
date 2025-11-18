/**
 * Results URL parameter parsing utilities
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
 * Parse results page URL parameters from URLSearchParams
 */
export function parseResultsParams(searchParams: URLSearchParams): ResultsURLParams {
  return {
    matchId: searchParams.get('matchId') || '',
    trait: searchParams.get('trait') || 'all',
    promptId: searchParams.get('promptId') || '',
    promptType: searchParams.get('promptType') || 'narrative',
    originalContent: decodeURIComponent(searchParams.get('originalContent') || ''),
    revisedContent: decodeURIComponent(searchParams.get('revisedContent') || ''),
    wordCount: parseInt(searchParams.get('wordCount') || '0', 10),
    revisedWordCount: parseInt(searchParams.get('revisedWordCount') || '0', 10),
    writingScore: parseInt(searchParams.get('writingScore') || '0', 10),
    feedbackScore: parseInt(searchParams.get('feedbackScore') || '0', 10),
    revisionScore: parseInt(searchParams.get('revisionScore') || '0', 10),
    aiScores: searchParams.get('aiScores') || undefined,
  };
}

