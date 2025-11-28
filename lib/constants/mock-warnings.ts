/**
 * Centralized warning messages for mock/fallback data
 * Used when LLM API is unavailable or returns errors
 */

export const MOCK_WARNINGS = {
  /**
   * Warning message when random scores are generated instead of LLM evaluation
   */
  RANDOM_SCORE_GENERATED: '🚨 LLM API UNAVAILABLE: Random score generated - not from AI evaluation',
  
  /**
   * Warning message instructing users to set API key
   */
  SET_API_KEY: '🚨 LLM API UNAVAILABLE: Set ANTHROPIC_API_KEY to enable real AI scoring',
  
  /**
   * Warning message for randomly generated feedback
   */
  RANDOM_FEEDBACK: '⚠️ This score is randomly generated and not based on actual quality',
  
  /**
   * Warning message for mock data generation (not from AI)
   */
  MOCK_DATA_GENERATION: '🚨 LLM API UNAVAILABLE: Using mock data - not from AI generation',
  
  /**
   * Warning message for mock evaluation (not from AI)
   */
  MOCK_EVALUATION: '🚨 LLM API UNAVAILABLE: Using mock data - not from AI evaluation',
  
  /**
   * Warning message for random score in trait feedback
   */
  RANDOM_TRAIT_SCORE: '🚨 LLM API UNAVAILABLE: Random score - Set ANTHROPIC_API_KEY for real AI evaluation.',
} as const;

/**
 * Get warning messages for mock rankings
 */
export function getMockRankingWarnings() {
  return {
    strengths: [MOCK_WARNINGS.RANDOM_SCORE_GENERATED],
    improvements: [
      MOCK_WARNINGS.SET_API_KEY,
      MOCK_WARNINGS.RANDOM_FEEDBACK,
    ],
  };
}

/**
 * Get warning message for trait feedback
 */
export function getMockTraitFeedbackWarning() {
  return MOCK_WARNINGS.RANDOM_TRAIT_SCORE;
}

