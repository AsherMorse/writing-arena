/**
 * @fileoverview Parser for combined LLM responses.
 * Converts raw LLM JSON output into structured error objects for all 3 layers.
 */

import type {
  ConventionError,
  QuestError,
  NarrativeError,
  CombinedLLMResponse,
  LLMEvaluationResult,
  GrammarCategory,
  QuestCategory,
  NarrativeCategory,
} from '../dnd-grader-types';

import { QUEST_CATEGORIES, NARRATIVE_CATEGORIES } from '../dnd-grader-types';

import {
  ERROR_SEVERITY_TIERS,
  HP_DAMAGE_WEIGHTS,
} from '../dnd-conventions-config';

import {
  QUEST_SEVERITY_TIERS,
  QUEST_FEEDBACK,
  NARRATIVE_SEVERITY_TIERS,
  NARRATIVE_HP_DAMAGE,
  NARRATIVE_FEEDBACK,
  SEVERITY_PRIORITY,
} from '../dnd-grader-config';

/**
 * @description Parse the combined LLM response into structured errors.
 *
 * @example
 * ```typescript
 * const result = parseCombinedResponse(llmJsonString);
 * // {
 * //   layer1Errors: [...],
 * //   layer2Error: null,
 * //   layer3Errors: [...]
 * // }
 * ```
 */
export function parseCombinedResponse(
  llmOutput: string
): LLMEvaluationResult {
  // Handle empty response
  if (!llmOutput || !llmOutput.trim()) {
    return createEmptyResult();
  }

  try {
    // Extract JSON from response (handle markdown code blocks)
    const jsonString = extractJSON(llmOutput);
    const parsed: CombinedLLMResponse = JSON.parse(jsonString);

    // Validate structure
    if (!validateResponseStructure(parsed)) {
      console.warn('[ResponseParser] Invalid response structure, returning empty result');
      return createEmptyResult();
    }

    // Parse each layer
    const layer1Errors = parseLayer1Errors(parsed.layer1?.errors || []);
    const layer2Error = parseLayer2Error(parsed.layer2);
    const layer3Errors = parseLayer3Errors(parsed.layer3?.errors || []);

    return {
      layer1Errors,
      layer2Error,
      layer3Errors,
    };
  } catch (error) {
    console.error('[ResponseParser] Failed to parse LLM response:', error);
    console.error('[ResponseParser] Raw output:', llmOutput.slice(0, 500));
    return createEmptyResult();
  }
}

// =============================================================================
// LAYER PARSERS
// =============================================================================

/**
 * Parse Layer 1 (Grammar) errors.
 */
function parseLayer1Errors(
  rawErrors: CombinedLLMResponse['layer1']['errors']
): ConventionError[] {
  return rawErrors
    .filter(e => e.category && e.explanation && e.substring)
    .map((error, index) => {
      const category = error.category as GrammarCategory;
      const severity = ERROR_SEVERITY_TIERS[category] || 'minor';
      const hpDamage = HP_DAMAGE_WEIGHTS[severity];

      return {
        category,
        explanation: error.explanation,
        substringOfInterest: error.substring,
        potentialFix: error.fix,
        severity,
        hpDamage,
        displayPriority: SEVERITY_PRIORITY[severity] * 100 + index,
      };
    });
}

/**
 * Parse Layer 2 (Quest) error if present.
 */
function parseLayer2Error(
  rawResult: CombinedLLMResponse['layer2'] | undefined
): QuestError | null {
  // No Layer 2 result or it's valid
  if (!rawResult || rawResult.valid === true || !rawResult.error) {
    return null;
  }

  const { category, explanation } = rawResult.error;

  // Validate category
  if (!isValidQuestCategory(category)) {
    console.warn(`[ResponseParser] Invalid Layer 2 category: ${category}`);
    return null;
  }

  const questCategory = category as QuestCategory;

  return {
    layer: 2,
    category: questCategory,
    explanation: explanation || QUEST_FEEDBACK[questCategory],
    severity: 'blocking',
    hpDamage: 0, // Blocking errors don't take HP
    displayPriority: SEVERITY_PRIORITY['blocking'],
  };
}

/**
 * Parse Layer 3 (Narrative) errors.
 */
function parseLayer3Errors(
  rawErrors: CombinedLLMResponse['layer3']['errors']
): NarrativeError[] {
  return rawErrors
    .filter(e => e.category && e.explanation)
    .filter(e => isValidNarrativeCategory(e.category))
    .map((error, index) => {
      const category = error.category as NarrativeCategory;
      const severity = NARRATIVE_SEVERITY_TIERS[category];
      const hpDamage = NARRATIVE_HP_DAMAGE[category];

      return {
        layer: 3,
        category,
        explanation: error.explanation || NARRATIVE_FEEDBACK[category],
        severity,
        hpDamage,
        displayPriority: SEVERITY_PRIORITY[severity] * 100 + index,
        suggestedAlternative: error.suggestion,
      };
    });
}

// =============================================================================
// VALIDATION HELPERS
// =============================================================================

/**
 * Check if the parsed response has the expected structure.
 */
function validateResponseStructure(parsed: unknown): parsed is CombinedLLMResponse {
  if (typeof parsed !== 'object' || parsed === null) {
    return false;
  }

  const response = parsed as Record<string, unknown>;

  // Layer 1 should have errors array (can be empty)
  if (!response.layer1 || typeof response.layer1 !== 'object') {
    return false;
  }

  const layer1 = response.layer1 as Record<string, unknown>;
  if (!Array.isArray(layer1.errors)) {
    return false;
  }

  // Layer 2 should have valid boolean
  if (!response.layer2 || typeof response.layer2 !== 'object') {
    return false;
  }

  const layer2 = response.layer2 as Record<string, unknown>;
  if (typeof layer2.valid !== 'boolean') {
    return false;
  }

  // Layer 3 should have errors array (can be empty)
  if (!response.layer3 || typeof response.layer3 !== 'object') {
    return false;
  }

  const layer3 = response.layer3 as Record<string, unknown>;
  if (!Array.isArray(layer3.errors)) {
    return false;
  }

  return true;
}

/**
 * Check if a category is a valid Quest category.
 */
function isValidQuestCategory(category: string): boolean {
  return Object.values(QUEST_CATEGORIES).includes(category as QuestCategory);
}

/**
 * Check if a category is a valid Narrative category.
 */
function isValidNarrativeCategory(category: string): boolean {
  return Object.values(NARRATIVE_CATEGORIES).includes(category as NarrativeCategory);
}

// =============================================================================
// UTILITY HELPERS
// =============================================================================

/**
 * Extract JSON from LLM response (handles markdown code blocks).
 */
function extractJSON(text: string): string {
  // Try to find JSON in code block
  const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlockMatch) {
    return codeBlockMatch[1].trim();
  }

  // Try to find raw JSON object
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return jsonMatch[0];
  }

  // Return as-is and let JSON.parse handle it
  return text.trim();
}

/**
 * Create an empty result (used when parsing fails).
 */
function createEmptyResult(): LLMEvaluationResult {
  return {
    layer1Errors: [],
    layer2Error: null,
    layer3Errors: [],
  };
}

/**
 * @description Check if the LLM response indicates no errors found.
 * Handles cases where LLM returns "No errors" text instead of JSON.
 */
export function isNoErrorsResponse(text: string): boolean {
  const normalized = text.trim().toLowerCase();
  return (
    normalized === 'no errors' ||
    normalized === 'no errors found' ||
    normalized.includes('"errors": []') ||
    /no\s+(grammar|spelling|writing)\s+errors/i.test(normalized)
  );
}

