import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/config/firebase';
import { Phase } from '@/lib/types/session';
import { SCORING } from '@/lib/constants/scoring';

/**
 * Update session phase and timing
 */
export async function updateSessionPhase(
  sessionId: string,
  phase: Phase,
  phaseDuration: number
): Promise<void> {
  const sessionRef = doc(db, 'sessions', sessionId);
  
  await updateDoc(sessionRef, {
    'config.phase': phase,
    'config.phaseDuration': phaseDuration,
    [`timing.phase${phase}StartTime`]: serverTimestamp(),
    'coordination.allPlayersReady': true,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Mark player as ready for a phase
 */
export async function markPlayerReady(
  sessionId: string,
  userId: string,
  phase: Phase
): Promise<void> {
  const sessionRef = doc(db, 'sessions', sessionId);
  
  await updateDoc(sessionRef, {
    [`players.${userId}.phases.phase${phase}.submitted`]: true,
    [`players.${userId}.phases.phase${phase}.submittedAt`]: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

/**
 * Transition session to next phase
 */
export async function transitionToPhase(
  sessionId: string,
  nextPhase: Phase,
  readyCount: number
): Promise<void> {
  const sessionRef = doc(db, 'sessions', sessionId);
  
  const phaseDuration =
    nextPhase === 1
      ? SCORING.PHASE1_DURATION
      : nextPhase === 2
      ? SCORING.PHASE2_DURATION
      : SCORING.PHASE3_DURATION;

  const updateData: any = {
    'coordination.allPlayersReady': true,
    'coordination.readyCount': readyCount,
    'config.phase': nextPhase,
    'config.phaseDuration': phaseDuration,
    [`timing.phase${nextPhase}StartTime`]: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  await updateDoc(sessionRef, updateData);
}

/**
 * Mark session as completed
 */
export async function markSessionCompleted(sessionId: string): Promise<void> {
  const sessionRef = doc(db, 'sessions', sessionId);
  
  await updateDoc(sessionRef, {
    'coordination.allPlayersReady': true,
    'state': 'completed',
    updatedAt: serverTimestamp(),
  });
}

