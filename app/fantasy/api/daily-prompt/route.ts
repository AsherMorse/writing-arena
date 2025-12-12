/**
 * @fileoverview API endpoint to generate writing prompts for ranked mode.
 * Supports both legacy flow (topic only) and new selection flow (with validation).
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAnthropicApiKey } from '@/lib/utils/api-helpers';

const ANGLES = [
  'Focus on what makes this topic unique or special.',
  'Focus on how this topic affects or connects to people.',
  'Focus on comparing this topic to something similar.',
  'Focus on why people find this topic interesting or enjoyable.',
  'Focus on how this topic works or functions.',
  'Focus on the benefits or positive aspects of this topic.',
  'Focus on different types or varieties of this topic.',
  'Focus on what someone new to this topic should know.',
];

const LEGACY_SYSTEM_PROMPT = `You are a writing prompt generator for a daily writing challenge. Given a topic and an angle, create a two-part writing prompt.

Rules:
1. promptQuestion: A statement or question that sets up expository writing (explaining or informing)
2. promptHint: Gentle suggestions about what the student might include (use "You might..." phrasing)
3. AVOID commands like "Write about", "Describe", "Explain" - be non-imperative
4. AVOID requiring adult-level knowledge
5. AVOID pushing toward narrative or first-person writing
6. Keep it appropriate for grades 6-8
7. Use the provided angle to shape your prompt's direction

Examples:
Topic: Dragons | Angle: what makes it unique
Output: { "promptQuestion": "What do dragons look like in stories from around the world?", "promptHint": "You might talk about their size, color, wings, and whether they breathe fire." }

Topic: Baseball | Angle: comparing to something similar
Output: { "promptQuestion": "How is baseball different from other sports?", "promptHint": "You might discuss the rules, equipment, and how teams score points." }

Return ONLY valid JSON with promptQuestion and promptHint, no markdown or extra text.`;

const SELECTION_SYSTEM_PROMPT = `You are a writing prompt generator for a middle school writing app.

A student was asked a question and made a selection. Your job is to:
1. FIRST, validate if their input is appropriate
2. If valid, generate a personalized prompt with SEPARATE question and hint

VALIDATION RULES:
- Is it appropriate for grades 6-8? (no violence, profanity, adult content)
- Is it related to the topic category?
- Is it specific enough to write about? (not just "stuff" or "idk")

If INVALID, respond with JSON:
{ "valid": false, "reason": "friendly explanation" }

If VALID, respond with JSON:
{ "valid": true, "promptQuestion": "the main question", "promptHint": "suggestions starting with You might..." }

INVALID INPUT EXAMPLES:
- "your mom" → { "valid": false, "reason": "Let's pick something real! What's a specific one you actually like?" }
- "asdfghjkl" → { "valid": false, "reason": "Hmm, I didn't catch that. Try typing something specific." }
- "stuff" → { "valid": false, "reason": "Can you be more specific? What comes to mind?" }
- profanity/drugs → { "valid": false, "reason": "Let's pick something else! What's one you enjoy?" }

VALID INPUT EXAMPLES (be lenient):
- "my grandma's cooking" → valid, generate prompt
- "a weird game nobody knows" → valid, generate prompt
- "water" (for Food topic) → valid, it's consumable

PROMPT RULES (if valid):
- promptQuestion: A question that sets up expository writing, referencing their specific selection (1 sentence)
- promptHint: Gentle suggestions starting with "You might..." (1 sentence)
- Keep it appropriate for grades 6-8
- AVOID commands like "Write about", "Describe", "Explain"

EXAMPLE OUTPUT:
{ "valid": true, "promptQuestion": "Why should everyone try birria tacos at least once?", "promptHint": "You might discuss the rich flavors, the consommé for dipping, or what makes them different from regular tacos." }

Be lenient - if borderline, accept it. Only reject if clearly inappropriate or nonsensical.

Return ONLY valid JSON, no markdown or extra text.`;

const ESSAY_LEGACY_SYSTEM_PROMPT = `You are a writing prompt generator for middle school essays (grades 6-8).

Create a two-part prompt that guides students to write a 4-5 paragraph essay with:
- A clear thesis statement
- 2-3 body paragraphs with distinct points
- Introduction and conclusion

PROMPT FORMAT:
1. promptQuestion: Opening question that invites analysis or argument (1 sentence)
2. promptHint: Guiding prompts using "Consider..." and "Think about..." to hint at body paragraph angles (2 sentences)

RULES:
- Make it DEBATABLE or MULTI-FACETED (not just "explain X")
- Each guiding sentence in the hint should suggest a DISTINCT angle for a body paragraph
- Topics should feel relevant to middle schoolers' lives
- Avoid requiring specialized knowledge
- Don't use imperative commands ("Write about...", "Explain...")

Examples:
Topic: Screen Time | Angle: benefits and drawbacks
Output: { "promptQuestion": "Is screen time actually harmful, or does it depend on how you use it?", "promptHint": "Consider the difference between mindless scrolling and using screens to create or learn. Think about how screens might affect sleep, focus, and real-world friendships differently." }

Topic: Homework | Angle: argue for or against
Output: { "promptQuestion": "Should schools give less homework, or is practice outside class essential?", "promptHint": "Consider what homework actually helps you learn versus what feels like busywork. Think about how homework affects students differently based on their activities and home life." }

Return ONLY valid JSON with promptQuestion and promptHint, no markdown or extra text.`;

const ESSAY_SELECTION_SYSTEM_PROMPT = `You are a writing prompt generator for middle school essays (grades 6-8).

A student was asked a question and made a selection. Your job is to:
1. FIRST, validate if their input is appropriate
2. If valid, generate a personalized essay prompt with SEPARATE question and hints

VALIDATION RULES:
- Is it appropriate for grades 6-8? (no violence, profanity, adult content)
- Is it related to the topic category?
- Is it specific enough to write about? (not just "stuff" or "idk")

If INVALID, respond with JSON:
{ "valid": false, "reason": "friendly explanation" }

If VALID, respond with JSON:
{ "valid": true, "promptQuestion": "opening question that invites analysis", "promptHint": "Consider... Think about..." }

PROMPT RULES (if valid):
- promptQuestion: Opening question that invites analysis or argument, referencing their selection (1 sentence)
- promptHint: Two guiding sentences - "Consider..." for body paragraph 1, "Think about..." for body paragraph 2
- Make it DEBATABLE or MULTI-FACETED
- Keep it appropriate for grades 6-8
- AVOID commands like "Write about", "Describe", "Explain"

EXAMPLE OUTPUT:
{ "valid": true, "promptQuestion": "Is gaming actually a waste of time, or does it offer real benefits that adults overlook?", "promptHint": "Consider what skills games teach that you can't learn elsewhere. Think about how gaming affects your mood, focus, and social connections." }

Be lenient - if borderline, accept it. Only reject if clearly inappropriate or nonsensical.

Return ONLY valid JSON, no markdown or extra text.`;

/**
 * @description Generates a writing prompt. Supports legacy flow and new selection flow.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { topic, angle: providedAngle, selection, question, level = 'paragraph' } = body;

    if (!topic || typeof topic !== 'string') {
      return NextResponse.json({ error: 'topic is required' }, { status: 400 });
    }

    const apiKey = getAnthropicApiKey();
    if (!apiKey) {
      return NextResponse.json({ error: 'API not configured' }, { status: 500 });
    }

    const angle =
      providedAngle && typeof providedAngle === 'string'
        ? providedAngle
        : ANGLES[Math.floor(Math.random() * ANGLES.length)];

    // New flow: selection provided - validate and generate personalized prompt
    if (selection && question) {
      return handleSelectionFlow(apiKey, topic, angle, question, selection, level);
    }

    // Legacy flow: no selection - generate generic prompt
    return handleLegacyFlow(apiKey, topic, angle, level);
  } catch (error) {
    console.error('Generate prompt error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Generation failed' },
      { status: 500 }
    );
  }
}

/**
 * @description Handles the legacy prompt generation flow with split question/hint format.
 */
