/**
 * Logging utilities for batch ranking operations
 * Provides consistent logging patterns across all ranking endpoints
 */

/**
 * Log a mock fallback warning
 */
export function logMockFallback(endpointName: string, reason: string): void {
  console.warn(`⚠️ ${endpointName} - Falling back to mock rankings: ${reason}`);
}

/**
 * Log successful parsing of AI response
 */
export function logParseSuccess(endpointName: string): void {
  console.log(`✅ ${endpointName} - Successfully parsed AI response`);
}

/**
 * Log mock rankings usage warning
 */
export function logMockRankingsWarning(): void {
  console.warn('⚠️ MOCK RANKINGS - Using fallback scoring (NOT based on actual quality)');
}

