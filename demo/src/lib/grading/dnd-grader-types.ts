/**
 * @fileoverview Type definitions for the full 3-layer D&D Grader.
 * Extends the conventions types with Layer 2 (Quest) and Layer 3 (Narrative) support.
 */

import type {
  GrammarCategory,
  ConventionError,
  ErrorSeverity as Layer1Severity,
  CategoryPreset,
} from './dnd-conventions-types';

// Re-export Layer 1 types for convenience
export type { GrammarCategory, ConventionError, CategoryPreset };

// =============================================================================
// LAYER 2: Quest Requirement Categories
// =============================================================================

/**
 * Categories for Layer 2 (Quest Requirements) - all blocking.
 */
export const QUEST_CATEGORIES = {
  GIBBERISH_INPUT: 'GIBBERISH_INPUT',
  NOT_A_PLAYER_ACTION: 'NOT_A_PLAYER_ACTION',
  TOO_SHORT: 'TOO_SHORT',
  OFF_TOPIC: 'OFF_TOPIC',
  INAPPROPRIATE_CONTENT: 'INAPPROPRIATE_CONTENT',
} as const;

export type QuestCategory = (typeof QUEST_CATEGORIES)[keyof typeof QUEST_CATEGORIES];

// =============================================================================
// LAYER 3: Narrative Appropriateness Categories
// =============================================================================

/**
 * Categories for Layer 3 (Narrative Appropriateness).
 */
export const NARRATIVE_CATEGORIES = {
  IMPOSSIBLE_ACTION: 'IMPOSSIBLE_ACTION',
  ANACHRONISM: 'ANACHRONISM',
  OUT_OF_CHARACTER: 'OUT_OF_CHARACTER',
  PHYSICS_BREAK: 'PHYSICS_BREAK',
  META_GAMING: 'META_GAMING',
} as const;

export type NarrativeCategory = (typeof NARRATIVE_CATEGORIES)[keyof typeof NARRATIVE_CATEGORIES];

// =============================================================================
// SEVERITY TYPES
// =============================================================================

/**
 * Extended severity types including blocking and warning.
 */
export type ErrorSeverity = Layer1Severity | 'blocking' | 'warning';

// =============================================================================
// ERROR TYPES
// =============================================================================

/**
 * Base error structure for all layers.
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
};

/**
 * Layer 2: Quest Requirement Error (always blocking).
 */
export type QuestError = GraderError & {
  layer: 2;
  severity: 'blocking';
  category: QuestCategory;
};

/**
 * Layer 3: Narrative Appropriateness Error.
 */
export type NarrativeError = GraderError & {
  layer: 3;
  severity: 'blocking' | 'warning';
  category: NarrativeCategory;
  /** Suggested alternative action */
  suggestedAlternative?: string;
};

// =============================================================================
// NARRATIVE CONTEXT
// =============================================================================

/**
 * Game context required for Layer 2/3 evaluation.
 */
export type NarrativeContext = {
  // Current scene
  /** Current location name (e.g., "Dragon's Lair") */
  currentLocation: string;
  /** Description of the current scene */
  sceneDescription: string;
  /** Available exits/directions */
  availableExits?: string[];
  /** NPCs present in the scene */
  npcsPresent?: string[];

  // Character info (for OUT_OF_CHARACTER checks)
  /** Character class (e.g., "Warrior", "Mage", "Rogue") */
  characterClass?: string;
  /** Character abilities/skills */
  characterAbilities?: string[];
  /** Items the character has */
  inventoryItems?: string[];

  // Quest state
  /** Current objective */
  currentObjective?: string;
  /** Any constraints (e.g., "must not harm villagers") */
  questConstraints?: string[];

  // Story context
  /** Summary of recent story events (what has happened so far) */
  recentStorySummary?: string;
  /** Last 1-2 AI narrative responses for immediate context about visible items */
  recentNarrative?: string[];
};

// =============================================================================
// INPUT TYPES
// =============================================================================

