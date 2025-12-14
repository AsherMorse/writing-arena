/**
 * AI player submission delay utilities
 * Handles scheduling AI player submissions with random delays
 */

import { randomDelay } from './random-utils';

/**
 * Schedule an AI player submission with a random delay
 * 
 * @param aiPlayer - The AI player object
 * @param submissionFn - Async function to execute for submission
 * @param minDelay - Minimum delay in milliseconds (default: 5000)
 * @param maxDelay - Maximum delay in milliseconds (default: 15000)
 */
export function scheduleAISubmission(
  aiPlayer: { userId: string; displayName?: string },
  submissionFn: () => Promise<void>,
  minDelay: number = 5000,
  maxDelay: number = 15000
): void {
  const delay = randomDelay(minDelay, maxDelay);
  
  setTimeout(async () => {
    try {
      await submissionFn();
    } catch (error) {
      console.error(`❌ Failed to submit AI player ${aiPlayer.userId} (${aiPlayer.displayName || 'Unknown'}):`, error);
    }
  }, delay);
}

