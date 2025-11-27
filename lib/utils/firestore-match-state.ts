/**
 * Firestore matchState helper utilities
 * Centralized functions for fetching and updating matchState documents
 */

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