async function handleLegacyFlow(
  apiKey: string,
  topic: string,
  angle: string,
  level: string = 'paragraph'
): Promise<NextResponse> {
  const systemPrompt = level === 'essay' ? ESSAY_LEGACY_SYSTEM_PROMPT : LEGACY_SYSTEM_PROMPT;
  const maxTokens = level === 'essay' ? 300 : 200;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: maxTokens,
      temperature: 0.9,
      messages: [
        {
          role: 'user',
          content: `${systemPrompt}\n\nAngle: ${angle}\n\nTopic: ${topic}`,
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API request failed: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  let text = data.content[0].text.trim();

  // Strip markdown code blocks if present
  if (text.startsWith('```')) {
    text = text.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
  }

  // Parse JSON response
  try {
    const parsed = JSON.parse(text);
    const promptQuestion = parsed.promptQuestion || '';
    const promptHint = parsed.promptHint || '';
    const promptText = `${promptQuestion} ${promptHint}`.trim();

    return NextResponse.json({ promptText, promptQuestion, promptHint });
  } catch {
    // Fallback: try to split on common hint markers
    const hintMarkers = ['You might', 'You could', 'Consider'];
    let promptQuestion = text;
    let promptHint = '';
    
    for (const marker of hintMarkers) {
      const idx = text.indexOf(marker);
      if (idx > 0) {
        promptQuestion = text.slice(0, idx).trim();
        promptHint = text.slice(idx).trim();
        break;
      }
    }

    return NextResponse.json({ promptText: text, promptQuestion, promptHint });
  }
}

/**
 * @description Handles the new selection flow with validation.
 */
async function handleSelectionFlow(
  apiKey: string,
  topic: string,
  angle: string,
  question: string,
  selection: string,
  level: string = 'paragraph'
): Promise<NextResponse> {
  const systemPrompt = level === 'essay' ? ESSAY_SELECTION_SYSTEM_PROMPT : SELECTION_SYSTEM_PROMPT;
  const maxTokens = level === 'essay' ? 400 : 300;

  const userContent = `${systemPrompt}

Question asked: "${question}"
Student's selection: ${selection}
Topic category: ${topic}
Angle: ${angle}`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: maxTokens,
      temperature: 0.9,
      messages: [{ role: 'user', content: userContent }],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API request failed: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  let text = data.content[0].text.trim();

  // Strip markdown code blocks if present
  if (text.startsWith('```')) {
    text = text.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
  }

  // Parse JSON response
  try {
    const parsed = JSON.parse(text);

    if (parsed.valid === false) {
      return NextResponse.json({
        valid: false,
        reason: parsed.reason || 'Please try a different selection.',
      });
    }

    // Handle both new split format and legacy format
    const promptQuestion = parsed.promptQuestion || '';
    const promptHint = parsed.promptHint || '';
    // Combine for backwards compatibility and storage
    const promptText = parsed.promptText || `${promptQuestion} ${promptHint}`.trim();

    return NextResponse.json({
      valid: true,
      promptText,
      promptQuestion,
      promptHint,
      selection,
    });
  } catch {
    // If JSON parsing fails, treat response as the prompt text (fallback)
    // Try to split on common hint markers
    const hintMarkers = ['You might', 'You could', 'Consider'];
    let promptQuestion = text;
    let promptHint = '';
    
    for (const marker of hintMarkers) {
      const idx = text.indexOf(marker);
      if (idx > 0) {
        promptQuestion = text.slice(0, idx).trim();
        promptHint = text.slice(idx).trim();
        break;
      }
    }

    return NextResponse.json({
      valid: true,
      promptText: text,
      promptQuestion,
      promptHint,
      selection,
    });
  }
}
