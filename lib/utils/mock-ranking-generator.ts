/**
 * Consolidated mock ranking generation utilities
 * 
 * ⚠️ WARNING: These functions generate MOCK rankings with RANDOM scores.
 * They should ONLY be used when the LLM API is unavailable (missing API key or API failure).
 * 
 * In production, ALL scores MUST come from LLM evaluation.
 * Mock rankings are clearly marked with warnings to indicate LLM API is broken.
 */

interface MockRankingOptions<TSubmission> {
  isEmpty: (submission: TSubmission) => boolean;
  calculateScore: (submission: TSubmission) => number;
  generateStrengths: (submission: TSubmission, isEmpty: boolean) => string[];
  generateImprovements: (submission: TSubmission, isEmpty: boolean) => string[];
  generateTraitFeedback?: (submission: TSubmission, isEmpty: boolean) => any;
}

/**
 * Generate mock rankings for submissions
 * Handles empty submissions, score calculation, and ranking assignment
 * 
 * ⚠️ WARNING: Returns RANDOM scores - only use when LLM API is unavailable!
 */
export function generateMockRankings<TSubmission extends { playerId: string; playerName: string; isAI: boolean }>(
  submissions: TSubmission[],
  options: MockRankingOptions<TSubmission>
): { rankings: any[] } {
  const rankings = submissions.map((submission) => {
    const isEmpty = options.isEmpty(submission);
    
    // Double-check for empty submissions - be very defensive
    // Check if content exists and has actual content (not just whitespace)
    const hasContent = (submission as any).content 
      ? (submission as any).content.trim().length > 0 
      : false;
    const hasWordCount = (submission as any).wordCount 
      ? (submission as any).wordCount > 0 
      : false;
    
    // If it's marked as empty OR doesn't have content/wordCount, score as 0
    const isActuallyEmpty = isEmpty || (!hasContent && !hasWordCount);
    
    if (isActuallyEmpty && !isEmpty) {
      console.warn('⚠️ MOCK GENERATOR - Detected empty submission that validation missed:', {
        playerId: submission.playerId,
        playerName: submission.playerName,
        hasContent,
        contentLength: (submission as any).content?.length || 0,
        wordCount: (submission as any).wordCount || 0,
      });
    }

    const score = isActuallyEmpty ? 0 : options.calculateScore(submission);
    
    // Always include warning that LLM API is broken
    const strengths = options.generateStrengths(submission, isActuallyEmpty);
    const improvements = [
      '🚨 LLM API UNAVAILABLE: This score is randomly generated, not from AI evaluation',
      '🚨 Set ANTHROPIC_API_KEY environment variable to enable real AI scoring',
      ...options.generateImprovements(submission, isActuallyEmpty)
    ];
    const traitFeedback = options.generateTraitFeedback
      ? options.generateTraitFeedback(submission, isActuallyEmpty)
      : undefined;

    return {
      ...submission,
      score,
      rank: 0, // Will be set after sorting
      strengths,
      improvements,
      ...(traitFeedback && { traitFeedback }),
    };
  });

  // Sort by score and assign ranks
  rankings.sort((a, b) => b.score - a.score);
  rankings.forEach((ranking, index) => {
    ranking.rank = index + 1;
  });

  return { rankings };
}

