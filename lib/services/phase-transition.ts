/**
 * Client-Side Phase Transition Logic
 * Replaces Cloud Function with direct Firestore updates
 * Uses transactions to prevent race conditions
 */

import { doc, getDoc, updateDoc, runTransaction, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/config/firebase';
import { GameSession, Phase } from '@/lib/types/session';
import { SCORING } from '@/lib/constants/scoring';

/**
 * Check if all real players have submitted for current phase
 */
function allPlayersSubmitted(session: GameSession, phase: Phase): boolean {
  const allPlayers = Object.values(session.players || {});
  const realPlayers = allPlayers.filter((p) => !p.isAI);
  
  if (realPlayers.length === 0) return false;
  
  const phaseKey = `phase${phase}` as 'phase1' | 'phase2' | 'phase3';
  const submittedCount = realPlayers.filter(
    (p) => p.phases[phaseKey]?.submitted
  ).length;
  
  return submittedCount === realPlayers.length;
}

/**
 * Transition session to next phase (client-side)
 * Uses Firestore transaction to prevent race conditions
 */
export async function transitionToNextPhase(
  sessionId: string,
  currentPhase: Phase
): Promise<boolean> {
  console.log(`🔄 CLIENT TRANSITION - Attempting to transition from phase ${currentPhase}`);
  
  try {
    // Use transaction to ensure atomic update
    const result = await runTransaction(db, async (transaction) => {
      const sessionRef = doc(db, 'sessions', sessionId);
      const sessionDoc = await transaction.get(sessionRef);
      
      if (!sessionDoc.exists()) {
        throw new Error('Session not found');
      }
      
      const session = sessionDoc.data() as GameSession;
      
      // Double-check we're still in the expected phase (prevent duplicate transitions)
      if (session.config.phase !== currentPhase) {
        console.log(`⚠️ CLIENT TRANSITION - Phase already changed to ${session.config.phase}, aborting`);
        return false;
      }
      
      // Double-check all players have submitted
      if (!allPlayersSubmitted(session, currentPhase)) {
        console.log(`⚠️ CLIENT TRANSITION - Not all players submitted yet, aborting`);
        return false;
      }
      
      // Check if already transitioning (allPlayersReady flag prevents duplicate Cloud Function triggers)
      // But since we're using transactions, the phase check above is sufficient
      
      // Determine next phase
      let nextPhase: Phase | null = null;
      const updates: Record<string, any> = {};
      
      if (currentPhase === 1) {
        nextPhase = 2;
        updates['config.phase'] = 2;
        updates['config.phaseDuration'] = SCORING.PHASE2_DURATION;
        updates['timing.phase2StartTime'] = serverTimestamp();
        updates['coordination.allPlayersReady'] = false;
        updates['coordination.readyCount'] = 0;
        updates['state'] = 'active';
        
        console.log('🔄 CLIENT TRANSITION - Transitioning to phase 2');
        
      } else if (currentPhase === 2) {
        nextPhase = 3;
        updates['config.phase'] = 3;
        updates['config.phaseDuration'] = SCORING.PHASE3_DURATION;
        updates['timing.phase3StartTime'] = serverTimestamp();
        updates['coordination.allPlayersReady'] = false;
        updates['coordination.readyCount'] = 0;
        updates['state'] = 'active';
        
        console.log('🔄 CLIENT TRANSITION - Transitioning to phase 3');
        
      } else if (currentPhase === 3) {
        // Session complete
        updates['state'] = 'completed';
        updates['coordination.allPlayersReady'] = true;
        
        console.log('🎉 CLIENT TRANSITION - Session completed!');
      }
      
      updates['updatedAt'] = serverTimestamp();
      
      // Apply updates atomically
      transaction.update(sessionRef, updates);
      
      return true;
    });
    
    if (result) {
      console.log(`✅ CLIENT TRANSITION - Successfully transitioned from phase ${currentPhase}`);
    }
    
    return result;
  } catch (error) {
    console.error(`❌ CLIENT TRANSITION - Failed to transition phase:`, error);
    throw error;
  }
}

/**
 * Check if phase transition is needed and perform it
 * Safe to call multiple times - uses transaction to prevent duplicates
 */
export async function checkAndTransitionPhase(
  sessionId: string,
  currentPhase: Phase
): Promise<boolean> {
  try {
    const sessionRef = doc(db, 'sessions', sessionId);
    const sessionDoc = await getDoc(sessionRef);
    
    if (!sessionDoc.exists()) {
      return false;
    }
    
    const session = sessionDoc.data() as GameSession;
    
    // Check if all players submitted
    if (!allPlayersSubmitted(session, currentPhase)) {
      return false;
    }
    
    // Check if phase already changed (another client already transitioned)
    if (session.config.phase !== currentPhase) {
      return false;
    }
    
    // Perform transition (transaction will handle race conditions)
    return await transitionToNextPhase(sessionId, currentPhase);
  } catch (error) {
    console.error('❌ PHASE TRANSITION - Error:', error);
    return false;
  }
}

