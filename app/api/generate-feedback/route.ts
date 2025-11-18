import { NextRequest, NextResponse } from 'next/server';
import { generateTWRFeedbackPrompt } from '@/lib/utils/twr-prompts';

export async function POST(request: NextRequest) {
  try {
    const { content, promptType } = await request.json();

    const apiKey = process.env.ANTHROPIC_API_KEY;
    
    if (!apiKey || apiKey === 'your_api_key_here') {
      return NextResponse.json(generateMockAIFeedback());
    }

    // Call Claude API to generate feedback for revision phase
    const anthropicResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1500,
        messages: [
          {
            role: 'user',
            content: generateTWRFeedbackPrompt(content, promptType),
          },
        ],
      }),
    });

    if (!anthropicResponse.ok) {
      throw new Error('Claude API request failed');
    }

    const aiResponse = await anthropicResponse.json();
    const feedback = parseFeedbackResponse(aiResponse.content[0].text);

    return NextResponse.json(feedback);
  } catch (error) {
    console.error('Error generating feedback:', error);
    return NextResponse.json(generateMockAIFeedback());
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
  try {
    const jsonMatch = claudeResponse.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (error) {
    console.error('Error parsing feedback:', error);
  }
  
  return generateMockAIFeedback();
}

function generateMockAIFeedback(): any {
  return {
    strengths: [
      "Strong opening hook that draws the reader in",
      "Good use of descriptive language and sensory details",
      "Clear narrative structure with a beginning, middle, and setup for continuation"
    ],
    improvements: [
      "Consider adding more character development - what does the character look like? What are their motivations?",
      "The pacing could be slower to build more tension",
      "Add more specific details using the five senses to create atmosphere"
    ],
    score: 78
  };
}

