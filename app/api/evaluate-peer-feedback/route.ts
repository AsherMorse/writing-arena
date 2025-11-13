import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { responses, peerWriting } = await request.json();

    const apiKey = process.env.ANTHROPIC_API_KEY;
    
    if (!apiKey || apiKey === 'your_api_key_here') {
      return NextResponse.json(generateMockFeedbackScore(responses));
    }

    // Call Claude API to evaluate the quality of peer feedback
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        messages: [
          {
            role: 'user',
            content: generatePeerFeedbackPrompt(responses, peerWriting),
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error('Claude API request failed');
    }

    const data = await response.json();
    const evaluation = parsePeerFeedbackEvaluation(data.content[0].text);

    return NextResponse.json(evaluation);
  } catch (error) {
    console.error('Error evaluating peer feedback:', error);
    const { responses } = await request.json();
    return NextResponse.json(generateMockFeedbackScore(responses));
  }
}

function generatePeerFeedbackPrompt(responses: any, peerWriting: string): string {
  return `You are evaluating the quality of peer feedback provided by a student.

PEER'S WRITING THAT WAS EVALUATED:
${peerWriting}

STUDENT'S PEER FEEDBACK:
1. Main idea clarity: ${responses.clarity}
2. Strengths noted: ${responses.strengths}
3. Improvements suggested: ${responses.improvements}
4. Organization feedback: ${responses.organization}
5. Engagement feedback: ${responses.engagement}

TASK:
Evaluate the quality of this peer feedback based on:
- Specificity (are comments specific or vague?)
- Constructiveness (are suggestions helpful and actionable?)
- Completeness (did they address all aspects?)
- Accuracy (do their observations match the writing?)
- Writing Revolution principles (do they reference specific strategies?)

Provide a score 0-100 for the feedback quality.

Return JSON:
{
  "score": 85,
  "strengths": ["what they did well in giving feedback"],
  "improvements": ["how they could improve their feedback skills"]
}`;
}

function parsePeerFeedbackEvaluation(claudeResponse: string): any {
  try {
    const jsonMatch = claudeResponse.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (error) {
    console.error('Error parsing peer feedback evaluation:', error);
  }
  
  return generateMockFeedbackScore({});
}

function generateMockFeedbackScore(responses: any): any {
  const isComplete = responses && Object.keys(responses).length >= 5;
  const score = isComplete 
    ? Math.round(75 + Math.random() * 20) 
    : Math.round(50 + Math.random() * 30);
  
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

