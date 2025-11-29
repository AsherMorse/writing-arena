/**
 * Scoring constants and utilities
 */

import { getPhaseDuration } from './rank-timing';

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
  TIME_GREEN_THRESHOLD: 60,
  TIME_YELLOW_THRESHOLD: 30,
  TIME_PHASE1_GREEN: 150,
  TIME_PHASE2_GREEN: 90,
  TIME_PHASE3_GREEN: 120,
  
  PHASE1_DURATION: 300, // 5 minutes
  PHASE2_DURATION: 180, // 3 minutes
  PHASE3_DURATION: 180, // 3 minutes (increased from 2 minutes)
} as const;

export const TIMING = {
  // Minimum phase age before allowing auto-submit (prevents immediate submit on load)
  MIN_PHASE_AGE: 3000,
  
  // Carousel/tips rotation interval
  CAROUSEL_INTERVAL: 6000,
  
  // Countdown interval (1 second)
  COUNTDOWN_INTERVAL: 1000,
  
  // Animation duration for score reveal
  ANIMATION_DURATION: 1000,
  
  // Modal close delay after submission
  MODAL_CLOSE_DELAY: 500,
  
  // AP Lang warning threshold (5 minutes)
  AP_LANG_WARNING_THRESHOLD: 300,
  
  // Paste warning display duration
  PASTE_WARNING_DURATION: 2500,
  
  // Animation delays for loading dots
  ANIMATION_DELAY_DOT_1: '0ms',
  ANIMATION_DELAY_DOT_2: '150ms',
  ANIMATION_DELAY_DOT_3: '300ms',
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

/**
 * Get phase duration based on rank (if rank provided) or use default
 * 
 * @param rank - Optional rank string (e.g., "Silver III")
 * @param phase - Phase number (1, 2, or 3)
 * @returns Phase duration in seconds
 */
export function getRankPhaseDuration(rank: string | null | undefined, phase: 1 | 2 | 3): number {
  if (rank) {
    return getPhaseDuration(rank, phase);
  }
  // Fallback to defaults
  switch (phase) {
    case 1: return SCORING.PHASE1_DURATION;
    case 2: return SCORING.PHASE2_DURATION;
    case 3: return SCORING.PHASE3_DURATION;
  }
}

