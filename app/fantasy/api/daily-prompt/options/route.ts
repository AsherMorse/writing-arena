/**
 * @fileoverview API endpoint to generate selection options for ranked prompts.
 * Returns a question and 6 options based on the topic and angle.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAnthropicApiKey } from '@/lib/utils/api-helpers';

const SYSTEM_PROMPT = `You are helping students pick what to write about. Given a broad topic and an angle, generate:

1. A selection question that fits the angle
2. 6 specific options students can choose from

Critical Rule:
- Questions should be direct and conversational

Other Rules:
- The question should feel natural for the angle (see mappings below)
- Options should be specific, recognizable to grades 6-8
- Options should vary (popular + niche + different categories)
- Keep options 1-3 words each
- For "comparing" angle, options should be pairs like "Pizza vs Tacos"

Angle → Question style:
- "unique or special" → "Which [X] stands out from the rest?"
- "affects or connects to people" → "Which [X] means something to you?"
- "comparing this topic to something similar" → "Pick two [X]s to compare"
- "why people find this topic interesting" → "Which [X] is underrated?" or "Which [X] do you love?"
- "how this topic works" → "Which [X] would you explain to someone?"
- "benefits or positive aspects" → "Which [X] should everyone try?"
- "different types or varieties" → "Which type of [X] is your style?"
- "what someone new to this topic should know" → "Which [X] would you recommend to a beginner?"

Return ONLY valid JSON in this exact format:
{
  "question": "...",
  "options": ["...", "...", "...", "...", "...", "..."]
}`;

const ESSAY_OPTIONS_PROMPT = `You are helping students pick what to write an essay about. Given a broad topic and an angle, generate:

1. A selection question that fits the angle and invites debate
2. 6 specific options students can choose from

Critical Rule:
- Questions should feel like they're asking for something worth defending or analyzing

Other Rules:
- Options should be specific and recognizable to grades 6-8
- Options should represent different perspectives or examples within the topic
- Keep options 1-3 words each
- For "compare" angles, options should be pairs like "Online vs In-Person"

Angle → Question style:
- "Argue for or against" → "What [X] would you defend or argue against?"
- "Compare and contrast" → "Pick two [X]s to compare"
- "Causes and effects" → "What [X] has the biggest impact on your life?"
- "Benefits and drawbacks" → "What [X] do you disagree with most?"
- "Why this matters" → "What [X] should more people care about?"
- "Different groups" → "What [X] affects teens differently than adults?"
- "Both sides" → "What [X] debate would you want to settle?"
- "How it's changed" → "What [X] has changed the most in recent years?"

Return ONLY valid JSON in this exact format:
{
  "question": "...",
  "options": ["...", "...", "...", "...", "...", "..."]
}`;

/**
 * @description Generates selection options for a ranked prompt topic.
 */
export async function POST(request: NextRequest) {
  try {
    const { topic, angle, level = 'paragraph' } = await request.json();

    if (!topic || !angle) {
      return NextResponse.json(
        { error: 'topic and angle are required' },
        { status: 400 }
      );
    }

    const apiKey = getAnthropicApiKey();
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API not configured' },
        { status: 500 }
      );
    }

    const systemPrompt = level === 'essay' ? ESSAY_OPTIONS_PROMPT : SYSTEM_PROMPT;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: 300,
        temperature: 0.8,
        messages: [
          {
            role: 'user',
            content: `${systemPrompt}\n\nTopic: ${topic}\nAngle: ${angle}`,
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
    const parsed = JSON.parse(text);

    if (!parsed.question || !Array.isArray(parsed.options)) {
      throw new Error('Invalid response format from AI');
    }

    return NextResponse.json({
      topic,
      angle,
      question: parsed.question,
      options: parsed.options,
    });
  } catch (error) {
    console.error('Generate options error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Generation failed' },
      { status: 500 }
    );
  }
}
