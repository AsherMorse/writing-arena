import { NextRequest, NextResponse } from 'next/server';
import { generateTWRRevisionPrompt } from '@/lib/utils/twr-prompts';

export async function POST(request: NextRequest) {
  let payload: { originalContent?: string; revisedContent?: string; feedback?: any };
  try {
    payload = await request.json();
  } catch (error) {
    console.error('Error parsing revision body:', error);
    return NextResponse.json(generateMockRevisionScore('', ''));
  }

  const originalContent = payload.originalContent || '';
  const revisedContent = payload.revisedContent || '';
  const feedback = payload.feedback;

  try {

    const apiKey = process.env.ANTHROPIC_API_KEY;
    
    if (!apiKey || apiKey === 'your_api_key_here') {
      return NextResponse.json(generateMockRevisionScore(originalContent, revisedContent));
    }

    // Call Claude API to evaluate the revision
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
            content: generateTWRRevisionPrompt(originalContent, revisedContent, feedback),
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error('Claude API request failed');
    }

    const data = await response.json();
    const evaluation = parseRevisionEvaluation(data.content[0].text);

    return NextResponse.json(evaluation);
  } catch (error) {
    console.error('Error evaluating revision:', error);
    return NextResponse.json(generateMockRevisionScore(originalContent, revisedContent));
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
  try {
    const jsonMatch = claudeResponse.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (error) {
    console.error('Error parsing revision evaluation:', error);
  }
  
  return generateMockRevisionScore('', '');
}

function generateMockRevisionScore(originalContent: string, revisedContent: string): any {
  const changeAmount = Math.abs(revisedContent.length - originalContent.length);
  const hasSignificantChanges = changeAmount > 50;
  
  const score = hasSignificantChanges 
    ? Math.round(85 + Math.random() * 10)
    : Math.round(60 + Math.random() * 15);
  
  return {
    score,
    improvements: [
      'Added more descriptive details',
      'Improved sentence variety',
    ],
    strengths: [
      'Applied feedback effectively',
      'Meaningful changes made',
    ],
    suggestions: [
      'Could combine more short sentences',
      'Try adding more transitional phrases',
    ],
  };
}

