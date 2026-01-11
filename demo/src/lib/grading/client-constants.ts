/**
 * @fileoverview Client-safe exports for the grading module.
 * These can be imported in client components without pulling in the Anthropic SDK.
 * 
 * IMPORTANT: This file must NOT import from any file that imports the SDK.
 */

// =============================================================================
// TYPES (re-exported from types files - these are safe)
// =============================================================================

/**
 * Severity tiers for all error types.
 */
export type ErrorSeverity = 'critical' | 'major' | 'minor' | 'style' | 'blocking' | 'warning';

/**
 * Base error structure for all layers.
 * Used by the UI to display grading feedback.
 */
export type GraderError = {
  /** Which layer detected this error */
  layer: 1 | 2 | 3;
  /** Error category identifier */
  category: string;
  /** Student-friendly explanation */
  explanation: string;
  /** Severity tier */
  severity: ErrorSeverity;
  /** HP damage (0 for blocking errors) */
  hpDamage: number;
  /** Display priority (lower = show first) */
  displayPriority: number;
  /** The specific text that has the issue (Layer 1) */
  substringOfInterest?: string;
  /** Suggested fix (Layer 1) */
  potentialFix?: string;
  /** Suggested alternative action (Layer 3) */
  suggestedAlternative?: string;
};

// =============================================================================
// CONSTANTS (client-safe, no SDK dependencies)
// =============================================================================

/**
 * Severity icons for UI display.
 */
export const SEVERITY_ICONS: Record<ErrorSeverity, string> = {
  critical: '🔴',
  major: '🟠',
  minor: '🟡',
  style: '🔵',
  blocking: '❌',
  warning: '⚡',
};

/**
 * Priority order for error display (lower = show first).
 */
export const SEVERITY_PRIORITY: Record<ErrorSeverity, number> = {
  blocking: 0,
  critical: 1,
  warning: 2,
  major: 3,
  minor: 4,
  style: 5,
};

/**
 * HP damage weights per severity tier.
 */
export const HP_DAMAGE_WEIGHTS: Record<ErrorSeverity, number> = {
  critical: -4,
  major: -2,
  minor: -1,
  style: -0.5,
  blocking: 0,
  warning: -2,
};

/**
 * Maximum HP damage that can be dealt in a single turn.
 */
export const MAX_HP_DAMAGE_PER_TURN = -10;

/**
 * Starting HP for a new game/mission.
 */
export const STARTING_HP = 100;

/**
 * Maximum number of errors to show in prioritized feedback.
 */
export const MAX_ERRORS_TO_SHOW = 3;
