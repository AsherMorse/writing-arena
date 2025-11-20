/**
 * API helper utilities for Anthropic API integration
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
      max_tokens: maxTokens,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Claude API request failed: ${response.status} - ${errorText}`);
  }

  return response.json();
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

