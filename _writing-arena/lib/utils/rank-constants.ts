/**
 * @fileoverview Constants for the skill-based rank system.
 * Defines LP thresholds, caps, and other progression values.
 */

/** Maximum LP within a tier (triggers promotion) */
export const TIER_LP_CAP = 100;

/** Starting LP when entering a new tier */
export const TIER_LP_START = 65;

/** Minimum LP change per submission (floor for losses) */
export const LP_MIN = -15;

/** Maximum LP change per submission (cap for gains) */
export const LP_MAX = 20;

/** Base LP awarded for hitting exactly the threshold */
export const LP_BASE = 10;

/** Weight of revised score in effective score calculation (10%) */
export const REVISION_WEIGHT = 0.1;

/** Multiplier for practice mode LP (25% of ranked) */
export const PRACTICE_LP_MULTIPLIER = 0.25;

/** Flat LP bonus for mastering a lesson */
export const LESSON_MASTERY_LP = 5;

/**
 * Score thresholds required for each tier.
 * T3 = 70%, T2 = 80%, T1 = 90%
 */
export const THRESHOLDS = {
  3: 70,
  2: 80,
  1: 90,
} as const;

/**
 * Skill levels in progression order (lowest to highest).
 */
export const SKILL_LEVELS = ['scribe', 'scholar', 'loremaster'] as const;

/**
 * Roman numeral display for tiers.
 */
export const TIER_DISPLAY = {
  1: 'I',
  2: 'II',
  3: 'III',
} as const;
