import { NextRequest, NextResponse } from 'next/server';
import { generateTWRRevisionPrompt } from '@/lib/utils/twr-prompts';
import { getAnthropicApiKey, logApiKeyStatus, callAnthropicAPI } from '@/lib/utils/api-helpers';
import { parseClaudeJSON } from '@/lib/utils/claude-parser';
import { randomScore } from '@/lib/utils/random-utils';
import { generateMockRevisionScore } from '@/lib/utils/mock-data';
import { createErrorResponse, createSuccessResponse } from '@/lib/utils/api-responses';

export async function POST(request: NextRequest) {
  const requestBody = await request.json();
  const { originalContent = '', revisedContent = '', feedback } = requestBody;
  
  try {
    logApiKeyStatus('EVALUATE REVISION');
    
    const apiKey = getAnthropicApiKey();
    if (!apiKey) {
      console.error('❌ EVALUATE REVISION - API key missing');
      return createErrorResponse('API key missing', 500);
    }

    // Call Claude API to evaluate the revision
    const prompt = generateTWRRevisionPrompt(originalContent, revisedContent, feedback);
    const aiResponse = await callAnthropicAPI(apiKey, prompt, 1000);
    const evaluation = parseRevisionEvaluation(aiResponse.content[0].text);

    return createSuccessResponse(evaluation);
  } catch (error) {
    console.error('❌ EVALUATE REVISION - Error:', error);
    return createErrorResponse('Failed to evaluate revision', 500);
  }
}

function generateRevisionPrompt(originalContent: string, revisedContent: string, feedback: any): string {
  return `You are evaluating how well a student revised their writing based on feedback.

ORIGINAL WRITING:
${originalContent}

FEEDBACK THEY RECEIVED:
${JSON.stringify(feedback, null, 2)}

REVISED WRITING:
${revisedContent}

TASK:
Evaluate the quality of their revision based on:
- Did they apply the feedback effectively?
- Did they improve clarity, detail, or organization?
- Did they use Writing Revolution strategies (sentence combining, appositives, etc.)?
- Is the revised version stronger than the original?
- Did they make meaningful changes vs. minor edits?

Provide a score 0-100 for the revision quality.

Return JSON:
{
  "score": 85,
  "improvements": ["specific improvements they made"],
  "strengths": ["what they did well in revising"],
  "suggestions": ["what they could still improve"]
}`;
}

function parseRevisionEvaluation(claudeResponse: string): any {
  const parsed = parseClaudeJSON<any>(claudeResponse);
  
  if (!parsed) {
    console.error('⚠️ EVALUATE REVISION - Failed to parse Claude response');
    throw new Error('Failed to parse AI response');
  }
  
  return parsed;
}

// Mock data generation moved to lib/utils/mock-data.ts - using generateMockRevisionScore()

