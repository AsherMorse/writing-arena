/**
 * @fileoverview Main entry point for the 3-layer D&D Grader.
 * Combines pre-validation, LLM evaluation, and HP calculation.
 */

import Anthropic from '@anthropic-ai/sdk';

import type {
  DnDGraderInput,
  DnDGraderResult,
  GraderError,
  ConventionError,
  QuestError,
  NarrativeError,
  Layer1OnlyInput,
} from './dnd-grader-types';

import { GRAMMAR_CATEGORY_PRESETS } from './dnd-conventions-config';

import {
  MAX_HP_DAMAGE_PER_TURN,
  MAX_ERRORS_TO_SHOW,
  SEVERITY_PRIORITY,
  SEVERITY_ICONS,
  getQuestFeedback,
} from './dnd-grader-config';

import { preValidateResponse } from './layers/pre-validation';
import { buildCombinedSystemPrompt, buildUserPrompt } from './layers/combined-prompt';
import { parseCombinedResponse } from './layers/response-parser';

// Import Layer 1 grader for backward compatibility
import { gradeDnDResponse as gradeLayer1Only } from './dnd-conventions-grader';

const client = new Anthropic();

// =============================================================================
// MAIN API
// =============================================================================

/**
 * @description Grade a D&D adventure response across all 3 layers.
 * Returns whether turn is accepted, HP damage, and prioritized feedback.
 *
 * @example
 * ```typescript
 * const result = await gradeDnDTurn({
 *   studentResponse: "I draw my sword and approach the dragon carefully.",
 *   gradeLevel: 6,
 *   categoryPreset: 'fantasy',
 *   gameContext: {
 *     currentLocation: "Dragon's Lair",
 *     sceneDescription: "A massive red dragon blocks your path...",
 *     characterClass: "Warrior",
 *     characterAbilities: ["sword fighting", "shield block"],
 *   },
 * });
 *
 * if (result.accepted) {
 *   console.log('HP damage:', result.hpDamage);  // -2
 *   // Continue with narrative
 * } else {
 *   console.log('Blocked:', result.blockingReason);
 *   // Prompt for rewrite
 * }
 * ```
 */
