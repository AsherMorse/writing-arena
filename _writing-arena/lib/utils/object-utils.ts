/**
 * Object utility functions for consistent object operations
 */

/**
 * Check if an object is empty (no keys)
 */
export function isEmptyObject(obj: Record<string, any> | null | undefined): boolean {
  return !obj || Object.keys(obj).length === 0;
}

/**
 * Check if an object is not empty
 */
export function isNotEmptyObject(obj: Record<string, any> | null | undefined): boolean {
  return !!obj && Object.keys(obj).length > 0;
}

/**
 * Get object keys with type safety
 */
export function getObjectKeys<T extends Record<string, any>>(obj: T): Array<keyof T> {
  return Object.keys(obj) as Array<keyof T>;
}

/**
 * Get object values
 */
export function getObjectValues<T extends Record<string, any>>(obj: T): Array<T[keyof T]> {
  return Object.values(obj);
}

/**
 * Get object entries
 */
export function getObjectEntries<T extends Record<string, any>>(obj: T): Array<[keyof T, T[keyof T]]> {
  return Object.entries(obj) as Array<[keyof T, T[keyof T]]>;
}

/**
 * Get the number of keys in an object
 */
export function objectSize(obj: Record<string, any> | null | undefined): number {
  return obj ? Object.keys(obj).length : 0;
}

