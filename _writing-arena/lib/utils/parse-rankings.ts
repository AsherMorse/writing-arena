/**
 * Utilities for parsing rankings with consistent error handling
 * 
 * IMPORTANT: These functions NEVER fall back to mock rankings.
 * If parsing fails, an error is thrown to ensure real AI scores are always used.
 */

import { parseClaudeJSON } from './claude-parser';
import { logParseSuccess } from './ranking-logging';

/**
 * Parse rankings from Claude API response
 * Throws error if parsing fails - NEVER falls back to mock rankings
 * 
 * @param claudeResponse - Raw response text from Claude API
 * @param submissions - Array of submissions to rank
 * @param endpointName - Name of endpoint for logging (e.g., 'BATCH RANK WRITINGS')
 * @param parseFn - Function to parse valid rankings from parsed JSON
 * @returns Array of parsed rankings
 * @throws Error if parsing fails
 */
export function parseRankings<TSubmission, TRanking>(
  claudeResponse: string,
  submissions: TSubmission[],
  endpointName: string,
  parseFn: (parsed: { rankings: any[] }, submissions: TSubmission[]) => TRanking[]
): TRanking[] {
  const parsed = parseClaudeJSON<{ rankings: any[] }>(claudeResponse);
  
  if (!parsed || !parsed.rankings) {
    const errorMessage = `${endpointName} - Failed to parse AI response. Response: ${claudeResponse.substring(0, 200)}...`;
    console.error(`❌ ${errorMessage}`);
    throw new Error(errorMessage);
  }
  
  logParseSuccess(endpointName);
  return parseFn(parsed, submissions);
}

/**
 * @deprecated Use parseRankings instead - this function falls back to mocks which we don't want
 * Kept for backwards compatibility but will be removed
 */
export function parseRankingsWithFallback<TSubmission, TRanking>(
  claudeResponse: string,
  submissions: TSubmission[],
  endpointName: string,
  parseFn: (parsed: { rankings: any[] }, submissions: TSubmission[]) => TRanking[],
  generateMockFn: (submissions: TSubmission[]) => { rankings: TRanking[] }
): TRanking[] {
  console.warn(`⚠️ parseRankingsWithFallback is deprecated - use parseRankings instead`);
  return parseRankings(claudeResponse, submissions, endpointName, parseFn);
}