export async function gradeDnDTurn(
  input: DnDGraderInput
): Promise<DnDGraderResult> {
  const {
    studentResponse,
    gradeLevel,
    categoryPreset,
    gameContext,
    previousResponses = [],
  } = input;

  // STEP 1: Pre-validation (programmatic checks)
  const preCheck = preValidateResponse(studentResponse, {
    minWordCount: 3,
    previousResponses,
  });

  if (!preCheck.valid) {
    console.log(`❌ [DnDGrader] Pre-validation failed: ${preCheck.reason}`);
    return createBlockedResult({
      category: preCheck.category!,
      explanation: preCheck.feedback!,
      reason: preCheck.reason!,
      evaluationMethod: 'prevalidation',
    });
  }

  // STEP 2: LLM evaluation (all 3 layers)
  const grammarCategories = GRAMMAR_CATEGORY_PRESETS[categoryPreset];

  const systemPrompt = buildCombinedSystemPrompt({
    context: gameContext,
    gradeLevel,
    grammarCategories,
  });

  const userPrompt = buildUserPrompt(studentResponse);

  // console.log('systemPrompt', systemPrompt);
  // console.log('userPrompt', userPrompt);
  console.log(`🤖 [DnDGrader] Calling LLM for 3-layer evaluation...`);

  try {
    const response = await client.messages.create({
      model: 'claude-opus-4-5-20251101',
      // model: 'claude-sonnet-4-5-20250929',
      max_tokens: 2500,
      temperature: 0,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      console.error('[DnDGrader] Unexpected response type');
      return createEmptyAcceptedResult(grammarCategories);
    }

    // STEP 3: Parse the response
    const llmResult = parseCombinedResponse(content.text);

    // STEP 4: Check for blocking errors (Layer 2)
    if (llmResult.layer2Error) {
      console.log(`❌ [DnDGrader] Layer 2 blocking: ${llmResult.layer2Error.category}`);
      return createBlockedResultFromLayer2(llmResult, grammarCategories);
    }

    // STEP 5: Check for blocking errors (Layer 3)
    const blockingLayer3 = llmResult.layer3Errors.find(e => e.severity === 'blocking');
    if (blockingLayer3) {
      console.log(`❌ [DnDGrader] Layer 3 blocking: ${blockingLayer3.category}`);
      return createBlockedResultFromLayer3(blockingLayer3, llmResult, grammarCategories);
    }

    // STEP 6: Calculate HP damage from non-blocking errors
    const allErrors = combineErrors(llmResult);
    const hpDamage = calculateHPDamage(allErrors);
    const prioritizedErrors = prioritizeErrors(allErrors);
    const feedbackSummary = formatFeedbackSummary(prioritizedErrors, allErrors.length);

    // console.log(
    //   `✅ [DnDGrader] Accepted - L1: ${llmResult.layer1Errors.length} errors, ` +
    //   `L3 warnings: ${llmResult.layer3Errors.length}, HP: ${hpDamage}`
    // );

    return {
      accepted: true,
      hpDamage,
      layer1Errors: llmResult.layer1Errors,
      layer2Errors: [],
      layer3Errors: llmResult.layer3Errors,
      allErrors,
      prioritizedErrors,
      feedbackSummary,
      gradeTimestamp: Date.now(),
      evaluationMethod: 'llm',
      hasErrors: allErrors.length > 0,
      errorCount: allErrors.length,
      score: hpDamageToScore(hpDamage),
      feedback: prioritizedErrors.map(e => e.explanation),
    };
  } catch (error) {
    console.error('❌ [DnDGrader] LLM error:', error);
    // On LLM failure, return an accepted result with no errors
    // (fail open - don't block the game)
    return createEmptyAcceptedResult(grammarCategories);
  }
}

/**
 * @description Grade for conventions only (Layer 1).
 * Use gradeDnDTurn for full 3-layer evaluation.
 * Maintained for backward compatibility.
 */
export async function gradeDnDResponse(
  input: Layer1OnlyInput
): Promise<DnDGraderResult> {
  const layer1Result = await gradeLayer1Only(input);

  // Convert Layer 1 result to full DnDGraderResult format
  return {
    accepted: true,
    hpDamage: layer1Result.hpDamage,
    layer1Errors: layer1Result.allErrors,
    layer2Errors: [],
    layer3Errors: [],
    allErrors: layer1Result.allErrors.map(e => ({ ...e, layer: 1 as const })),
    prioritizedErrors: layer1Result.prioritizedErrors.map(e => ({ ...e, layer: 1 as const })),
    feedbackSummary: layer1Result.feedbackSummary,
    gradeTimestamp: layer1Result.gradeTimestamp,
    evaluationMethod: 'llm',
    hasErrors: layer1Result.hasErrors,
    errorCount: layer1Result.errorCount,
    score: layer1Result.score,
    feedback: layer1Result.feedback,
  };
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Combine errors from all layers into a single sorted array.
 */
function combineErrors(result: {
  layer1Errors: ConventionError[];
  layer2Error: QuestError | null;
  layer3Errors: NarrativeError[];
}): GraderError[] {
  const errors: GraderError[] = [];

  // Add Layer 1 errors
  for (const e of result.layer1Errors) {
    errors.push({ ...e, layer: 1 });
  }

  // Add Layer 2 error (if present)
  if (result.layer2Error) {
    errors.push(result.layer2Error);
  }

  // Add Layer 3 errors
  for (const e of result.layer3Errors) {
    errors.push(e);
  }

  // Sort by priority
  return errors.sort((a, b) => a.displayPriority - b.displayPriority);
}

/**
 * Calculate total HP damage from errors (capped).
 */
function calculateHPDamage(errors: GraderError[]): number {
  let total = 0;

  for (const error of errors) {
    // Blocking errors don't contribute HP damage
    if (error.severity !== 'blocking') {
      total += error.hpDamage;
    }
  }

  return Math.max(MAX_HP_DAMAGE_PER_TURN, total);
}

/**
 * Prioritize and limit errors for display.
 */
function prioritizeErrors(
  errors: GraderError[],
  maxToShow: number = MAX_ERRORS_TO_SHOW
): GraderError[] {
  // Already sorted by priority
  return errors.slice(0, maxToShow).map((e, i) => ({
    ...e,
    displayPriority: i + 1,
  }));
}

/**
 * Format errors into a feedback summary string.
 */
function formatFeedbackSummary(
  prioritizedErrors: GraderError[],
  totalErrors: number
): string {
  if (prioritizedErrors.length === 0) {
    return '✨ Perfect writing! No errors found.';
  }

  const lines = prioritizedErrors.map(error => {
    const icon = SEVERITY_ICONS[error.severity];
    return `${icon} ${error.explanation}`;
  });

  const hidden = totalErrors - prioritizedErrors.length;
  if (hidden > 0) {
    lines.push(`(+${hidden} more ${hidden === 1 ? 'issue' : 'issues'})`);
  }

  return lines.join('\n\n');
}

/**
 * Convert HP damage to 0-100 score.
 */
function hpDamageToScore(hpDamage: number): number {
  const normalized = Math.abs(hpDamage);
  const score = Math.round(100 - normalized * 10);
  return Math.max(0, Math.min(100, score));
}

// =============================================================================
// RESULT BUILDERS
// =============================================================================

/**
 * Create a blocked result from pre-validation failure.
 */
function createBlockedResult(options: {
  category: string;
  explanation: string;
  reason: string;
  evaluationMethod: 'prevalidation' | 'llm';
}): DnDGraderResult {
  const error: QuestError = {
    layer: 2,
    category: options.category as QuestError['category'],
    explanation: options.explanation,
    severity: 'blocking',
    hpDamage: 0,
    displayPriority: 0,
  };

  return {
    accepted: false,
    blockingReason: '', // No suggestion for prevalidation errors
    hpDamage: 0,
    layer1Errors: [],
    layer2Errors: [error],
    layer3Errors: [],
    allErrors: [error],
    prioritizedErrors: [error],
    feedbackSummary: `❌ ${options.explanation}`,
    gradeTimestamp: Date.now(),
    evaluationMethod: options.evaluationMethod,
    hasErrors: true,
    errorCount: 1,
    score: 0,
    feedback: [options.explanation],
  };
}

/**
 * Create a blocked result from Layer 2 error.
 */
function createBlockedResultFromLayer2(
  llmResult: {
    layer1Errors: ConventionError[];
    layer2Error: QuestError | null;
    layer3Errors: NarrativeError[];
  },
  categoriesChecked: string[]
): DnDGraderResult {
  // We only call this function when layer2Error exists, so assert non-null
  const error = llmResult.layer2Error!;

  return {
    accepted: false,
    blockingReason: '', // No suggestion for layer 2 errors
    hpDamage: 0,
    layer1Errors: llmResult.layer1Errors,
    layer2Errors: [error],
    layer3Errors: llmResult.layer3Errors,
    allErrors: combineErrors(llmResult),
    prioritizedErrors: [error],
    feedbackSummary: `❌ ${error.explanation}`,
    gradeTimestamp: Date.now(),
    evaluationMethod: 'llm',
    hasErrors: true,
    errorCount: 1,
    score: 0,
    feedback: [error.explanation],
  };
}

/**
 * Create a blocked result from Layer 3 blocking error.
 */
function createBlockedResultFromLayer3(
  blockingError: NarrativeError,
  llmResult: {
    layer1Errors: ConventionError[];
    layer2Error: QuestError | null;
    layer3Errors: NarrativeError[];
  },
  categoriesChecked: string[]
): DnDGraderResult {
  // Put suggestion in blockingReason (shown as msg.content)
  // Put explanation in feedback array (shown as msg.feedback)
  const suggestion = blockingError.suggestedAlternative
    ? `💡 ${blockingError.suggestedAlternative}`
    : '';

  return {
    accepted: false,
    blockingReason: suggestion,
    hpDamage: 0,
    layer1Errors: llmResult.layer1Errors,
    layer2Errors: [],
    layer3Errors: llmResult.layer3Errors,
    allErrors: combineErrors(llmResult),
    prioritizedErrors: [blockingError],
    feedbackSummary: `❌ ${blockingError.explanation}`,
    gradeTimestamp: Date.now(),
    evaluationMethod: 'llm',
    hasErrors: true,
    errorCount: 1,
    score: 0,
    feedback: [blockingError.explanation],
  };
}

/**
 * Create an empty accepted result (used when LLM fails).
 */
function createEmptyAcceptedResult(categoriesChecked: string[]): DnDGraderResult {
  return {
    accepted: true,
    hpDamage: 0,
    layer1Errors: [],
    layer2Errors: [],
    layer3Errors: [],
    allErrors: [],
    prioritizedErrors: [],
    feedbackSummary: '✨ Perfect writing! No errors found.',
    gradeTimestamp: Date.now(),
    evaluationMethod: 'llm',
    hasErrors: false,
    errorCount: 0,
    score: 100,
    feedback: ['Well written!'],
  };
}

// =============================================================================
// EXPORTS
// =============================================================================

// Re-export types
export type {
  DnDGraderInput,
  DnDGraderResult,
  GraderError,
  ConventionError,
  QuestError,
  NarrativeError,
  NarrativeContext,
  GameTurnResult,
} from './dnd-grader-types';

// Re-export Layer 2/3 categories
export { QUEST_CATEGORIES, NARRATIVE_CATEGORIES } from './dnd-grader-types';

// Re-export config
export {
  QUEST_SEVERITY_TIERS,
  NARRATIVE_SEVERITY_TIERS,
  HP_DAMAGE_WEIGHTS,
  MAX_HP_DAMAGE_PER_TURN,
  STARTING_HP,
} from './dnd-grader-config';

// Re-export pre-validation
export { preValidateResponse } from './layers/pre-validation';

