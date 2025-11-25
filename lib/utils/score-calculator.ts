/**
 * Score calculation utilities
 * Centralizes scoring logic for consistency
 */

const PHASE_WEIGHTS = {
  PHASE1: 0.4,
  PHASE2: 0.3,
  PHASE3: 0.3,
} as const;

/**
 * Calculate composite score from three phase scores
 */
export function calculateCompositeScore(
  phase1Score: number,
  phase2Score: number,
  phase3Score: number
): number {
  return Math.round(
    (phase1Score * PHASE_WEIGHTS.PHASE1) +
    (phase2Score * PHASE_WEIGHTS.PHASE2) +
    (phase3Score * PHASE_WEIGHTS.PHASE3)
  );
}

/**
 * Calculate LP change based on final rank
 */
export function calculateLPChange(rank: number): number {
  const lpChanges: Record<number, number> = {
    1: 35,
    2: 22,
    3: 12,
    4: -5,
    5: -15,
  };
  return lpChanges[rank] || 0;
}

/**
 * Calculate XP earned based on composite score
 */
export function calculateXPEarned(compositeScore: number, mode: 'ranked' | 'quick-match' | 'practice' = 'ranked'): number {
  const multipliers = {
    ranked: 0.3,
    'quick-match': 0.2,
    practice: 0.15,
  };
  return Math.round(compositeScore * multipliers[mode]);
}

/**
 * Calculate points earned based on composite score and rank
 */
export function calculatePointsEarned(compositeScore: number, rank: number): number {
  const basePoints = Math.round(compositeScore * 2);
  const rankBonus = rank === 1 ? 30 : rank === 2 ? 15 : 0;
  return basePoints + rankBonus;
}

/**
 * Calculate improvement bonus from original to revision score
 */
export function calculateImprovementBonus(originalScore: number, revisionScore: number): number {
  return Math.max(0, revisionScore - originalScore);
}

