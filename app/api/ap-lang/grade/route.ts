import { NextRequest, NextResponse } from 'next/server';
import { getAnthropicApiKey, logApiKeyStatus, callAnthropicAPI } from '@/lib/utils/api-helpers';
import { parseClaudeJSON } from '@/lib/utils/claude-parser';
import { validateAPLangScores, APLangScoreResult } from '@/lib/utils/score-validation';
import { 
  getAPLangArgumentPrompt, 
  getAPLangRhetoricalAnalysisPrompt, 
  getAPLangSynthesisPrompt 
} from '@/lib/prompts/grading-prompts';
import { 
  AP_LANG_ESSAY_TYPES, 
  APLangEssayType, 
  isValidEssayType,
  getAPLangScoreDescriptor 
} from '@/lib/constants/ap-lang-scoring';
import { API_MAX_TOKENS } from '@/lib/constants/api-config';
import { createErrorResponse, createSuccessResponse } from '@/lib/utils/api-responses';

/**
 * @fileoverview AP Language and Composition Essay Scoring API
 * 
 * Supports three AP Lang essay types with official rubrics:
 * - Argument Essay
 * - Rhetorical Analysis Essay
 * - Synthesis Essay
 * 
 * Each uses 0-6 scale: Thesis (0-1) + Evidence & Commentary (0-4) + Sophistication (0-1)
 */

// Map essay types to their prompt functions
const AP_LANG_PROMPT_FUNCTIONS: Record<APLangEssayType, (prompt: string, essay: string) => string> = {
  'argument': getAPLangArgumentPrompt,
  'rhetorical-analysis': getAPLangRhetoricalAnalysisPrompt,
  'synthesis': getAPLangSynthesisPrompt,
};

export async function POST(request: NextRequest) {
  try {
    const { prompt, essay, essayType = 'argument' } = await request.json();

    if (!prompt || !essay) {
      return createErrorResponse('Both prompt and essay are required', 400);
    }

    if (!isValidEssayType(essayType)) {
      return createErrorResponse(
        `Invalid essay type. Must be one of: ${AP_LANG_ESSAY_TYPES.join(', ')}`,
        400
      );
    }

    logApiKeyStatus('AP LANG GRADE');
    const apiKey = getAnthropicApiKey();

    if (!apiKey) {
      return createErrorResponse('API key missing', 500);
    }

    // Select the appropriate prompt based on essay type using map pattern
    const promptFunction = AP_LANG_PROMPT_FUNCTIONS[essayType] || AP_LANG_PROMPT_FUNCTIONS['argument'];
    const scoringPrompt = promptFunction(prompt, essay);

    const aiResponse = await callAnthropicAPI(apiKey, scoringPrompt, API_MAX_TOKENS.AP_LANG_GRADE);
    const responseText = aiResponse.content[0].text;

    // Parse JSON from response using existing utility
    const result = parseClaudeJSON<APLangScoreResult>(responseText);
    if (!result) {
      throw new Error('Could not parse AI response');
    }

    // Validate individual component scores
    validateAPLangScores(result);

    // Calculate total score from components (don't trust AI's addition)
    result.score = result.thesisScore + result.evidenceScore + result.sophisticationScore;

    // Add score descriptor based on calculated score
    if (!result.scoreDescriptor) {
      result.scoreDescriptor = getAPLangScoreDescriptor(result.score);
    }

    return createSuccessResponse(result);
  } catch (error) {
    console.error('❌ AP LANG GRADE - Error:', error);
    return createErrorResponse('Failed to grade essay', 500);
  }
}

