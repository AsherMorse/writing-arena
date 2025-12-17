/**
 * @fileoverview Type definitions for the D&D Conventions Grader.
 * Defines input/output shapes and error types for grammar grading in the D&D adventure game.
 */

/**
 * All grammar categories supported by the GrammarGuard system.
 */
export const GRAMMAR_CATEGORIES = {
  // Spelling and Typos
  TYPOS: 'TYPOS',
  HOMOPHONE_ERROR: 'HOMOPHONE_ERROR',

  // Punctuation and Formatting
  PUNCTUATION: 'PUNCTUATION',
  APOSTROPHE_ERROR: 'APOSTROPHE_ERROR',
  QUOTATION_ERROR: 'QUOTATION_ERROR',
  COLON_SEMICOLON_ERROR: 'COLON_SEMICOLON_ERROR',
  SPACING_ERROR: 'SPACING_ERROR',
  FORMATTING_ERROR: 'FORMATTING_ERROR',
  PUNCTUATION_IN_LISTS: 'PUNCTUATION_IN_LISTS',

  // Grammar Structure
  SENTENCE_FRAGMENT: 'SENTENCE_FRAGMENT',
  RUN_ON_SENTENCE: 'RUN_ON_SENTENCE',
  COMMA_SPLICE: 'COMMA_SPLICE',
  SUBJECT_VERB_AGREEMENT: 'SUBJECT_VERB_AGREEMENT',
  TENSE_CONSISTENCY: 'TENSE_CONSISTENCY',
  MISPLACED_MODIFIER: 'MISPLACED_MODIFIER',
  DANGLING_MODIFIER: 'DANGLING_MODIFIER',
  PARALLELISM_ERROR: 'PARALLELISM_ERROR',
  WORD_ORDER_ERROR: 'WORD_ORDER_ERROR',

  // Word Usage
  CONFUSED_WORDS: 'CONFUSED_WORDS',
  WORD_USAGE_ERROR: 'WORD_USAGE_ERROR',
  PREPOSITION_ERROR: 'PREPOSITION_ERROR',
  ARTICLE_USAGE: 'ARTICLE_USAGE',
  PLURALIZATION_ERROR: 'PLURALIZATION_ERROR',
  VERB_FORM_ERROR: 'VERB_FORM_ERROR',

  // Style and Clarity
  CASING: 'CASING',
  CAPITALIZATION_ERROR: 'CAPITALIZATION_ERROR',
  PASSIVE_VOICE_OVERUSE: 'PASSIVE_VOICE_OVERUSE',
  AWKWARD_PHRASING: 'AWKWARD_PHRASING',
  CLICHE_USAGE: 'CLICHE_USAGE',
  VERBOSITY: 'VERBOSITY',
  AMBIGUOUS_REFERENCE: 'AMBIGUOUS_REFERENCE',
  INCONSISTENT_TONE: 'INCONSISTENT_TONE',

  // Redundancy
  REPETITIONS: 'REPETITIONS',
  REDUNDANCY: 'REDUNDANCY',

  // Logical Errors
  DOUBLE_NEGATIVE: 'DOUBLE_NEGATIVE',
  COMPARISON_ERROR: 'COMPARISON_ERROR',
  UNFINISHED_THOUGHT: 'UNFINISHED_THOUGHT',

  // Miscellaneous
  MISC_GRAMMAR: 'MISC_GRAMMAR',
  COMPOUNDING: 'COMPOUNDING',
  FACTUAL_ERROR: 'FACTUAL_ERROR',

  // Input Quality
  NONSENSE_INPUT: 'NONSENSE_INPUT',
} as const;

export type GrammarCategory = (typeof GRAMMAR_CATEGORIES)[keyof typeof GRAMMAR_CATEGORIES];

/**
 * Severity tiers for grammar errors.
 * Determines HP damage and display priority.
 */
export type ErrorSeverity = 'critical' | 'major' | 'minor' | 'style';

/**
 * Available category presets for different gameplay contexts.
 */
export type CategoryPreset = 'strict' | 'balanced' | 'lenient' | 'fantasy';

/**
 * Input for the D&D conventions grader.
 */
export type DnDGraderInput = {
  /** The student's written response to grade */
  studentResponse: string;
  /** Student's grade level (5-8) */
  gradeLevel: 5 | 6 | 7 | 8;
  /** Which category preset to use for grading */
  categoryPreset: CategoryPreset;
};

/**
 * A single convention error found in student writing.
 */
export type ConventionError = {
  /** Error category (e.g., 'SENTENCE_FRAGMENT') */
  category: GrammarCategory;
  /** Student-friendly explanation of the error */
  explanation: string;
  /** The specific text that has the error */
  substringOfInterest: string;
  /** Suggested correction (optional) */
  potentialFix?: string;
  /** Severity tier for HP calculation */
  severity: ErrorSeverity;
  /** HP damage this error causes (negative value) */
  hpDamage: number;
  /** Display priority (1 = show first) */
  displayPriority: number;
};

/**
 * Result from the D&D conventions grader.
 */
export type DnDGraderResult = {
  /** Whether any errors were found */
  hasErrors: boolean;
  /** Total number of errors found */
  errorCount: number;
  /** Total HP damage (negative value, capped at -10) */
  hpDamage: number;
  /** All errors found in the response */
  allErrors: ConventionError[];
  /** Top 2-3 errors to show to the player (prioritized by severity) */
  prioritizedErrors: ConventionError[];
  /** Combined feedback message for display */
  feedbackSummary: string;
  /** Categories that were checked */
  categoriesChecked: GrammarCategory[];
  /** Timestamp when grading occurred */
  gradeTimestamp: number;
  /** Converted 0-100 score for backward compatibility */
  score: number;
  /** Short feedback strings for backward compatibility */
  feedback: string[];
};

/**
 * Raw match from GrammarGuard.
 */
export type GrammarGuardMatch = {
  /** Unique ID for this error instance */
  issueId?: string;
  /** Student-friendly explanation */
  explanation_of_issue: string;
  /** The problematic text */
  substring_of_interest: string;
  /** Suggested correction */
  potential_corrected_sentence?: string;
  /** Error category */
  category: GrammarCategory;
};

/**
 * Result from GrammarGuard criteria evaluation.
 */
export type GrammarGuardResult = {
  /** Whether the text passed (no errors) */
  correct: boolean;
  /** Description of result */
  response?: string;
  /** Metadata containing the errors */
  metadata?: {
    aiGrammarIssues: GrammarGuardMatch[];
  };
};

