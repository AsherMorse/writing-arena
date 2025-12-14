/**
 * Random number utilities for consistent mock data generation
 */

export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function randomFloat(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

export function randomScore(base: number, variance: number): number {
  return Math.round(base + Math.random() * variance);
}

// Common score ranges
export function randomWritingScore(): number {
  return randomScore(60, 30); // 60-90
}

export function randomFeedbackScore(): number {
  return randomScore(75, 20); // 75-95
}

export function randomRevisionScore(): number {
  return randomScore(70, 25); // 70-95
}

/**
 * Generate a random delay in milliseconds between min and max
 * Useful for AI player submission delays
 */
export function randomDelay(minMs: number, maxMs: number): number {
  return Math.round(minMs + Math.random() * (maxMs - minMs));
}

