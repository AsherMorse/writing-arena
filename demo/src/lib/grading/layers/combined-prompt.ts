/**
 * @fileoverview Combined LLM prompt builder for all 3 layers.
 * Creates a single prompt that evaluates grammar, quest requirements, and narrative appropriateness.
 */

import type { GrammarCategory, NarrativeContext } from '../dnd-grader-types';
import { getCategoryDescription } from '../grammar-guard-prompt';
import {
  QUEST_CATEGORY_DESCRIPTIONS,
  NARRATIVE_CATEGORY_DESCRIPTIONS,
} from '../dnd-grader-config';

/**
 * @description Build the combined system prompt for all 3 layers.
 *
 * @example
 * ```typescript
 * const prompt = buildCombinedSystemPrompt({
 *   context: {
 *     currentLocation: "Dragon's Lair",
 *     sceneDescription: "A massive red dragon blocks your path...",
 *     characterClass: "Warrior",
 *   },
 *   gradeLevel: 6,
 *   grammarCategories: ['SENTENCE_FRAGMENT', 'TYPOS', ...],
 * });
 * ```
 */
export function buildCombinedSystemPrompt(options: {
  context: NarrativeContext;
  gradeLevel: number;
  grammarCategories: GrammarCategory[];
}): string {
  const { context, gradeLevel, grammarCategories } = options;

  const grammarSection = buildGrammarSection(grammarCategories, gradeLevel);
  const contextSection = buildContextSection(context);
  const questSection = buildQuestSection();
  const narrativeSection = buildNarrativeSection(context);
  const outputSection = buildOutputSection();

  return `You are evaluating a student's D&D adventure response across THREE dimensions.

${contextSection}

${grammarSection}

${questSection}

${narrativeSection}

${outputSection}`;
}

/**
 * @description Build the user prompt containing the student's response.
 */
export function buildUserPrompt(studentResponse: string): string {
  return `Please evaluate the following student response:

"${studentResponse.trim()}"

Evaluate this response across all three layers and return your analysis in the specified JSON format.`;
}

// =============================================================================
// SECTION BUILDERS
// =============================================================================

function buildContextSection(context: NarrativeContext): string {
  const parts: string[] = ['## GAME CONTEXT'];

  parts.push(`**Location**: ${context.currentLocation}`);
  parts.push(`**Scene**: ${context.sceneDescription}`);

  // Include story summary if available - this is CRITICAL for understanding context
  if (context.recentStorySummary) {
    parts.push(`**Story So Far**: ${context.recentStorySummary}`);
  }

  // Include recent narrative for immediate context about visible items/objects
  if (context.recentNarrative?.length) {
    parts.push(`**Recent Narrative** (items/objects mentioned here ARE available): ${context.recentNarrative.join(' | ')}`);
  }

  if (context.characterClass) {
    const abilities = context.characterAbilities?.join(', ') || 'none specified';
    parts.push(`**Character**: ${context.characterClass} with abilities: ${abilities}`);
  }

  if (context.inventoryItems?.length) {
    parts.push(`**Inventory**: ${context.inventoryItems.join(', ')}`);
  }

  if (context.currentObjective) {
    parts.push(`**Current Objective**: ${context.currentObjective}`);
  }

  if (context.questConstraints?.length) {
    parts.push(`**Constraints**: ${context.questConstraints.join('; ')}`);
  }

  if (context.npcsPresent?.length) {
    parts.push(`**NPCs Present**: ${context.npcsPresent.join(', ')}`);
  }

  if (context.availableExits?.length) {
    parts.push(`**Available Exits**: ${context.availableExits.join(', ')}`);
  }

  return parts.join('\n');
}

function buildGrammarSection(categories: GrammarCategory[], gradeLevel: number): string {
  const categoryList = categories
    .map(cat => `- **${cat}**: ${getCategoryDescription(cat)}`)
    .join('\n');

  return `## LAYER 1: Writing Conventions (Grammar)

Check the student's writing for these specific grammar and spelling issues:

${categoryList}

**Instructions for Layer 1:**
- Focus on sentence-level conventions only
- The creative content (fantasy actions) is acceptable
- The student is in grade ${gradeLevel}
- Provide friendly, encouraging feedback
- Keep explanations to 2-3 sentences, using simple language
- Never use technical grammar jargon
- For each error, identify the specific substring that has the issue`;
}

function buildQuestSection(): string {
  const categoryList = Object.entries(QUEST_CATEGORY_DESCRIPTIONS)
    .filter(([key]) => key !== 'TOO_SHORT') // Handled by pre-validation
    .map(([key, desc]) => `- **${key}**: ${desc}`)
    .join('\n');

  return `## LAYER 2: Quest Requirements

Check if the response is a valid player action. Flag issues if:

${categoryList}

**Instructions for Layer 2:**
- A valid response describes what the PLAYER CHARACTER does
- The response should be a player action, not narration of events or NPC actions
- Even creative/unusual actions are fine if they describe player behavior
- Only flag as INAPPROPRIATE_CONTENT if truly harmful or completely inappropriate
- Be lenient with imaginative interpretations of actions`;
}

function buildNarrativeSection(context: NarrativeContext): string {
  const categoryList = Object.entries(NARRATIVE_CATEGORY_DESCRIPTIONS)
    .map(([key, desc]) => `- **${key}**: ${desc}`)
    .join('\n');

  let characterNote = '';
  if (context.characterClass) {
    characterNote = `
**Character Class Context:**
The player is a ${context.characterClass}. Flag OUT_OF_CHARACTER only if they try to use abilities clearly outside their class (e.g., a Warrior casting complex spells). Be lenient with creative interpretations.`;
  }

  return `## LAYER 3: Narrative Appropriateness

Check if the action makes sense in the story context:

${categoryList}

**Instructions for Layer 3:**
- This is a medieval fantasy world - no modern technology (phones, cars, internet)
- Magic exists but should fit the character's abilities
- Basic physics apply unless magic explains otherwise
- Be lenient with creative actions - block only clearly impossible ones
- For OUT_OF_CHARACTER and META_GAMING, prefer warning over blocking
- Provide a helpful suggested alternative when blocking${characterNote}`;
}

function buildOutputSection(): string {
  return `## OUTPUT FORMAT

Return your evaluation as a JSON object with this EXACT structure:

\`\`\`json
{
  "layer1": {
    "errors": [
      {
        "category": "CATEGORY_NAME",
        "explanation": "Friendly explanation of the issue (2-3 sentences)",
        "substring": "the specific problematic text",
        "fix": "Suggested corrected version of the substring or sentence"
      }
    ]
  },
  "layer2": {
    "valid": true,
    "error": null
  },
  "layer3": {
    "errors": []
  }
}
\`\`\`

**If Layer 2 has an issue (response is NOT a valid player action):**
\`\`\`json
{
  "layer2": {
    "valid": false,
    "error": {
      "category": "NOT_A_PLAYER_ACTION",
      "explanation": "Friendly explanation of why this isn't a valid action"
    }
  }
}
\`\`\`

**If Layer 3 has issues:**
\`\`\`json
{
  "layer3": {
    "errors": [
      {
        "category": "ANACHRONISM",
        "explanation": "Phones don't exist in this medieval fantasy world.",
        "suggestion": "Try calling out to nearby allies or using a signal horn instead."
      }
    ]
  }
}
\`\`\`

**Important:**
- Return ONLY the JSON object, no additional text
- Layer 1 errors array can be empty if no grammar issues
- Layer 2 should have valid=true and error=null if the response is a valid player action
- Layer 3 errors array can be empty if the action is narratively appropriate
- Use the exact category names provided above`;
}

