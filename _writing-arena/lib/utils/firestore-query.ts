/**
 * Firestore query utilities for handling common query patterns
 * including fallback handling for failed-precondition errors
 */

/**
 * Executes a primary query with automatic fallback handling
 * Useful for queries that may fail due to missing composite indexes
 * 
 * @param primaryQuery Function that executes the primary query
 * @param fallbackQuery Function that executes a fallback query (usually without filters)
 * @param filterFn Optional function to filter results from fallback query
 * @returns Promise resolving to filtered results
 * 
 * @example
 * const results = await queryWithFallback(
 *   async () => {
 *     const q = query(collection(db, 'sessions'), where('userId', '==', uid), where('mode', '==', 'ranked'));
 *     return (await getDocs(q)).docs.map(doc => ({ id: doc.id, ...doc.data() }));
 *   },
 *   async () => {
 *     const q = query(collection(db, 'sessions'), where('userId', '==', uid));
 *     return (await getDocs(q)).docs.map(doc => ({ id: doc.id, ...doc.data() }));
 *   },
 *   (session) => session.mode === 'ranked'
 * );
 */
export async function queryWithFallback<T>(
  primaryQuery: () => Promise<T[]>,
  fallbackQuery: () => Promise<T[]>,
  filterFn?: (item: T) => boolean
): Promise<T[]> {
  try {
    return await primaryQuery();
  } catch (error: any) {
    if (error?.code === 'failed-precondition') {
      const results = await fallbackQuery();
      return filterFn ? results.filter(filterFn) : results;
    }
    throw error;
  }
}

