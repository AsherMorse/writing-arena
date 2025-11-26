/**
 * Phase color utilities
 * Calculates time-based colors for phase timers
 */

import { SCORING } from '@/lib/constants/scoring';
import { PHASE_COLORS } from '@/lib/constants/colors';

/**
 * Get time color for a phase based on remaining time
 * 
 * @param phase - Phase number (1, 2, or 3)
 * @param timeRemaining - Time remaining in seconds
 * @returns Color hex code for the current time state
 */
export function getPhaseTimeColor(phase: 1 | 2 | 3, timeRemaining: number): string {
  const thresholds = {
    1: SCORING.TIME_PHASE1_GREEN,
    2: SCORING.TIME_PHASE2_GREEN,
    3: SCORING.TIME_PHASE3_GREEN,
  };
  
  const colors = {
    1: { green: PHASE_COLORS[1], yellow: '#ff9030', red: '#ff5f8f' },
    2: { green: PHASE_COLORS[2], yellow: '#ff9030', red: PHASE_COLORS[2] },
    3: { green: PHASE_COLORS[3], yellow: '#ff9030', red: '#ff5f8f' },
  };
  
  const threshold = thresholds[phase];
  const phaseColors = colors[phase];
  
  if (timeRemaining > threshold) return phaseColors.green;
  if (timeRemaining > threshold / 2) return phaseColors.yellow;
  return phaseColors.red;
}

