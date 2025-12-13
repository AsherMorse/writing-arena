/**
 * @fileoverview API endpoint to generate selection options for ranked prompts.
 * Returns a question and 6 options based on the topic and angle.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAnthropicApiKey } from '@/lib/utils/api-helpers';

const SYSTEM_PROMPT = `You help students pick what to write about. Generate a question and 6 options.

VOICE:
- Questions should sound casual, like asking a friend
- Not formal or teacher-y

QUESTION STYLES (vary these - don't always use the same pattern):
- "What's your go-to [X]?"
- "Which [X] is overrated?"
- "Which [X] would you defend to the death?"
- "What [X] do you wish more people knew about?"
- "Which [X] hits different?"
- "What's the best [X] and why?"
- "Pick your favorite [X]"

OPTIONS:
- 6 specific choices recognizable to grades 6-8
- Mix popular + underrated + different categories
- 1-3 words each
- Include at least one unexpected/niche option

OUTPUT FORMAT:
{ "question": "casual question", "options": ["opt1", "opt2", "opt3", "opt4", "opt5", "opt6"] }

EXAMPLES:
Topic: Pizza | Vibe: hype it up
{ "question": "What pizza topping is elite?", "options": ["Pepperoni", "Hawaiian", "Meat lovers", "Plain cheese", "BBQ chicken", "Buffalo chicken"] }

Topic: Music | Vibe: defend an unpopular opinion  
{ "question": "What music do you secretly love?", "options": ["Country", "Classical", "K-pop", "Old school rap", "Show tunes", "Video game soundtracks"] }

Topic: Video Games | Vibe: convince a skeptical friend
{ "question": "What game would you make a non-gamer play?", "options": ["Minecraft", "Mario Kart", "Stardew Valley", "Wii Sports", "Tetris", "Among Us"] }

Return ONLY valid JSON, no markdown.`;

const ESSAY_OPTIONS_PROMPT = `You help students pick what to write an essay about. Generate a debatable question and 6 options.

VOICE:
- Questions should invite an argument or strong opinion
- Sound like a debate topic, not a school assignment

QUESTION STYLES (vary these):
- "What [X] would you defend?"
- "What [X] do people get wrong?"
- "What [X] deserves more respect?"
- "What [X] is the most controversial?"
- "What [X] would you argue about?"
- "Which [X] matters most?"

OPTIONS:
- 6 specific choices that invite different arguments
- Should be things people actually disagree about
- 1-3 words each
- Mix mainstream + controversial + unexpected

OUTPUT FORMAT:
{ "question": "debatable question", "options": ["opt1", "opt2", "opt3", "opt4", "opt5", "opt6"] }

EXAMPLES:
Topic: Screen Time | Vibe: settle an argument
{ "question": "What screen time is actually worth it?", "options": ["Gaming", "YouTube", "TikTok", "Texting", "Netflix", "Making stuff"] }

Topic: School | Vibe: defend an unpopular opinion
{ "question": "What school thing is secretly useful?", "options": ["Homework", "Group projects", "Dress codes", "Early start times", "Standardized tests", "Busy work"] }

Return ONLY valid JSON, no markdown.`;

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
