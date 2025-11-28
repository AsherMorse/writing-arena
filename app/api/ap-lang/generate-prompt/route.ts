import { NextRequest, NextResponse } from 'next/server';
import { getAnthropicApiKey, logApiKeyStatus, callAnthropicAPI } from '@/lib/utils/api-helpers';
import { createErrorResponse, createSuccessResponse } from '@/lib/utils/api-responses';

/**
 * Generate authentic AP Language and Composition prompts
 * 
 * Creates prompts similar to those found on the actual AP Lang exam:
 * - Argument prompts (most common)
 * - Synthesis prompts
 * - Rhetorical analysis prompts
 */

const AP_LANG_PROMPT_TYPES = [
  'argument',
  'synthesis',
  'rhetorical-analysis',
] as const;

export async function POST(request: NextRequest) {
  try {
    logApiKeyStatus('AP LANG GENERATE PROMPT');
    const apiKey = getAnthropicApiKey();

    if (!apiKey) {
      return createErrorResponse('API key missing', 500);
    }

    // Randomly select prompt type
    const promptType = AP_LANG_PROMPT_TYPES[Math.floor(Math.random() * AP_LANG_PROMPT_TYPES.length)];

    const generationPrompt = `Generate an authentic AP Language and Composition exam prompt.

PROMPT TYPE: ${promptType}

REQUIREMENTS:
- Must be similar in style and complexity to actual AP Lang exam prompts
- Should require students to construct an argument or analyze rhetoric
- Should be appropriate for high school students
- Should be clear and specific
- Should allow for multiple valid approaches

${promptType === 'argument' ? `
ARGUMENT PROMPT FORMAT:
- Present a debatable claim or question
- Ask students to develop a position and support it with evidence
- Should reference contemporary issues, literature, or historical events
- Example topics: education, technology, social issues, ethics, leadership

Generate a prompt that asks students to defend, challenge, or qualify a claim.
` : promptType === 'synthesis' ? `
SYNTHESIS PROMPT FORMAT:
- Present a topic or question
- Provide 6-7 sources (you'll describe them, not include full text)
- Ask students to synthesize information from sources to support their argument
- Should require students to use multiple sources

Generate a prompt with a topic and brief descriptions of 6-7 sources.
` : `
RHETORICAL ANALYSIS PROMPT FORMAT:
- Provide a passage or speech excerpt (you'll describe it, not include full text)
- Ask students to analyze the rhetorical strategies used
- Should focus on how the author/speaker achieves their purpose
- Should reference specific rhetorical devices

Generate a prompt that asks students to analyze rhetorical strategies in a described text.
`}

Respond with ONLY the prompt text, formatted exactly as it would appear on an AP exam. Do not include any explanation or JSON formatting.`;

    const aiResponse = await callAnthropicAPI(apiKey, generationPrompt, 1500);
    const prompt = aiResponse.content[0].text.trim();

    return createSuccessResponse({ prompt, type: promptType });
  } catch (error) {
    console.error('❌ AP LANG GENERATE PROMPT - Error:', error);
    return createErrorResponse('Failed to generate prompt', 500);
  }
}

