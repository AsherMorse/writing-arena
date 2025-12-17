/**
 * @fileoverview Configuration for the D&D Conventions Grader.
 * Contains category presets, severity tiers, and HP damage weights.
 */

import {
  GRAMMAR_CATEGORIES,
  type ErrorSeverity,
  type GrammarCategory,
  type CategoryPreset,
} from './dnd-conventions-types';

/**
 * Category presets for different gameplay contexts.
 * Each preset defines which grammar categories to check.
 */
export const GRAMMAR_CATEGORY_PRESETS: Record<CategoryPreset, GrammarCategory[]> = {
  /**
   * STRICT: All 34 categories enabled.
   */
  strict: Object.values(GRAMMAR_CATEGORIES) as GrammarCategory[],

  /**
   * BALANCED: Focus on structure + major grammar (16 categories).
   */
  balanced: [
    GRAMMAR_CATEGORIES.SENTENCE_FRAGMENT,
    GRAMMAR_CATEGORIES.RUN_ON_SENTENCE,
    GRAMMAR_CATEGORIES.COMMA_SPLICE,
    GRAMMAR_CATEGORIES.SUBJECT_VERB_AGREEMENT,
    GRAMMAR_CATEGORIES.TENSE_CONSISTENCY,
    GRAMMAR_CATEGORIES.CAPITALIZATION_ERROR,
    GRAMMAR_CATEGORIES.PUNCTUATION,
    GRAMMAR_CATEGORIES.APOSTROPHE_ERROR,
    GRAMMAR_CATEGORIES.QUOTATION_ERROR,
    GRAMMAR_CATEGORIES.VERB_FORM_ERROR,
    GRAMMAR_CATEGORIES.MISPLACED_MODIFIER,
    GRAMMAR_CATEGORIES.TYPOS,
    GRAMMAR_CATEGORIES.HOMOPHONE_ERROR,
    GRAMMAR_CATEGORIES.CONFUSED_WORDS,
    GRAMMAR_CATEGORIES.WORD_USAGE_ERROR,
    GRAMMAR_CATEGORIES.PLURALIZATION_ERROR,
  ],

  /**
   * LENIENT: Only critical structure issues (5 categories).
   */
  lenient: [
    GRAMMAR_CATEGORIES.SENTENCE_FRAGMENT,
    GRAMMAR_CATEGORIES.RUN_ON_SENTENCE,
    GRAMMAR_CATEGORIES.COMMA_SPLICE,
    GRAMMAR_CATEGORIES.CAPITALIZATION_ERROR,
    GRAMMAR_CATEGORIES.PUNCTUATION,
  ],

  /**
   * FANTASY: D&D optimized (14 categories).
   */
  fantasy: [
    GRAMMAR_CATEGORIES.SENTENCE_FRAGMENT,
    GRAMMAR_CATEGORIES.RUN_ON_SENTENCE,
    GRAMMAR_CATEGORIES.COMMA_SPLICE,
    GRAMMAR_CATEGORIES.SUBJECT_VERB_AGREEMENT,
    GRAMMAR_CATEGORIES.TENSE_CONSISTENCY,
    GRAMMAR_CATEGORIES.CAPITALIZATION_ERROR,
    GRAMMAR_CATEGORIES.PUNCTUATION,
    GRAMMAR_CATEGORIES.APOSTROPHE_ERROR,
    GRAMMAR_CATEGORIES.QUOTATION_ERROR,
    GRAMMAR_CATEGORIES.VERB_FORM_ERROR,
    GRAMMAR_CATEGORIES.TYPOS,
    GRAMMAR_CATEGORIES.HOMOPHONE_ERROR,
    GRAMMAR_CATEGORIES.CONFUSED_WORDS,
    GRAMMAR_CATEGORIES.NONSENSE_INPUT,
  ],
};

/**
 * Severity tier assignments for all 34 grammar categories.
 */
