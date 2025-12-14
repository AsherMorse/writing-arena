/**
 * Score fallback utilities for consistent score retrieval patterns
 */

/**
 * Get score with fallback priority:
 * 1. Session score (if available)
 * 2. URL parameter (if available)
 * 3. Default score
 * 
 * @param sessionScore - Score from session document (may be undefined/null)
 * @param urlParam - Score from URL search params (may be null)
 * @param defaultScore - Default score to use if neither available
 * @returns Final score value
 */
export function getScoreWithFallback(
  sessionScore: number | undefined | null,
  urlParam: string | null,
  defaultScore: number
): number {
  // Prefer session score if available
  if (sessionScore !== undefined && sessionScore !== null) {
    return sessionScore;
  }
  
  // Fall back to URL param if available
  if (urlParam) {
    const parsed = parseInt(urlParam, 10);
    if (!isNaN(parsed)) {
      return parsed;
    }
  }
  
  // Use default score
  return defaultScore;
}

/**
 * Get multiple phase scores with fallback
 * 
 * @param sessionScores - Object with phase scores from session
 * @param urlParams - URLSearchParams object
 * @param defaults - Default scores for each phase
 * @returns Object with phase scores
 */
export function getPhaseScoresWithFallback(
  sessionScores: {
    phase1?: number | null;
    phase2?: number | null;
    phase3?: number | null;
  },
  urlParams: URLSearchParams | null,
  defaults: {
    phase1: number;
    phase2: number;
    phase3: number;
  }
): {
  phase1: number;
  phase2: number;
  phase3: number;
} {
  return {
    phase1: getScoreWithFallback(
      sessionScores.phase1,
      urlParams?.get('writingScore') || null,
      defaults.phase1
    ),
    phase2: getScoreWithFallback(
      sessionScores.phase2,
      urlParams?.get('feedbackScore') || null,
      defaults.phase2
    ),
    phase3: getScoreWithFallback(
      sessionScores.phase3,
      urlParams?.get('revisionScore') || null,
      defaults.phase3
    ),
  };
}

