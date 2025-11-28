import { NextRequest, NextResponse } from 'next/server';
import { generateTWRFeedbackPrompt } from '@/lib/utils/twr-prompts';
import { getAnthropicApiKey, logApiKeyStatus, callAnthropicAPI } from '@/lib/utils/api-helpers';
import { parseClaudeJSON } from '@/lib/utils/claude-parser';
import { generateMockAIFeedback } from '@/lib/utils/mock-data';
import { createErrorResponse, createSuccessResponse } from '@/lib/utils/api-responses';

export async function POST(request: NextRequest) {
  const requestBody = await request.json();
  const { content, promptType } = requestBody;
  
  try {
    logApiKeyStatus('GENERATE FEEDBACK');
    
    const apiKey = getAnthropicApiKey();
    if (!apiKey) {
      console.warn('⚠️ GENERATE FEEDBACK - API key missing, using mock');
      return NextResponse.json(generateMockAIFeedback());
    }

    // Call Claude API to generate feedback for revision phase
    const prompt = generateTWRFeedbackPrompt(content, promptType);
    const aiResponse = await callAnthropicAPI(apiKey, prompt, 1500);
    const feedback = parseFeedbackResponse(aiResponse.content[0].text);

    return createSuccessResponse(feedback);
  } catch (error) {
    console.error('❌ GENERATE FEEDBACK - Error:', error);
    return createErrorResponse('Failed to generate feedback', 500);
  }
}

function generateFeedbackPrompt(content: string, promptType: string): string {
  return `You are a supportive writing instructor providing feedback to help a student revise their work.

STUDENT'S WRITING:
${content}

PROMPT TYPE: ${promptType}

TASK:
Provide HIGHLY SPECIFIC, POINTED feedback using The Writing Revolution principles.

CRITICAL REQUIREMENTS:
1. QUOTE exact phrases, sentences, or words from their writing
2. Point to SPECIFIC locations: "In your second sentence...", "The phrase '...' in paragraph 1..."
3. Give CONCRETE revision suggestions with The Writing Revolution strategies:
   - "Expand the sentence 'X' by adding 'because...'" (sentence expansion)
   - "Combine 'X' and 'Y' into: ..." (sentence combining)
   - "Add an appositive after 'X': 'X, a [description], ...'" (appositives)
   - "Insert 'However,' before 'X' to show contrast" (transition words)
   - "Replace 'X' with sensory detail: [specific suggestion]" (five senses)

Example GOOD feedback:
✓ "Your opening sentence 'The lighthouse stood tall' could be stronger. Try: 'The lighthouse, a weathered stone sentinel, stood tall...'"
✓ "In sentence 3, expand 'She went inside' with because: 'She went inside because the golden light pulled her forward.'"
✓ "The phrase 'it was interesting' is vague. Replace with: 'the ornate carvings caught her eye' or 'mysterious symbols covered its surface'"

Example BAD (vague) feedback:
✗ "Good opening sentence"
✗ "Add more details"
✗ "Use better transitions"

Return JSON with 3 SPECIFIC strengths and 3 SPECIFIC, ACTIONABLE improvements:
{
  "strengths": ["Quote their text and explain why it works"],
  "improvements": ["Quote what needs changing and provide exact revision"],
  "score": 78
}`;
}

function parseFeedbackResponse(claudeResponse: string): any {
  const parsed = parseClaudeJSON<any>(claudeResponse);
  
  if (!parsed) {
    console.warn('⚠️ GENERATE FEEDBACK - Failed to parse Claude response, using mock');
    return generateMockAIFeedback();
  }
  
  return parsed;
}

// Mock data generation moved to lib/utils/mock-data.ts - using generateMockAIFeedback()

