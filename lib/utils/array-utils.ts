/**
 * Array utility functions for consistent array operations
 */

/**
 * Check if an array is empty or null/undefined
 */
export function isEmpty<T>(array: T[] | null | undefined): boolean {
  return !array || array.length === 0;
}

/**
 * Check if an array is not empty
 */
export function isNotEmpty<T>(array: T[] | null | undefined): array is T[] {
  return !!array && array.length > 0;
}

/**
 * Get the first element of an array, or null if empty
 */
export function first<T>(array: T[] | null | undefined): T | null {
  return array && array.length > 0 ? array[0] : null;
}

/**
 * Get the last element of an array, or null if empty
 */
export function last<T>(array: T[] | null | undefined): T | null {
  return array && array.length > 0 ? array[array.length - 1] : null;
}

/**
 * Get array length safely (returns 0 for null/undefined)
 */
export function length<T>(array: T[] | null | undefined): number {
  return array ? array.length : 0;
}

