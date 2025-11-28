import { NextRequest, NextResponse } from 'next/server';
import { generateTWRPeerFeedbackPrompt } from '@/lib/utils/twr-prompts';
import { getAnthropicApiKey, logApiKeyStatus, callAnthropicAPI } from '@/lib/utils/api-helpers';
import { parseClaudeJSON } from '@/lib/utils/claude-parser';
import { randomScore } from '@/lib/utils/random-utils';
import { createErrorResponse, createSuccessResponse } from '@/lib/utils/api-responses';

export async function POST(request: NextRequest) {
  const requestBody = await request.json();
  const { responses = {}, peerWriting = '' } = requestBody;
  
  try {
    logApiKeyStatus('EVALUATE PEER FEEDBACK');
    
    const apiKey = getAnthropicApiKey();
    if (!apiKey) {
      console.error('❌ EVALUATE PEER FEEDBACK - API key missing');
      return createErrorResponse('API key missing', 500);
    }

    // Call Claude API to evaluate the quality of peer feedback
    const prompt = generateTWRPeerFeedbackPrompt(responses, peerWriting);
    const aiResponse = await callAnthropicAPI(apiKey, prompt, 1000);
    const evaluation = parsePeerFeedbackEvaluation(aiResponse.content[0].text);

    return createSuccessResponse(evaluation);
  } catch (error) {
    console.error('❌ EVALUATE PEER FEEDBACK - Error:', error);
    return createErrorResponse('Failed to evaluate peer feedback', 500);
  }
}

function generatePeerFeedbackPrompt(responses: any, peerWriting: string): string {
  return `You are evaluating the quality of peer feedback provided by a student.

PEER'S WRITING THAT WAS EVALUATED:
${peerWriting}

STUDENT'S PEER FEEDBACK (3 Targeted Questions):
1. What is the main idea?: ${responses.mainIdea || responses.clarity || ''}
2. What is one strength?: ${responses.strength || responses.strengths || ''}
3. What is one specific suggestion?: ${responses.suggestion || responses.improvements || ''}

TASK:
Evaluate this peer feedback with EMPHASIS ON SPECIFICITY. 

HIGH SCORES (80-100) require:
- Quotes SPECIFIC phrases/sentences from the peer's writing
- Points to EXACT locations that need improvement
- Gives CONCRETE revision suggestions ("Change X to Y", "Add a sentence after...")
- References specific Writing Revolution strategies by name
- Provides ACTIONABLE advice, not general observations

LOW SCORES (below 70) for:
- Vague comments like "good writing" or "nice job"
- No quotes or examples from the text
- General suggestions like "add more details" without saying where
- No reference to specific sentences or words
- Generic advice that could apply to any writing

Provide a score 0-100 and SPECIFIC feedback about their feedback.

Return JSON:
{
  "score": 85,
  "strengths": ["SPECIFIC examples of what they did well - quote their feedback"],
  "improvements": ["SPECIFIC ways to improve - show them what specific feedback looks like"]
}`;
}

function parsePeerFeedbackEvaluation(claudeResponse: string): any {
  const parsed = parseClaudeJSON<any>(claudeResponse);
  
  if (!parsed) {
    console.error('❌ EVALUATE PEER FEEDBACK - Failed to parse Claude response');
    throw new Error('Failed to parse AI response');
  }
  
  return parsed;
}

function generateMockFeedbackScore(responses: any): any {
  const isComplete = responses && Object.keys(responses).length >= 5;
  const score = isComplete 
    ? randomScore(75, 20)
    : randomScore(50, 30);
  
  return {
    score,
    strengths: [
      'You identified specific aspects of the writing',
      'Your suggestions were constructive',
    ],
    improvements: [
      'Try referencing specific sentences or examples',
      'Consider suggesting Writing Revolution strategies',
    ],
  };
}

