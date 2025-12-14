/**
 * @fileoverview Score and LP calculation utilities.
 * Centralizes scoring logic for consistency across ranked and practice modes.
 */

import type { SkillLevel, SkillTier, SubmissionLevel } from '@/lib/types';
import {
  THRESHOLDS,
  LP_BASE,
  LP_MIN,
  LP_MAX,
  REVISION_WEIGHT,
  PRACTICE_LP_MULTIPLIER,
  TIER_DISPLAY,
  SKILL_LEVELS,
} from './rank-constants';

const PHASE_WEIGHTS = {
  PHASE1: 0.4,
  PHASE2: 0.3,
  PHASE3: 0.3,
} as const;

/**
 * LP rewards based on score percentage (used for ranked battles).
 * Higher scores earn more LP for daily leaderboard and rank progression.
 */
const RANKED_LP_REWARDS: Record<string, number> = {
  'perfect': 20,    // 100%
  'excellent': 15,  // 90-99%
  'good': 12,       // 80-89%
  'passing': 8,     // 70-79%
  'needs-work': 5,  // 60-69%
  'incomplete': 2,  // <60%
};

/**
 * @description Calculates LP earned from a ranked battle based on score.
 * Used for both daily leaderboard and rank progression.
 */
export function calculateRankedLP(score: number): number {
  if (score === 100) return RANKED_LP_REWARDS['perfect'];
  if (score >= 90) return RANKED_LP_REWARDS['excellent'];
  if (score >= 80) return RANKED_LP_REWARDS['good'];
  if (score >= 70) return RANKED_LP_REWARDS['passing'];
  if (score >= 60) return RANKED_LP_REWARDS['needs-work'];
  return RANKED_LP_REWARDS['incomplete'];
}

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
 * @deprecated Use calculateRankedLP instead. LP is now score-based, not rank-based.
 * Calculate LP change based on final rank (old competitive system)
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
 * @deprecated XP system removed. Use calculateRankedLP for LP-based progression.
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
 * @deprecated Points system removed. Use calculateRankedLP for LP-based progression.
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

// =============================================================================
// NEW RANK SYSTEM UTILITIES
// =============================================================================

/**
 * @description Get the score threshold for a given tier.
 * T3 = 70%, T2 = 80%, T1 = 90%
 */
export function getThreshold(tier: SkillTier): number {
  return THRESHOLDS[tier];
}

/**
 * @description Calculate effective score from original and revised scores.
 * Weighted: 90% original + 10% revised. If no revision, uses original only.
 */
export function getEffectiveScore(originalScore: number, revisedScore?: number): number {
  const revised = revisedScore ?? originalScore;
  return (originalScore * (1 - REVISION_WEIGHT)) + (revised * REVISION_WEIGHT);
}

/**
 * @description Calculate tier LP change from a ranked submission.
 * Formula: LP_BASE (10) + delta from threshold, clamped to [LP_MIN, LP_MAX].
 * 
 * Examples at T3 (70% threshold):
 * - 90% → +20 LP (10 + 20, capped)
 * - 80% → +20 LP (10 + 10)
 * - 70% → +10 LP (10 + 0)
 * - 60% → 0 LP (10 - 10)
 * - 50% → -10 LP (10 - 20)
 */
export function calculateTierLP(effectiveScore: number, threshold: number): number {
  const delta = effectiveScore - threshold;
  const lp = LP_BASE + delta;
  return Math.max(LP_MIN, Math.min(LP_MAX, lp));
}

/**
 * @description Calculate LP change for practice mode submissions.
 * Quarter LP of ranked, with no negative values (floor at 0).
 */
export function calculatePracticeLP(effectiveScore: number, threshold: number): number {
  const rankedLP = calculateTierLP(effectiveScore, threshold);
  if (rankedLP <= 0) return 0;
  return Math.round(rankedLP * PRACTICE_LP_MULTIPLIER);
}

/**
 * @description Get display name for a rank (e.g., "Scribe III", "Scholar I").
 */
export function getRankDisplayName(level: SkillLevel, tier: SkillTier): string {
  const levelCapitalized = level.charAt(0).toUpperCase() + level.slice(1);
  return `${levelCapitalized} ${TIER_DISPLAY[tier]}`;
}

/**
 * @description Get the required submission mode for a skill level.
 * Scribe = paragraph, Scholar = essay, Loremaster = essay_passage
 */
export function getRequiredMode(level: SkillLevel): SubmissionLevel {
  const modeMap: Record<SkillLevel, SubmissionLevel> = {
    scribe: 'paragraph',
    scholar: 'essay',
    loremaster: 'essay_passage',
  };
  return modeMap[level];
}

/**
 * @description Check if a user can access a specific mode in ranked.
 * In ranked, users are locked to their current skill level's mode.
 */
export function canAccessModeInRanked(userLevel: SkillLevel, mode: SubmissionLevel): boolean {
  return getRequiredMode(userLevel) === mode;
}

/**
 * @description Get the skill level that corresponds to a submission mode.
 */
export function getSkillLevelForMode(mode: SubmissionLevel): SkillLevel {
  const levelMap: Record<SubmissionLevel, SkillLevel> = {
    paragraph: 'scribe',
    essay: 'scholar',
    essay_passage: 'loremaster',
  };
  return levelMap[mode];
}

/**
 * @description Check if one skill level is higher than another.
 */
export function isHigherLevel(level: SkillLevel, compareTo: SkillLevel): boolean {
  return SKILL_LEVELS.indexOf(level) > SKILL_LEVELS.indexOf(compareTo);
}

