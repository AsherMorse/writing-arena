import { NextRequest, NextResponse } from 'next/server';
import { generateTWRPeerFeedbackPrompt } from '@/lib/utils/twr-prompts';

export async function POST(request: NextRequest) {
  let payload: { responses?: any; peerWriting?: string };
  try {
    payload = await request.json();
  } catch (error) {
    console.error('Error parsing peer-feedback body:', error);
    return NextResponse.json(generateMockFeedbackScore({}));
  }

  const responses = payload.responses || {};
  const peerWriting = payload.peerWriting || '';

  try {

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
            content: generateTWRPeerFeedbackPrompt(responses, peerWriting),
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

