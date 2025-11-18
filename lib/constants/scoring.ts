/**
 * Scoring constants and utilities
 */

export const SCORING = {
  // Default fallback scores
  DEFAULT_WRITING_SCORE: 75,
  DEFAULT_FEEDBACK_SCORE: 80,
  DEFAULT_REVISION_SCORE: 78,
  
  // Score ranges
  MIN_SCORE: 0,
  MAX_SCORE: 100,
  
  // Mock scoring ranges (conservative)
  MOCK_MIN: 30,
  MOCK_MAX: 85,
  MOCK_BASE_MIN: 30,
  MOCK_BASE_MAX: 50,
  MOCK_RANDOM_MAX: 15,
  
  // Time thresholds (seconds)
  TIME_GREEN_THRESHOLD: 30,
  TIME_YELLOW_THRESHOLD: 15,
  TIME_PHASE1_GREEN: 60,
  
  // Phase durations (seconds)
  PHASE1_DURATION: 120,
  PHASE2_DURATION: 90,
  PHASE3_DURATION: 90,
} as const;

export function getDefaultScore(phase: 1 | 2 | 3): number {
  switch (phase) {
    case 1: return SCORING.DEFAULT_WRITING_SCORE;
    case 2: return SCORING.DEFAULT_FEEDBACK_SCORE;
    case 3: return SCORING.DEFAULT_REVISION_SCORE;
  }
}

export function clampScore(score: number): number {
  return Math.max(SCORING.MIN_SCORE, Math.min(SCORING.MAX_SCORE, Math.round(score)));
}

