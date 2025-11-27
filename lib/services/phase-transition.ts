import { doc, getDoc, updateDoc, runTransaction, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/config/firebase';
import { GameSession, Phase } from '@/lib/types/session';
import { SCORING, getRankPhaseDuration } from '@/lib/constants/scoring';

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
 * Get average rank from session players (median of real players' ranks)
 * Used for rank-based phase duration calculation
 */
function getAverageRank(players: Record<string, any>): string | null {
  const ranks: string[] = [];
  
  for (const [userId, player] of Object.entries(players)) {
    if (player.rank && !player.isAI) {
      ranks.push(player.rank);
    }
  }
  
  if (ranks.length === 0) return null;
  
  // Use median rank (middle value) for more stable timing
  ranks.sort();
  const medianIndex = Math.floor(ranks.length / 2);
  return ranks[medianIndex];
}

export async function transitionToNextPhase(
  sessionId: string,
  currentPhase: Phase
): Promise<boolean> {
  try {
    const result = await runTransaction(db, async (transaction) => {
      const sessionRef = doc(db, 'sessions', sessionId);
      const sessionDoc = await transaction.get(sessionRef);
      
      if (!sessionDoc.exists()) {
        throw new Error('Session not found');
      }
      
      const session = sessionDoc.data() as GameSession;
      
      if (session.config.phase !== currentPhase) {
        return false;
      }
      
      if (!allPlayersSubmitted(session, currentPhase)) {
        return false;
      }
      
      // Get average rank for rank-based timing
      const averageRank = getAverageRank(session.players || {});
      
      let nextPhase: Phase | null = null;
      const updates: Record<string, any> = {};
      
      if (currentPhase === 1) {
        nextPhase = 2;
        // Use rank-based duration if rank available, otherwise default
        const phaseDuration = averageRank 
          ? getRankPhaseDuration(averageRank, 2)
          : SCORING.PHASE2_DURATION;
        
        updates['config.phase'] = 2;
        updates['config.phaseDuration'] = phaseDuration;
        updates['timing.phase2StartTime'] = serverTimestamp();
        updates['coordination.allPlayersReady'] = false;
        updates['coordination.readyCount'] = 0;
        updates['state'] = 'active';
        
      } else if (currentPhase === 2) {
        nextPhase = 3;
        // Use rank-based duration if rank available, otherwise default
        const phaseDuration = averageRank 
          ? getRankPhaseDuration(averageRank, 3)
          : SCORING.PHASE3_DURATION;
        
        updates['config.phase'] = 3;
        updates['config.phaseDuration'] = phaseDuration;
        updates['timing.phase3StartTime'] = serverTimestamp();
        updates['coordination.allPlayersReady'] = false;
        updates['coordination.readyCount'] = 0;
        updates['state'] = 'active';
        
      } else if (currentPhase === 3) {
        updates['state'] = 'completed';
        updates['coordination.allPlayersReady'] = true;
      }
      
      updates['updatedAt'] = serverTimestamp();
      
      transaction.update(sessionRef, updates);
      
      return true;
    });
    
    return result;
  } catch (error) {
    throw error;
  }
}

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
    
    if (!allPlayersSubmitted(session, currentPhase)) {
      return false;
    }
    
    if (session.config.phase !== currentPhase) {
      return false;
    }
    
    return await transitionToNextPhase(sessionId, currentPhase);
  } catch (error) {
    return false;
  }
}
