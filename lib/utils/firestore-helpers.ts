import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/config/firebase';

/**
 * Update match state document with automatic timestamp
 */
export async function updateMatchState(
  matchId: string,
  updates: Record<string, any>
): Promise<void> {
  const matchRef = doc(db, 'matchStates', matchId);
  await updateDoc(matchRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Update session document with automatic timestamp
 */
export async function updateSession(
  sessionId: string,
  updates: Record<string, any>
): Promise<void> {
  const sessionRef = doc(db, 'sessions', sessionId);
  await updateDoc(sessionRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Update rankings for a specific phase
 */
export async function updatePhaseRankings(
  matchId: string,
  phase: 1 | 2 | 3,
  rankings: any[]
): Promise<void> {
  await updateMatchState(matchId, {
    [`rankings.phase${phase}`]: rankings,
  });
}

