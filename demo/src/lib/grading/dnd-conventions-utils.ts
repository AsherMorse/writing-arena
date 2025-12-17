/**
 * @fileoverview Utility functions for the D&D Conventions Grader.
 * Handles error prioritization, HP calculation, and feedback formatting.
 */

import {
  type ConventionError,
  type ErrorSeverity,
  type GrammarCategory,
  type GrammarGuardMatch,
} from './dnd-conventions-types';

import {
  ERROR_SEVERITY_TIERS,
  HP_DAMAGE_WEIGHTS,
  MAX_HP_DAMAGE_PER_TURN,
  MAX_ERRORS_TO_SHOW,
  SEVERITY_ICONS,
} from './dnd-conventions-config';

/**
 * @description Get the severity tier for a grammar category.
 */
export function getErrorSeverity(category: GrammarCategory): ErrorSeverity {
  return ERROR_SEVERITY_TIERS[category] || 'minor';
}

/**
 * @description Get HP damage for a severity tier.
 */
export function getHPDamageForSeverity(severity: ErrorSeverity): number {
  return HP_DAMAGE_WEIGHTS[severity];
}

/**
 * @description Calculate total HP damage from a list of errors.
 * Capped at MAX_HP_DAMAGE_PER_TURN.
 */
export function calculateHPDamage(errors: ConventionError[]): number {
  if (errors.length === 0) return 0;

  let totalDamage = 0;
  for (const error of errors) {
    totalDamage += error.hpDamage;
  }

  return Math.max(MAX_HP_DAMAGE_PER_TURN, totalDamage);
}

/**
 * @description Convert GrammarGuard matches to ConventionError format.
 */
export function convertToConventionErrors(
  matches: GrammarGuardMatch[]
): ConventionError[] {
  return matches.map((match, index) => {
    const severity = getErrorSeverity(match.category);
    const hpDamage = getHPDamageForSeverity(severity);

    return {
      category: match.category,
      explanation: match.explanation_of_issue,
      substringOfInterest: match.substring_of_interest,
      potentialFix: match.potential_corrected_sentence,
      severity,
      hpDamage,
      displayPriority: index + 1,
    };
  });
}

/**
 * @description Sort errors by severity and return top N.
 */
export function prioritizeErrors(
  errors: ConventionError[],
  maxToShow: number = MAX_ERRORS_TO_SHOW
): ConventionError[] {
  const severityOrder: Record<ErrorSeverity, number> = {
    critical: 0,
    major: 1,
    minor: 2,
    style: 3,
  };

  const sorted = [...errors].sort((a, b) => {
    return severityOrder[a.severity] - severityOrder[b.severity];
  });

  return sorted.slice(0, maxToShow).map((error, index) => ({
    ...error,
    displayPriority: index + 1,
  }));
}

/**
 * @description Format category name for human-readable display.
 */
export function formatCategoryName(category: GrammarCategory): string {
  const nameMap: Partial<Record<GrammarCategory, string>> = {
    SENTENCE_FRAGMENT: 'Fragment',
    RUN_ON_SENTENCE: 'Run-on',
    COMMA_SPLICE: 'Comma Splice',
    SUBJECT_VERB_AGREEMENT: 'Subject-Verb',
    TENSE_CONSISTENCY: 'Tense',
    CAPITALIZATION_ERROR: 'Capitalization',
    PUNCTUATION: 'Punctuation',
    APOSTROPHE_ERROR: 'Apostrophe',
    QUOTATION_ERROR: 'Quotation',
    VERB_FORM_ERROR: 'Verb Form',
    TYPOS: 'Spelling',
    HOMOPHONE_ERROR: 'Homophone',
    CONFUSED_WORDS: 'Word Choice',
    WORD_USAGE_ERROR: 'Word Usage',
    MISPLACED_MODIFIER: 'Modifier',
    NONSENSE_INPUT: 'Invalid Input',
  };

  return nameMap[category] || category
    .split('_')
    .map(word => word.charAt(0) + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * @description Format a single error for display.
 */
export function formatSingleError(error: ConventionError): string {
  const icon = SEVERITY_ICONS[error.severity];
  const categoryDisplay = formatCategoryName(error.category);
  return `${icon} **${categoryDisplay}**: ${error.explanation}`;
}

/**
 * @description Format multiple errors into a feedback summary.
 */
export function formatFeedbackMessage(
  errors: ConventionError[],
  totalErrors: number = errors.length
): string {
  if (errors.length === 0) {
    return '✨ Perfect writing! No convention errors found.';
  }

  const lines = errors.map(error => formatSingleError(error));

  const hiddenCount = totalErrors - errors.length;
  if (hiddenCount > 0) {
    lines.push(`(+${hiddenCount} more ${hiddenCount === 1 ? 'issue' : 'issues'})`);
  }

  return lines.join('\n\n');
}

/**
 * @description Convert HP damage to 0-100 score for backward compatibility.
 * -10 HP = 0 score, 0 HP = 100 score
 */
export function hpDamageToScore(hpDamage: number): number {
  // hpDamage is negative (e.g., -4, -8, -10)
  // Map -10 to 0, -0 to 100
  const normalizedDamage = Math.abs(hpDamage);
  const score = Math.round(100 - (normalizedDamage * 10));
  return Math.max(0, Math.min(100, score));
}

/**
 * @description Convert errors to short feedback strings for backward compatibility.
 */
export function errorsToFeedbackStrings(errors: ConventionError[]): string[] {
  if (errors.length === 0) {
    return ['Well written!'];
  }
  return errors.slice(0, 3).map(e => formatCategoryName(e.category));
}

