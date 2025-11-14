import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  let payload: { content?: string; trait?: string | null; promptType?: string | null };
  try {
    payload = await request.json();
  } catch (error) {
    console.error('Error parsing analyze-writing body:', error);
    return NextResponse.json(generateMockFeedback(null, 0));
  }

  const content = payload.content || '';
  const trait = payload.trait || null;
  const promptType = payload.promptType || null;

  try {

    // Check if API key is configured
    const apiKey = process.env.ANTHROPIC_API_KEY;
    
    if (!apiKey || apiKey === 'your_api_key_here') {
      // Return mock feedback if API key is not configured
      return NextResponse.json(generateMockFeedback(trait, content.split(/\s+/).length));
    }

    // Call Claude API for real feedback
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2000,
        messages: [
          {
            role: 'user',
            content: generatePrompt(content, trait || 'all', promptType || 'narrative'),
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error('Claude API request failed');
    }

    const data = await response.json();
    const feedback = parseClaudioFeedback(data.content[0].text, trait || 'all', content.split(/\s+/).length);

    return NextResponse.json(feedback);
  } catch (error) {
    console.error('Error analyzing writing:', error);
    return NextResponse.json(generateMockFeedback(trait, content.split(/\s+/).length));
  }
}

function generatePrompt(content: string, trait: string, promptType: string): string {
  return `You are a supportive writing instructor providing formative feedback to a student.

STUDENT WRITING:
${content}

CONTEXT:
- Prompt type: ${promptType}
- Focus trait: ${trait}
- This is a 4-minute practice session

TASK:
Analyze this writing and provide constructive feedback. Structure your response as JSON with:
1. Overall score (0-100)
2. Individual trait scores for: content, organization, grammar, vocabulary, mechanics (each 0-100)
3. 3 specific strengths
4. 3 areas for improvement
5. Detailed feedback for each of the 5 traits
6. 3 actionable next steps

Be encouraging and growth-oriented. Focus on what the student did well and provide specific, actionable suggestions for improvement.

Format your response as valid JSON matching this structure:
{
  "overallScore": 85,
  "traits": {
    "content": 88,
    "organization": 82,
    "grammar": 85,
    "vocabulary": 80,
    "mechanics": 90
  },
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "improvements": ["improvement 1", "improvement 2", "improvement 3"],
  "specificFeedback": {
    "content": "feedback text",
    "organization": "feedback text",
    "grammar": "feedback text",
    "vocabulary": "feedback text",
    "mechanics": "feedback text"
  },
  "nextSteps": ["step 1", "step 2", "step 3"]
}`;
}

function parseClaudioFeedback(claudeResponse: string, trait: string, wordCount: number): any {
  try {
    // Try to parse JSON from Claude's response
    const jsonMatch = claudeResponse.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        ...parsed,
        xpEarned: Math.round(parsed.overallScore * 1.5),
      };
    }
  } catch (error) {
    console.error('Error parsing Claude feedback:', error);
  }
  
  // Fallback to mock if parsing fails
  return generateMockFeedback(trait, wordCount);
}

function generateMockFeedback(focusTrait: string | null, words: number) {
  const baseScore = Math.min(100, Math.max(40, 60 + (words / 10)));
  
  return {
    overallScore: Math.round(baseScore),
    xpEarned: Math.round(baseScore * 1.5),
    traits: {
      content: Math.round(baseScore + Math.random() * 10 - 5),
      organization: Math.round(baseScore + Math.random() * 10 - 5),
      grammar: Math.round(baseScore + Math.random() * 10 - 5),
      vocabulary: Math.round(baseScore + Math.random() * 10 - 5),
      mechanics: Math.round(baseScore + Math.random() * 10 - 5),
    },
    strengths: [
      'Strong opening that captures attention',
      'Good use of descriptive details',
      'Clear progression of ideas',
    ],
    improvements: [
      'Try adding more transitional phrases between paragraphs',
      'Vary your sentence structure for better flow',
      'Consider expanding on your main points with specific examples',
    ],
    specificFeedback: {
      content: 'Your ideas are relevant and address the prompt well. Consider adding more specific examples to support your main points.',
      organization: 'Good logical flow overall. Transitions could be smoother between some paragraphs.',
      grammar: 'Sentence variety is good. Watch for a few minor punctuation issues.',
      vocabulary: 'Solid word choice. Try incorporating more precise verbs to strengthen your writing.',
      mechanics: 'Generally clean writing with good spelling and punctuation. Check capitalization in a few spots.',
    },
    nextSteps: [
      'Practice writing transitions between paragraphs',
      'Try the descriptive prompt type to expand vocabulary skills',
      'Focus on varying sentence beginnings in your next session',
    ],
  };
}

