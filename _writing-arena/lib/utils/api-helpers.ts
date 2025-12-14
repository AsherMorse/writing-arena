/**
 * @fileoverview API helper utilities for LLM integrations (Anthropic + OpenAI).
 */

import OpenAI from 'openai';

/**
 * @description Get the OpenAI API key from environment.
 */
export function getOpenAIApiKey(): string | null {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;
  return apiKey;
}

/**
 * @description Call OpenAI API with o3-mini model and JSON mode.
 * Returns response in same format as Anthropic for compatibility.
 */
export async function callOpenAIAPI(
  apiKey: string,
  prompt: string,
  maxTokens: number = 2000
): Promise<{ content: [{ type: string; text: string }] }> {
  const openai = new OpenAI({ apiKey });

  const response = await openai.chat.completions.create({
    model: 'o3-mini',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
  });

  const text = response.choices[0].message.content || '';

  return {
    content: [{ type: 'text', text }],
  };
}

/**
 * @description Get the Anthropic API key from environment.
 */
export function getAnthropicApiKey(): string | null {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey || apiKey === 'your_api_key_here') {
    return null;
  }
  return apiKey;
}

export function isApiKeyConfigured(): boolean {
  return getAnthropicApiKey() !== null;
}

export function logApiKeyStatus(context: string): void {
  const apiKey = getAnthropicApiKey();
  const hasKey = !!apiKey;
  const keyLength = apiKey?.length || 0;
  const keyPrefix = apiKey?.substring(0, 8) || 'none';
  const isPlaceholder = apiKey === 'your_api_key_here';
  
  console.log(`🔍 ${context} - API Key Check:`, {
    hasKey,
    keyLength,
    keyPrefix: `${keyPrefix}...`,
    isPlaceholder,
    envKeys: Object.keys(process.env).filter(k => k.includes('ANTHROPIC') || k.includes('API')).join(', '),
  });
  
  if (!hasKey) {
    console.warn(`⚠️ ${context} - API key missing or invalid, using fallback`);
    console.warn(`⚠️ ${context} - If deploying to Vercel, set ANTHROPIC_API_KEY in Vercel environment variables`);
    console.warn(`⚠️ ${context} - If running locally, ensure ANTHROPIC_API_KEY is in .env.local`);
  }
}

export async function callAnthropicAPI(
  apiKey: string,
  prompt: string,
  maxTokens: number = 2000
): Promise<any> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 16000,
      thinking: {
        type: 'enabled',
        budget_tokens: 10000,
      },
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Claude API request failed: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  
  const textBlock = data.content?.find((c: any) => c.type === 'text');
  if (textBlock) {
    data.content = [{ type: 'text', text: textBlock.text }];
  }
  
  return data;
}

/**
 * Stream responses from Anthropic Claude API
 * Returns a ReadableStream that yields text chunks
 */
export async function streamAnthropicAPI(
  apiKey: string,
  prompt: string,
  maxTokens: number = 2000
): Promise<ReadableStream<Uint8Array>> {
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
      messages: [{ role: 'user', content: prompt }],
      stream: true,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Claude API request failed: ${response.status} - ${errorText}`);
  }

  if (!response.body) {
    throw new Error('Response body is null');
  }

  return response.body;
}

