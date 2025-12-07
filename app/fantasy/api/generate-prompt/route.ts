import { NextRequest, NextResponse } from 'next/server';
import { getAnthropicApiKey } from '@/lib/utils/api-helpers';

const PROMPT_ANGLES = [
  'Focus on what makes this topic unique or special.',
  'Focus on how this topic affects or connects to people.',
  'Focus on comparing this topic to something similar.',
  'Focus on why people find this topic interesting or enjoyable.',
  'Focus on how this topic works or functions.',
  'Focus on the benefits or positive aspects of this topic.',
  'Focus on different types or varieties of this topic.',
  'Focus on what someone new to this topic should know.',
];

const SYSTEM_PROMPT = `You are a writing prompt generator for students. Given a topic and an angle, create a two-sentence writing prompt.

Rules:
1. First sentence: A statement or question that sets up expository writing (explaining or informing)
2. Second sentence: Gentle suggestions about what the student might include (use "You might..." phrasing)
3. AVOID commands like "Write about", "Describe", "Explain" - be non-imperative
4. AVOID requiring adult-level knowledge
5. AVOID pushing toward narrative or first-person writing
6. Keep it appropriate for grades 4-8
7. Use the provided angle to shape your prompt's direction

Examples:
Topic: Dragons | Angle: what makes it unique
Output: What do dragons look like in stories from around the world? You might talk about their size, color, wings, and whether they breathe fire.

Topic: Baseball | Angle: comparing to something similar
Output: How is baseball different from other sports? You might discuss the rules, equipment, and how teams score points.

Topic: Pizza | Angle: why people find it interesting
Output: What makes pizza such a popular food? You might consider the different toppings, where it came from, and why people enjoy it.

Return ONLY the two-sentence prompt, nothing else.`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.topic || typeof body.topic !== 'string') {
      return NextResponse.json({ error: 'topic is required' }, { status: 400 });
    }

    const topic = body.topic.trim();
    if (topic.length < 3 || topic.length > 20) {
      return NextResponse.json({ error: 'topic must be 3-20 characters' }, { status: 400 });
    }

    const apiKey = getAnthropicApiKey();
    if (!apiKey) {
      return NextResponse.json({ error: 'API not configured' }, { status: 500 });
    }

    const angle = PROMPT_ANGLES[Math.floor(Math.random() * PROMPT_ANGLES.length)];

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: 200,
        temperature: 0.9,
        messages: [{
          role: 'user',
          content: `${SYSTEM_PROMPT}\n\nAngle: ${angle}\n\nTopic: ${topic}`,
        }],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API request failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const prompt = data.content[0].text.trim();

    return NextResponse.json({ prompt });
  } catch (error) {
    console.error('Prompt generation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Generation failed' },
      { status: 500 }
    );
  }
}
