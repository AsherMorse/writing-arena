/**
 * @fileoverview API endpoint to generate topic background information for writing inspiration.
 * Uses OpenAI o3-mini to generate factual context about the writing prompt topic.
 */

import { NextRequest, NextResponse } from 'next/server';
import { callOpenAIAPI, getOpenAIApiKey } from '@/lib/utils/api-helpers';

const SYSTEM_PROMPT = `You are generating background information to help a student write about a topic.

Given a writing prompt, provide factual background information about the topic that the student can draw from when writing their response.

Rules:
1. Provide 3-4 sentences of factual, interesting information about the topic
2. Include specific details, examples, or facts the student could use
3. Keep language appropriate for grades 6-8
4. Be informative but not overwhelming
5. Focus on the specific angle mentioned in the prompt

Return your response as JSON with this structure:
{
  "backgroundInfo": "3-4 sentences of factual background information about the topic."
}`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.prompt || typeof body.prompt !== 'string') {
      return NextResponse.json({ error: 'prompt is required' }, { status: 400 });
    }

    const prompt = body.prompt.trim();
    
    if (prompt.length < 10) {
      return NextResponse.json({ error: 'prompt is too short' }, { status: 400 });
    }

    const apiKey = getOpenAIApiKey();
    if (!apiKey) {
      return NextResponse.json({ error: 'API not configured' }, { status: 500 });
    }

    const fullPrompt = `${SYSTEM_PROMPT}

Writing prompt: "${prompt}"

Generate background information to help the student write about this topic.`;

    const response = await callOpenAIAPI(apiKey, fullPrompt, 500);
    const text = response.content[0].text;
    
    const parsed = JSON.parse(text);
    
    if (!parsed.backgroundInfo || typeof parsed.backgroundInfo !== 'string') {
      throw new Error('Invalid response format');
    }

    return NextResponse.json({ backgroundInfo: parsed.backgroundInfo });
  } catch (error) {
    console.error('Inspiration generation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Generation failed' },
      { status: 500 }
    );
  }
}
