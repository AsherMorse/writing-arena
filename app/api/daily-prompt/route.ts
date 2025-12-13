/**
 * @fileoverview API endpoint to generate writing prompts for ranked mode.
 * Supports both legacy flow (topic only) and new selection flow (with validation).
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAnthropicApiKey } from '@/lib/utils/api-helpers';
import { VIBES } from '@/lib/services/ranked-prompts';

const LEGACY_SYSTEM_PROMPT = `You generate writing prompts for middle schoolers (grades 6-8).

Given a topic and a creative direction (vibe), create a question that sparks real thinking.

VOICE:
- Write like you're starting a conversation, not giving an assignment
- Questions should sound like something kids actually argue about at lunch
- Be direct and punchy, not formal

QUESTION STYLES (vary these):
- Provocative: "Is [X] actually overrated?"
- Opinion: "What's your hot take on [X]?"
- Hypothetical: "If [X] disappeared tomorrow, would anyone care?"
- Debate: "Which is better: [A] or [B]?"
- Myth-busting: "What do most people get wrong about [X]?"
- Underdog: "Why do people sleep on [X]?"
- Convince me: "Why should someone who doesn't care about [X] give it a chance?"

OUTPUT FORMAT:
{ "promptQuestion": "your engaging question", "promptHint": "You might touch on..." }

EXAMPLES:
Topic: Pizza | Vibe: defend an unpopular opinion
{ "promptQuestion": "Is cold pizza actually better than fresh pizza?",  "promptHint": "You might touch on the texture, convenience, or why reheating ruins it." }

Topic: Video Games | Vibe: convince a skeptical friend
{ "promptQuestion": "Why should someone who thinks games are a waste of time give them a real chance?", "promptHint": "You might touch on what games teach, the social side, or games that break the stereotype." }

Topic: Homework | Vibe: give your honest hot take
{ "promptQuestion": "Is homework actually helpful, or is it just busywork?", "promptHint": "You might touch on what kinds of homework are useful vs. pointless." }

Return ONLY valid JSON, no markdown.`;

const SELECTION_SYSTEM_PROMPT = `You generate personalized writing prompts for middle schoolers (grades 6-8).

A student picked something specific. Turn their choice into an engaging prompt.

VALIDATION (be lenient - only reject if clearly inappropriate or nonsense):
- "your mom", profanity, drugs → { "valid": false, "reason": "Let's pick something real!" }
- "asdfghjkl", "idk" → { "valid": false, "reason": "Try something specific!" }
- Anything else borderline → accept it and make it work

VOICE:
- Write like you're starting a conversation, not giving an assignment
- Questions should feel personal to their choice
- Be direct and punchy

QUESTION STYLES (vary these):
- "Is [their pick] overrated or underrated?"
- "What makes [their pick] worth people's time?"
- "Why should someone try [their pick]?"
- "What do people get wrong about [their pick]?"
- "Why is [their pick] better than people think?"

OUTPUT FORMAT:
{ "valid": true, "promptQuestion": "engaging question about their pick", "promptHint": "You might touch on..." }

EXAMPLES:
Selection: "Minecraft" for Video Games
{ "valid": true, "promptQuestion": "Why has Minecraft stayed popular for over a decade when most games die in a year?", "promptHint": "You might touch on creativity, the community, or what makes it different from other games." }

Selection: "birria tacos" for Food
{ "valid": true, "promptQuestion": "What makes birria tacos worth the hype?", "promptHint": "You might touch on the flavors, the consommé, or what sets them apart from regular tacos." }

Return ONLY valid JSON, no markdown.`;

const ESSAY_LEGACY_SYSTEM_PROMPT = `You generate essay prompts for middle schoolers (grades 6-8).

Given a topic and creative direction (vibe), create a debatable question that invites a real argument.

VOICE:
- Questions should feel like debates kids actually have
- Make it something worth arguing about, not just explaining
- Be direct and provocative

QUESTION STYLES (vary these):
- "Is [X] actually [common belief], or is that just what people assume?"
- "Should [X] be [controversial stance]?"
- "Does [X] do more harm or good?"
- "Is [X] overrated, underrated, or exactly right?"
- "Why do adults and kids see [X] so differently?"

The hint should suggest 2 distinct angles for body paragraphs.

OUTPUT FORMAT:
{ "promptQuestion": "debatable question", "promptHint": "Consider [angle 1]. Think about [angle 2]." }

EXAMPLES:
Topic: Screen Time | Vibe: settle an argument
{ "promptQuestion": "Is screen time actually bad for you, or is that just what adults say?", "promptHint": "Consider whether all screen time is the same. Think about what you'd lose if screens disappeared." }

Topic: Homework | Vibe: defend an unpopular opinion
{ "promptQuestion": "Should homework be optional?", "promptHint": "Consider what homework actually teaches versus what you could learn other ways. Think about who benefits from homework and who doesn't." }

Return ONLY valid JSON, no markdown.`;

const ESSAY_SELECTION_SYSTEM_PROMPT = `You generate personalized essay prompts for middle schoolers (grades 6-8).

A student picked something specific. Turn their choice into a debatable essay prompt.

VALIDATION (be lenient - only reject if clearly inappropriate or nonsense):
- profanity, drugs, violence → { "valid": false, "reason": "Let's pick something else!" }
- "idk", gibberish → { "valid": false, "reason": "Try something specific!" }
- Anything else borderline → accept it and make it work

VOICE:
- Questions should feel like debates worth having
- Make it arguable, not just explainable
- Reference their specific choice

OUTPUT FORMAT:
{ "valid": true, "promptQuestion": "debatable question about their pick", "promptHint": "Consider [angle 1]. Think about [angle 2]." }

EXAMPLES:
Selection: "TikTok" for Social Media
{ "valid": true, "promptQuestion": "Is TikTok making us smarter or dumber?", "promptHint": "Consider what you actually learn from TikTok versus what's just noise. Think about how it compares to other ways of spending time." }

Selection: "Fortnite" for Video Games  
{ "valid": true, "promptQuestion": "Is Fortnite a real skill, or just a time-waster?", "promptHint": "Consider what playing Fortnite actually teaches. Think about whether competitive gaming deserves the same respect as sports." }

Return ONLY valid JSON, no markdown.`;

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
        : VIBES[Math.floor(Math.random() * VIBES.length)];

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
