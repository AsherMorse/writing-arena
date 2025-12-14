/**
 * @fileoverview Intervention rules and thresholds for skill gap tracking.
 * Defines when to recommend practice, warn, or block based on gap patterns.
 */

/**
 * @description Time windows for gap expiration by severity (in milliseconds).
 * Older occurrences outside these windows don't count toward blocking.
 */
export const TIME_WINDOWS = {
  high: 3 * 24 * 60 * 60 * 1000,    // 3 days
  medium: 5 * 24 * 60 * 60 * 1000,  // 5 days
  low: 7 * 24 * 60 * 60 * 1000,     // 7 days
} as const;

/**
 * @description Intervention rules by severity level.
 * - practiceRecommend: Number of occurrences before recommending practice
 * - rankedWarn: Number of ranked occurrences before showing warning
 * - rankedBlock: Number of ranked occurrences before blocking
 * - mustResolve: Whether gap must be resolved to unblock
 * - timeWindow: Time window for counting occurrences
 */
export const INTERVENTION_RULES = {
  high: {
    practiceRecommend: 1,
    rankedWarn: 1,
    rankedBlock: 1,
    mustResolve: true,
    timeWindow: TIME_WINDOWS.high,
  },
  medium: {
    practiceRecommend: 1,
    rankedWarn: 2,
    rankedBlock: 3,
    mustResolve: true,
    timeWindow: TIME_WINDOWS.medium,
  },
  low: {
    practiceRecommend: 2,
    rankedWarn: 2,
    rankedBlock: 4,
    mustResolve: false,
    timeWindow: TIME_WINDOWS.low,
  },
} as const;

/**
 * @description Maximum number of occurrences to store per criterion.
 * Prevents unbounded growth of the occurrences array.
 */
export const MAX_OCCURRENCES_STORED = 20;

/**
 * @description Mastery threshold for resolving gaps (90%).
 */
// export const GAP_RESOLUTION_MASTERY_THRESHOLD = 0.9;
