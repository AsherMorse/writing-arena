/**
 * @fileoverview Configuration for the full 3-layer D&D Grader.
 * Contains severity tiers, HP weights, and feedback messages for all layers.
 */

import {
  QUEST_CATEGORIES,
  NARRATIVE_CATEGORIES,
  type QuestCategory,
  type NarrativeCategory,
  type ErrorSeverity,
} from './dnd-grader-types';

// =============================================================================
// LAYER 2: Quest Requirement Configuration
// =============================================================================

/**
 * Severity tiers for Layer 2 categories (all blocking).
 */
export const QUEST_SEVERITY_TIERS: Record<QuestCategory, 'blocking'> = {
  [QUEST_CATEGORIES.GIBBERISH_INPUT]: 'blocking',
  [QUEST_CATEGORIES.NOT_A_PLAYER_ACTION]: 'blocking',
  [QUEST_CATEGORIES.TOO_SHORT]: 'blocking',
  [QUEST_CATEGORIES.OFF_TOPIC]: 'blocking',
  [QUEST_CATEGORIES.INAPPROPRIATE_CONTENT]: 'blocking',
};

/**
 * Default feedback messages for Layer 2 blocking errors.
 */
export const QUEST_FEEDBACK: Record<QuestCategory, string> = {
  [QUEST_CATEGORIES.GIBBERISH_INPUT]:
    "I couldn't understand your response. Please write a clear action for your character.",
  [QUEST_CATEGORIES.NOT_A_PLAYER_ACTION]:
    "Your response should describe what YOUR character does. What action do you take?",
  [QUEST_CATEGORIES.TOO_SHORT]:
    "Your response is too short. Describe your action in more detail.",
  [QUEST_CATEGORIES.OFF_TOPIC]:
    "Let's stay focused on the adventure! What does your character do next?",
  [QUEST_CATEGORIES.INAPPROPRIATE_CONTENT]:
    "That action isn't appropriate for this adventure. Try something heroic instead!",
};

/**
 * Descriptions for Layer 2 categories (used in LLM prompt).
 */
export const QUEST_CATEGORY_DESCRIPTIONS: Record<QuestCategory, string> = {
  [QUEST_CATEGORIES.GIBBERISH_INPUT]:
    'Random characters, keyboard mashing, nonsense words, or text that is not a coherent attempt at writing',
  [QUEST_CATEGORIES.NOT_A_PLAYER_ACTION]:
    'Response describes what NPCs do, narrates events, or is not describing what the player character does',
  [QUEST_CATEGORIES.TOO_SHORT]:
    'Single word or minimal responses that lack substance (already handled by pre-validation)',
  [QUEST_CATEGORIES.OFF_TOPIC]:
    'Response completely unrelated to current quest or scene',
  [QUEST_CATEGORIES.INAPPROPRIATE_CONTENT]:
    'Harmful, excessively violent, sexual, or otherwise inappropriate content',
};

// =============================================================================
// LAYER 3: Narrative Configuration
// =============================================================================

/**
 * Severity tiers for Layer 3 categories.
 */
export const NARRATIVE_SEVERITY_TIERS: Record<NarrativeCategory, 'blocking' | 'warning'> = {
  [NARRATIVE_CATEGORIES.IMPOSSIBLE_ACTION]: 'blocking',
  [NARRATIVE_CATEGORIES.ANACHRONISM]: 'blocking',
  [NARRATIVE_CATEGORIES.PHYSICS_BREAK]: 'blocking',
  [NARRATIVE_CATEGORIES.OUT_OF_CHARACTER]: 'warning',
  [NARRATIVE_CATEGORIES.META_GAMING]: 'warning',
};

/**
 * Default feedback messages for Layer 3 errors.
 */
export const NARRATIVE_FEEDBACK: Record<NarrativeCategory, string> = {
  [NARRATIVE_CATEGORIES.IMPOSSIBLE_ACTION]:
    "That action isn't possible right now. What else could your character try?",
  [NARRATIVE_CATEGORIES.ANACHRONISM]:
    "That doesn't exist in this medieval fantasy world. What would your character actually do?",
  [NARRATIVE_CATEGORIES.PHYSICS_BREAK]:
    "That would be impossible, even for a hero. What else could you try?",
  [NARRATIVE_CATEGORIES.OUT_OF_CHARACTER]:
    "Your character might not have that ability. Try something that fits your class!",
  [NARRATIVE_CATEGORIES.META_GAMING]:
    "Stay in character! Describe what your character does, not game actions.",
};

/**
 * Descriptions for Layer 3 categories (used in LLM prompt).
 */
export const NARRATIVE_CATEGORY_DESCRIPTIONS: Record<NarrativeCategory, string> = {
  [NARRATIVE_CATEGORIES.IMPOSSIBLE_ACTION]:
    'Action physically impossible in the game world (flying without ability, teleporting, etc.)',
  [NARRATIVE_CATEGORIES.ANACHRONISM]:
    'Using technology/concepts that don\'t exist in medieval fantasy (phones, cars, internet)',
  [NARRATIVE_CATEGORIES.PHYSICS_BREAK]:
    'Defying basic physics without magical explanation (walking through walls, lifting mountains)',
  [NARRATIVE_CATEGORIES.OUT_OF_CHARACTER]:
    'Acting against established character abilities or class (mage abilities for a warrior)',
  [NARRATIVE_CATEGORIES.META_GAMING]:
    'Referencing game mechanics or real world inappropriately (rolling dice, saving game, checking inventory menu)',
};

// =============================================================================
// HP DAMAGE CONFIGURATION
// =============================================================================

/**
 * HP damage weights per severity tier (extended for all layers).
 */
export const HP_DAMAGE_WEIGHTS: Record<ErrorSeverity, number> = {
  // Layer 1: Grammar errors
  critical: -4,
  major: -2,
  minor: -1,
  style: -0.5,
  // Layer 2: Quest violations (blocking = no HP damage, must rewrite)
  blocking: 0,
  // Layer 3: Narrative warnings
  warning: -2,
};

/**
 * Specific HP damage for Layer 3 warning categories.
 */
export const NARRATIVE_HP_DAMAGE: Record<NarrativeCategory, number> = {
  [NARRATIVE_CATEGORIES.IMPOSSIBLE_ACTION]: 0, // blocking
  [NARRATIVE_CATEGORIES.ANACHRONISM]: 0, // blocking
  [NARRATIVE_CATEGORIES.PHYSICS_BREAK]: 0, // blocking
  [NARRATIVE_CATEGORIES.OUT_OF_CHARACTER]: -2, // warning
  [NARRATIVE_CATEGORIES.META_GAMING]: -1, // warning (lighter penalty)
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

// =============================================================================
// DISPLAY CONFIGURATION
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

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * @description Get HP damage for a Layer 3 category.
 */
export function getNarrativeHPDamage(category: NarrativeCategory): number {
  return NARRATIVE_HP_DAMAGE[category];
}

/**
 * @description Check if a Layer 3 category is blocking.
 */
export function isBlockingNarrativeError(category: NarrativeCategory): boolean {
  return NARRATIVE_SEVERITY_TIERS[category] === 'blocking';
}

/**
 * @description Get feedback message for a quest error.
 */
export function getQuestFeedback(category: QuestCategory): string {
  return QUEST_FEEDBACK[category];
}

/**
 * @description Get feedback message for a narrative error.
 */
export function getNarrativeFeedback(category: NarrativeCategory): string {
  return NARRATIVE_FEEDBACK[category];
}

