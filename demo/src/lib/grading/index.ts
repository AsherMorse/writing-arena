/**
 * @fileoverview D&D Grading Module - Main Exports
 * Exports the full 3-layer grading system and Layer 1-only for backward compatibility.
 * 
 * ⚠️ WARNING: This module imports the Anthropic SDK and should only be used in
 * server components/API routes. For client components, import from:
 * `@/lib/grading/client-constants`
 */

// =============================================================================
// MAIN API: 3-Layer Grader
// =============================================================================

export {
  // Main function
  gradeDnDTurn,
  // Layer 1 only (backward compatible)
  gradeDnDResponse,
  // Pre-validation
  preValidateResponse,
  // Types
  type DnDGraderInput,
  type DnDGraderResult,
  type GraderError,
  type ConventionError,
  type QuestError,
  type NarrativeError,
  type NarrativeContext,
  type GameTurnResult,
  // Categories
  QUEST_CATEGORIES,
  NARRATIVE_CATEGORIES,
  // Config
  QUEST_SEVERITY_TIERS,
  NARRATIVE_SEVERITY_TIERS,
  HP_DAMAGE_WEIGHTS,
  MAX_HP_DAMAGE_PER_TURN,
  STARTING_HP,
} from './dnd-grader';

// =============================================================================
// LAYER 1: Grammar/Conventions (for direct access)
// =============================================================================

export {
  GRAMMAR_CATEGORIES,
  type GrammarCategory,
  type ErrorSeverity,
  type CategoryPreset,
} from './dnd-conventions-types';

export {
  GRAMMAR_CATEGORY_PRESETS,
  ERROR_SEVERITY_TIERS,
} from './dnd-conventions-config';

export {
  SEVERITY_ICONS,
} from './dnd-grader-config';

export {
  getErrorSeverity,
  prioritizeErrors,
  formatFeedbackMessage,
  hpDamageToScore,
  errorsToFeedbackStrings,
} from './dnd-conventions-utils';

// =============================================================================
// LAYER 2: Quest Requirements
// =============================================================================

export { type QuestCategory } from './dnd-grader-types';

export {
  QUEST_FEEDBACK,
  QUEST_CATEGORY_DESCRIPTIONS,
  getQuestFeedback,
} from './dnd-grader-config';

// =============================================================================
// LAYER 3: Narrative Appropriateness
// =============================================================================

export { type NarrativeCategory } from './dnd-grader-types';

export {
  NARRATIVE_FEEDBACK,
  NARRATIVE_CATEGORY_DESCRIPTIONS,
  NARRATIVE_HP_DAMAGE,
  getNarrativeFeedback,
  getNarrativeHPDamage,
  isBlockingNarrativeError,
} from './dnd-grader-config';

// =============================================================================
// UTILITIES
// =============================================================================

export {
  isLikelyGibberish,
  type PreValidationResult,
  type PreValidationConfig,
} from './layers/pre-validation';

export {
  buildCombinedSystemPrompt,
  buildUserPrompt,
} from './layers/combined-prompt';

export {
  parseCombinedResponse,
  isNoErrorsResponse,
} from './layers/response-parser';
