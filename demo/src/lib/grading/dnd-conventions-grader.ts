/**
 * @fileoverview D&D Conventions Grader - Main grading logic.
 * Evaluates student writing for convention errors and returns HP damage.
 */

import Anthropic from "@anthropic-ai/sdk";
import {
  type DnDGraderInput,
  type DnDGraderResult,
  type GrammarGuardMatch,
  type GrammarCategory,
  type CategoryPreset,
} from './dnd-conventions-types';

import {
  GRAMMAR_CATEGORY_PRESETS,
  getDnDGrammarContext,
} from './dnd-conventions-config';

import {
  convertToConventionErrors,
  calculateHPDamage,
  prioritizeErrors,
  formatFeedbackMessage,
  hpDamageToScore,
  errorsToFeedbackStrings,
} from './dnd-conventions-utils';

import {
  buildGrammarGuardPrompt,
  parseGrammarGuardResponse,
} from './grammar-guard-prompt';

const client = new Anthropic();

/**
 * @description Grade a D&D adventure response for convention errors.
 * Returns HP damage, prioritized feedback, and backward-compatible score/feedback.
 *
 * @example
 * ```typescript
 * const result = await gradeDnDResponse({
 *   studentResponse: "I draw my sword because the dragon looks dangerous",
 *   gradeLevel: 6,
 *   categoryPreset: 'fantasy',
 * });
 *
 * console.log(result.hpDamage);          // -2
 * console.log(result.score);             // 80
 * console.log(result.prioritizedErrors); // [{category: 'TYPOS', ...}]
 * ```
 */
export async function gradeDnDResponse(
  input: DnDGraderInput
): Promise<DnDGraderResult> {
  const { studentResponse, gradeLevel, categoryPreset } = input;

  // Validate input
  if (!studentResponse || studentResponse.trim().length === 0) {
    return createEmptyResult([]);
  }

  // Get categories to check based on preset
  const categoriesToCheck = GRAMMAR_CATEGORY_PRESETS[categoryPreset];

  // Get context instructions for the LLM
  const contextInstructions = getDnDGrammarContext(gradeLevel);

  // Build the system prompt
  const systemPrompt = buildGrammarGuardPrompt(categoriesToCheck, contextInstructions);
  const userPrompt = `Please check the following text for grammar and spelling errors:\n\nInput: "${studentResponse.trim()}"`;

  console.log(`🔍 [GrammarGuard] Checking text (${studentResponse.length} chars) with ${categoriesToCheck.length} categories`);

  try {
    // Call Claude API
    const response = await client.messages.create({
      model: "claude-sonnet-4-5-20250929",
      // model: "claude-opus-4-5-20251101",
      max_tokens: 2000,
      temperature: 0,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    });

    const content = response.content[0];
    if (content.type !== "text") {
      return createEmptyResult(categoriesToCheck);
    }

    const responseText = content.text;
    console.log(`📝 [GrammarGuard] Response received`);

    // Parse the response
    const rawMatches: GrammarGuardMatch[] = parseGrammarGuardResponse(
      studentResponse,
      responseText
    );

    // Convert to our error format
    const allErrors = convertToConventionErrors(rawMatches);

    // Calculate HP damage
    const hpDamage = calculateHPDamage(allErrors);

    // Prioritize top 2-3 errors for display
    const prioritizedErrors = prioritizeErrors(allErrors);

    // Generate feedback summary
    const feedbackSummary = formatFeedbackMessage(
      prioritizedErrors,
      allErrors.length
    );

    // Convert to backward-compatible score/feedback
    const score = hpDamageToScore(hpDamage);
    const feedback = errorsToFeedbackStrings(prioritizedErrors);

    console.log(`✅ [GrammarGuard] Found ${allErrors.length} errors, HP: ${hpDamage}, Score: ${score}`);

    return {
      hasErrors: allErrors.length > 0,
      errorCount: allErrors.length,
      hpDamage,
      allErrors,
      prioritizedErrors,
      feedbackSummary,
      categoriesChecked: categoriesToCheck,
      gradeTimestamp: Date.now(),
      score,
      feedback,
    };
  } catch (error) {
    console.error("❌ [GrammarGuard] Error:", error);
    return createEmptyResult(categoriesToCheck);
  }
}

/**
 * @description Create an empty result for cases with no text or errors.
 */
function createEmptyResult(
  categoriesChecked: GrammarCategory[]
): DnDGraderResult {
  return {
    hasErrors: false,
    errorCount: 0,
    hpDamage: 0,
    allErrors: [],
    prioritizedErrors: [],
    feedbackSummary: '✨ Perfect writing! No convention errors found.',
    categoriesChecked,
    gradeTimestamp: Date.now(),
    score: 100,
    feedback: ['Well written!'],
  };
}

// Re-export types and config for convenience
export {
  type DnDGraderInput,
  type DnDGraderResult,
  type ConventionError,
  type GrammarCategory,
  type ErrorSeverity,
  type CategoryPreset,
} from './dnd-conventions-types';

export {
  GRAMMAR_CATEGORY_PRESETS,
  ERROR_SEVERITY_TIERS,
  HP_DAMAGE_WEIGHTS,
  MAX_HP_DAMAGE_PER_TURN,
  STARTING_HP,
} from './dnd-conventions-config';