/**
 * Input for the full 3-layer D&D grader.
 */
export type DnDGraderInput = {
  /** The student's written response */
  studentResponse: string;
  /** Student's grade level (5-8) */
  gradeLevel: 5 | 6 | 7 | 8;
  /** Which category preset to use for Layer 1 */
  categoryPreset: CategoryPreset;
  /** Game context for Layer 2/3 evaluation */
  gameContext: NarrativeContext;
  /** Previous responses (for duplicate detection) */
  previousResponses?: string[];
};

/**
 * Input for Layer 1 only (backward compatible).
 */
export type Layer1OnlyInput = Omit<DnDGraderInput, 'gameContext' | 'previousResponses'>;

// =============================================================================
// OUTPUT TYPES
// =============================================================================

/**
 * Result from the full 3-layer D&D grader.
 */
export type DnDGraderResult = {
  // Overall result
  /** Whether the turn was accepted (not blocked) */
  accepted: boolean;
  /** Why the turn was rejected (if blocked) */
  blockingReason?: string;

  // HP impact (only meaningful if accepted)
  /** HP damage from accepted turn (negative value, 0 if blocked) */
  hpDamage: number;

  // Errors by layer
  /** Layer 1: Grammar/convention errors */
  layer1Errors: ConventionError[];
  /** Layer 2: Quest requirement violations */
  layer2Errors: QuestError[];
  /** Layer 3: Narrative appropriateness issues */
  layer3Errors: NarrativeError[];

  // Combined errors
  /** All errors combined (sorted by priority) */
  allErrors: GraderError[];
  /** Top 2-3 errors to show */
  prioritizedErrors: GraderError[];

  // Feedback
  /** Combined feedback message for display */
  feedbackSummary: string;

  // Metadata
  /** Timestamp when grading occurred */
  gradeTimestamp: number;
  /** How the response was evaluated */
  evaluationMethod: 'prevalidation' | 'llm';

  // Backward compatibility
  /** Whether any errors were found */
  hasErrors: boolean;
  /** Total error count */
  errorCount: number;
  /** 0-100 score for backward compatibility */
  score: number;
  /** Short feedback strings */
  feedback: string[];
};

// =============================================================================
// LLM RESPONSE TYPES
// =============================================================================

/**
 * Raw Layer 1 error from LLM response.
 */
export type RawLayer1Error = {
  category: string;
  explanation: string;
  substring: string;
  fix?: string;
};

/**
 * Raw Layer 2 result from LLM response.
 */
export type RawLayer2Result = {
  valid: boolean;
  error?: {
    category: string;
    explanation: string;
  };
};

/**
 * Raw Layer 3 error from LLM response.
 */
export type RawLayer3Error = {
  category: string;
  explanation: string;
  suggestion?: string;
};

/**
 * Combined LLM response structure.
 */
export type CombinedLLMResponse = {
  layer1: {
    errors: RawLayer1Error[];
  };
  layer2: RawLayer2Result;
  layer3: {
    errors: RawLayer3Error[];
  };
};

/**
 * Parsed result from combined LLM evaluation.
 */
export type LLMEvaluationResult = {
  layer1Errors: ConventionError[];
  layer2Error: QuestError | null;
  layer3Errors: NarrativeError[];
};

// =============================================================================
// GAME INTEGRATION TYPES
// =============================================================================

/**
 * Result of a game turn including HP changes.
 */
export type GameTurnResult = {
  /** Player's written response */
  playerText: string;
  /** Grading result */
  gradeResult: DnDGraderResult;
  /** HP before this turn */
  hpBefore: number;
  /** HP after this turn */
  hpAfter: number;
  /** HP change (negative for damage) */
  hpChange: number;
  /** Story continuation (only if accepted) */
  narrativeContinuation?: string;
  /** Feedback to show if blocked */
  blockFeedback?: string;
  /** Timestamp */
  timestamp: number;
};

