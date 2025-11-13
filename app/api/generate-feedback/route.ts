import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { content, promptType } = await request.json();

    const apiKey = process.env.ANTHROPIC_API_KEY;
    
    if (!apiKey || apiKey === 'your_api_key_here') {
      return NextResponse.json(generateMockAIFeedback());
    }

    // Call Claude API to generate feedback for revision phase
    const response = await fetch('https://api.anthropic.com/v1/messages', {
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
            content: generateFeedbackPrompt(content, promptType),
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error('Claude API request failed');
    }

    const data = await response.json();
    const feedback = parseFeedbackResponse(data.content[0].text);

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
Provide constructive feedback using The Writing Revolution principles. Include:
1. 3 specific strengths (what they did well)
2. 3 specific suggestions for improvement with Writing Revolution strategies:
   - Sentence expansion (because, but, so)
   - Sentence combining
   - Appositives for description
   - Transition words
   - Five senses for descriptive writing
   - Topic sentences and SPO structure

Be specific - reference actual sentences or parts of their writing.

Return JSON:
{
  "strengths": ["strength 1 with specific example", "strength 2", "strength 3"],
  "improvements": ["improvement 1 with TWR strategy", "improvement 2", "improvement 3"],
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