export const ERROR_SEVERITY_TIERS: Record<GrammarCategory, ErrorSeverity> = {
  // CRITICAL - Breaks sentence structure/meaning (-4 HP each)
  [GRAMMAR_CATEGORIES.SENTENCE_FRAGMENT]: 'critical',
  [GRAMMAR_CATEGORIES.RUN_ON_SENTENCE]: 'critical',
  [GRAMMAR_CATEGORIES.COMMA_SPLICE]: 'critical',
  [GRAMMAR_CATEGORIES.UNFINISHED_THOUGHT]: 'critical',
  [GRAMMAR_CATEGORIES.NONSENSE_INPUT]: 'critical',

  // MAJOR - Significantly affects readability (-2 HP each)
  [GRAMMAR_CATEGORIES.SUBJECT_VERB_AGREEMENT]: 'major',
  [GRAMMAR_CATEGORIES.TENSE_CONSISTENCY]: 'major',
  [GRAMMAR_CATEGORIES.CAPITALIZATION_ERROR]: 'major',
  [GRAMMAR_CATEGORIES.PUNCTUATION]: 'major',
  [GRAMMAR_CATEGORIES.VERB_FORM_ERROR]: 'major',
  [GRAMMAR_CATEGORIES.MISPLACED_MODIFIER]: 'major',
  [GRAMMAR_CATEGORIES.DANGLING_MODIFIER]: 'major',
  [GRAMMAR_CATEGORIES.PARALLELISM_ERROR]: 'major',
  [GRAMMAR_CATEGORIES.HOMOPHONE_ERROR]: 'major',
  [GRAMMAR_CATEGORIES.CONFUSED_WORDS]: 'major',
  [GRAMMAR_CATEGORIES.WORD_ORDER_ERROR]: 'major',
  [GRAMMAR_CATEGORIES.DOUBLE_NEGATIVE]: 'major',

  // MINOR - Noticeable but doesn't break meaning (-1 HP each)
  [GRAMMAR_CATEGORIES.TYPOS]: 'minor',
  [GRAMMAR_CATEGORIES.APOSTROPHE_ERROR]: 'minor',
  [GRAMMAR_CATEGORIES.QUOTATION_ERROR]: 'minor',
  [GRAMMAR_CATEGORIES.COLON_SEMICOLON_ERROR]: 'minor',
  [GRAMMAR_CATEGORIES.SPACING_ERROR]: 'minor',
  [GRAMMAR_CATEGORIES.ARTICLE_USAGE]: 'minor',
  [GRAMMAR_CATEGORIES.PREPOSITION_ERROR]: 'minor',
  [GRAMMAR_CATEGORIES.PLURALIZATION_ERROR]: 'minor',
  [GRAMMAR_CATEGORIES.WORD_USAGE_ERROR]: 'minor',
  [GRAMMAR_CATEGORIES.PUNCTUATION_IN_LISTS]: 'minor',
  [GRAMMAR_CATEGORIES.COMPARISON_ERROR]: 'minor',
  [GRAMMAR_CATEGORIES.AMBIGUOUS_REFERENCE]: 'minor',
  [GRAMMAR_CATEGORIES.FACTUAL_ERROR]: 'minor',

  // STYLE - Pedagogical but not game-breaking (-0.5 HP each)
  [GRAMMAR_CATEGORIES.CASING]: 'style',
  [GRAMMAR_CATEGORIES.PASSIVE_VOICE_OVERUSE]: 'style',
  [GRAMMAR_CATEGORIES.AWKWARD_PHRASING]: 'style',
  [GRAMMAR_CATEGORIES.CLICHE_USAGE]: 'style',
  [GRAMMAR_CATEGORIES.VERBOSITY]: 'style',
  [GRAMMAR_CATEGORIES.REDUNDANCY]: 'style',
  [GRAMMAR_CATEGORIES.REPETITIONS]: 'style',
  [GRAMMAR_CATEGORIES.INCONSISTENT_TONE]: 'style',
  [GRAMMAR_CATEGORIES.FORMATTING_ERROR]: 'style',
  [GRAMMAR_CATEGORIES.MISC_GRAMMAR]: 'style',
  [GRAMMAR_CATEGORIES.COMPOUNDING]: 'style',
};

/**
 * HP damage weights per severity tier.
 */
export const HP_DAMAGE_WEIGHTS: Record<ErrorSeverity, number> = {
  critical: -4,
  major: -2,
  minor: -1,
  style: -0.5,
};

/**
 * Maximum HP damage that can be dealt in a single turn.
 */
export const MAX_HP_DAMAGE_PER_TURN = -10;

/**
 * Maximum number of errors to show in prioritized feedback.
 */
export const MAX_ERRORS_TO_SHOW = 3;

/**
 * Starting HP for a new game/mission.
 */
export const STARTING_HP = 100;

/**
 * Context instruction added to GrammarGuard for D&D responses.
 */
export function getDnDGrammarContext(gradeLevel: number): string {
  return `
This text is from a student playing a D&D-style adventure game.
They are writing what their character does or says in response to a story scene.
Focus on sentence-level conventions only - the creative content itself is fine.
The student is in grade ${gradeLevel}.
Be encouraging but accurate in identifying errors.
  `.trim();
}

/**
 * Severity icons for UI.
 */
export const SEVERITY_ICONS: Record<ErrorSeverity, string> = {
  critical: '🔴',
  major: '🟠',
  minor: '🟡',
  style: '🔵',
};

