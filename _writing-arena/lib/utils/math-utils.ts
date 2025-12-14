/**
 * Math utility functions for consistent mathematical operations
 */

/**
 * Round a number to the nearest integer
 */
export function roundScore(score: number): number {
  return Math.round(score);
}

/**
 * Clamp a value between min and max (inclusive)
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Floor division (dividend / divisor, floored)
 */
export function floorDiv(dividend: number, divisor: number): number {
  return Math.floor(dividend / divisor);
}

/**
 * Ceiling division (dividend / divisor, ceiled)
 */
export function ceilDiv(dividend: number, divisor: number): number {
  return Math.ceil(dividend / divisor);
}

/**
 * Get the maximum of two numbers
 */
export function max(a: number, b: number): number {
  return Math.max(a, b);
}

/**
 * Get the minimum of two numbers
 */
export function min(a: number, b: number): number {
  return Math.min(a, b);
}

