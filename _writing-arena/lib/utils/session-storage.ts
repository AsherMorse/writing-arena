/**
 * Session storage utilities
 * Centralized helpers for sessionStorage operations
 * 
 * Note: Consider migrating away from sessionStorage to Firestore
 * for better persistence and cross-device support
 */

/**
 * Get item from session storage
 */
export function getSessionStorage<T = any>(key: string): T | null {
  if (typeof window === 'undefined') return null;
  try {
    const item = sessionStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error(`Error reading sessionStorage key "${key}":`, error);
    return null;
  }
}

/**
 * Set item in session storage
 */
export function setSessionStorage<T = any>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error writing sessionStorage key "${key}":`, error);
  }
}

/**
 * Remove item from session storage
 */
export function clearSessionStorage(key: string): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing sessionStorage key "${key}":`, error);
  }
}

/**
 * Clear all session storage
 */
export function clearAllSessionStorage(): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.clear();
  } catch (error) {
    console.error('Error clearing sessionStorage:', error);
  }
}

