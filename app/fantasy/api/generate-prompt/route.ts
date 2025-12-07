import { NextRequest, NextResponse } from 'next/server';
import { getAnthropicApiKey } from '@/lib/utils/api-helpers';

const PARAGRAPH_ANGLES = [
  'Focus on what makes this topic unique or special.',
  'Focus on how this topic affects or connects to people.',
  'Focus on comparing this topic to something similar.',
  'Focus on why people find this topic interesting or enjoyable.',
  'Focus on how this topic works or functions.',
  'Focus on the benefits or positive aspects of this topic.',
  'Focus on different types or varieties of this topic.',
  'Focus on what someone new to this topic should know.',
];

const ESSAY_ANGLES = [
  'Explore multiple reasons or factors.',
  'Compare and contrast different aspects.',
  'Discuss causes and effects.',
  'Present arguments for or against.',
  'Explain a process or how something works.',
  'Analyze benefits and challenges.',
  'Discuss importance and impact.',
  'Explore different perspectives.',
];

const PARAGRAPH_SYSTEM_PROMPT = `You are a writing prompt generator for students. Given a topic and an angle, create a two-sentence writing prompt.

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

Return ONLY the two-sentence prompt, nothing else.`;

const ESSAY_SYSTEM_PROMPT = `You are a writing prompt generator for student essays. Given a topic and an angle, create a prompt that encourages a multi-paragraph essay response.

Rules:
1. First sentence: A question or statement that invites exploration of multiple aspects
2. Second sentence: Guide the student to consider several different points they could develop into paragraphs
3. The prompt should naturally lead to 4+ paragraphs (intro, 2+ body paragraphs, conclusion)
4. AVOID commands like "Write an essay about" - be engaging
5. AVOID requiring adult-level knowledge
6. Keep it appropriate for grades 6-8
7. Use the provided angle to shape the essay's direction

Examples:
Topic: Technology | Angle: benefits and challenges
Output: How has technology changed the way people live and work? Consider both the advantages it brings and the problems it can create.

Topic: Friendship | Angle: explore different perspectives
Output: What qualities make someone a good friend? Think about different types of friendships and what makes each one valuable.

Topic: Environment | Angle: discuss importance and impact
Output: Why is protecting the environment important for future generations? Consider the effects on wildlife, climate, and human communities.

Return ONLY the two-sentence prompt, nothing else.`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.topic || typeof body.topic !== 'string') {
      return NextResponse.json({ error: 'topic is required' }, { status: 400 });
    }

    const topic = body.topic.trim();
    const isEssay = body.type === 'essay';
    const maxTopicLength = isEssay ? 30 : 20;
    
    if (topic.length < 3 || topic.length > maxTopicLength) {
      return NextResponse.json({ error: `topic must be 3-${maxTopicLength} characters` }, { status: 400 });
    }

    const apiKey = getAnthropicApiKey();
    if (!apiKey) {
      return NextResponse.json({ error: 'API not configured' }, { status: 500 });
    }

    const angles = isEssay ? ESSAY_ANGLES : PARAGRAPH_ANGLES;
    const angle = angles[Math.floor(Math.random() * angles.length)];
    const systemPrompt = isEssay ? ESSAY_SYSTEM_PROMPT : PARAGRAPH_SYSTEM_PROMPT;

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
          content: `${systemPrompt}\n\nAngle: ${angle}\n\nTopic: ${topic}`,
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
