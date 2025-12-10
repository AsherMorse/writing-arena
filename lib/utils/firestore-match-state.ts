/**
 * Firestore matchState helper utilities
 * Centralized functions for fetching and updating matchState documents
 */

import { logger, LOG_CONTEXTS } from '@/lib/utils/logger';

/**
 * Get matchState document from Firestore
 * Returns null if document doesn't exist
 */
export async function getMatchState(matchId: string): Promise<any | null> {
  const { getDoc, doc } = await import('firebase/firestore');
  const { db } = await import('@/lib/config/firebase');
  
  const matchDoc = await getDoc(doc(db, 'matchStates', matchId));
  return matchDoc.exists() ? matchDoc.data() : null;
}

/**
 * Update matchState document in Firestore
 */
export async function updateMatchState(
  matchId: string,
  updates: Record<string, any>
): Promise<void> {
  const { doc, updateDoc } = await import('firebase/firestore');
  const { db } = await import('@/lib/config/firebase');
  
  const matchRef = doc(db, 'matchStates', matchId);
  await updateDoc(matchRef, updates);
}

/**
 * Get rankings for a specific phase from matchState
 */
export async function getMatchRankings(
  matchId: string,
  phase: 1 | 2 | 3
): Promise<any[]> {
  const matchState = await getMatchState(matchId);
  return matchState?.rankings?.[`phase${phase}`] || [];
}

/**
 * Get AI writings for a specific phase from matchState
 */
export async function getMatchAIWritings(
  matchId: string,
  phase: 1 | 2 | 3
): Promise<any[]> {
  const matchState = await getMatchState(matchId);
  return matchState?.aiWritings?.[`phase${phase}`] || [];
}

/**
 * Get AI feedbacks for a specific phase from matchState
 */
export async function getMatchAIFeedbacks(
  matchId: string,
  phase: 1 | 2 | 3
): Promise<any[]> {
  const matchState = await getMatchState(matchId);
  return matchState?.aiFeedbacks?.[`phase${phase}`] || [];
}

/**
 * Get AI revisions for a specific phase from matchState
 */
export async function getMatchAIRevisions(
  matchId: string,
  phase: 1 | 2 | 3
): Promise<any[]> {
  const matchState = await getMatchState(matchId);
  return matchState?.aiRevisions?.[`phase${phase}`] || [];
}

/**
 * Update an array field in matchState (e.g., 'aiWritings.phase1', 'aiFeedbacks.phase2')
 * Optionally merge with existing array items
 */
export async function updateMatchStateArray(
  matchId: string,
  key: string, // e.g., 'aiWritings.phase1'
  items: any[],
  mergeFn?: (existing: any[], newItems: any[]) => any[]
): Promise<void> {
  const matchState = await getMatchState(matchId);
  
  if (!matchState) {
    logger.warn(LOG_CONTEXTS.FIRESTORE_MATCH_STATE, `MatchState ${matchId} does not exist. Cannot update array.`);
    return;
  }

  // Get existing array using dot notation path
  const keys = key.split('.');
  let currentValue: any = matchState;
  for (let i = 0; i < keys.length - 1; i++) {
    currentValue = currentValue?.[keys[i]] || {};
  }
  const existingArray = currentValue?.[keys[keys.length - 1]] || [];

  // Merge or replace
  const finalArray = mergeFn ? mergeFn(existingArray, items) : items;

  // Update using dot notation
  await updateMatchState(matchId, { [key]: finalArray });
}

/**
 * Create matchState document if it doesn't exist
 */
export async function ensureMatchState(
  matchId: string,
  initialData: {
    sessionId?: string;
    players?: any[];
    phase?: number;
    createdAt?: any;
  }
): Promise<void> {
  const matchState = await getMatchState(matchId);
  
  if (!matchState) {
    const { setDoc, doc } = await import('firebase/firestore');
    const { db } = await import('@/lib/config/firebase');
    const matchRef = doc(db, 'matchStates', matchId);
    await setDoc(matchRef, {
      matchId,
      ...initialData,
    });
  }
}

