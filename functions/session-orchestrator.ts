/**
 * Cloud Functions for Session Orchestration
 * 
 * This file contains server-side logic for:
 * - Automatic phase transitions
 * - Stale connection cleanup
 * - Session state validation
 * 
 * Deploy with: firebase deploy --only functions
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

/**
 * Get rank tier from rank string (duplicated from lib/constants/rank-timing.ts for cloud function)
 */
function getRankTier(rank: string): string {
  const rankLower = rank.toLowerCase();
  if (rankLower.includes('bronze')) return 'bronze';
  if (rankLower.includes('silver')) return 'silver';
  if (rankLower.includes('gold')) return 'gold';
  if (rankLower.includes('platinum')) return 'platinum';
  if (rankLower.includes('diamond')) return 'diamond';
  if (rankLower.includes('master') || rankLower.includes('grand')) return 'master';
  return 'silver'; // Default
}

/**
 * Get phase duration for rank and phase (duplicated from lib/constants/rank-timing.ts)
 */
function getRankPhaseDuration(rank: string, phase: number): number {
  const tier = getRankTier(rank);
  
  const RANK_TIMING: Record<string, { phase1: number; phase2: number; phase3: number }> = {
    bronze: { phase1: 180, phase2: 150, phase3: 150 },
    silver: { phase1: 240, phase2: 180, phase3: 180 },
    gold: { phase1: 300, phase2: 210, phase3: 210 },
    platinum: { phase1: 360, phase2: 240, phase3: 240 },
    diamond: { phase1: 360, phase2: 240, phase3: 240 },
    master: { phase1: 360, phase2: 240, phase3: 240 },
  };
  
  const config = RANK_TIMING[tier] || RANK_TIMING.silver;
  
  switch (phase) {
    case 1: return config.phase1;
    case 2: return config.phase2;
    case 3: return config.phase3;
    default: return 180; // Default fallback
  }
}

/**
 * Get average rank from session players (for rank-based timing)
 */
function getAverageRank(players: any): string | null {
  const ranks: string[] = [];
  
  for (const [userId, player] of Object.entries(players as Record<string, any>)) {
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

/**
 * Firestore trigger: When a player submits a phase
 * - Check if all real players have submitted
 * - Trigger phase transition if all ready
 */
export const onPlayerSubmission = functions.firestore
  .document('sessions/{sessionId}')
  .onUpdate(async (change, context) => {
    const after = change.after.data();
    const sessionId = context.params.sessionId;
    
    console.log('🔍 SESSION ORCHESTRATOR - Checking submissions for:', sessionId);
    
    // Check if this was a phase submission
    const currentPhase = after.config.phase;
    const phaseKey = `phase${currentPhase}`;
    
    // Count submissions for current phase
    const players = Object.values(after.players as any[]);
    const realPlayers = players.filter((p: any) => !p.isAI);
    const submittedCount = realPlayers.filter(
      (p: any) => p.phases[phaseKey]?.submitted
    ).length;
    
    console.log('📊 SESSION ORCHESTRATOR - Submissions:', {
      phase: currentPhase,
      submitted: submittedCount,
      total: realPlayers.length,
    });
    
    // Check if all real players have submitted
    const allSubmitted = submittedCount === realPlayers.length;
    
    if (allSubmitted && !after.coordination.allPlayersReady) {
      console.log('✅ SESSION ORCHESTRATOR - All players submitted! Transitioning immediately...');
      
      // Transition immediately (no delay)
      await transitionToNextPhase(sessionId, currentPhase);
    }
  });

/**
 * Transition session to next phase
 */
async function transitionToNextPhase(
  sessionId: string,
  currentPhase: number
): Promise<void> {
  console.log('🔄 SESSION ORCHESTRATOR - Transitioning from phase', currentPhase);
  
  const sessionRef = db.collection('sessions').doc(sessionId);
  const sessionDoc = await sessionRef.get();
  
  if (!sessionDoc.exists) {
    console.error('❌ SESSION ORCHESTRATOR - Session not found:', sessionId);
    return;
  }
  
  const session = sessionDoc.data();
  if (!session) return;
  
  // Get average rank for rank-based timing
  const averageRank = getAverageRank(session.players);
  
  // Determine next phase
  let nextPhase: number | null = null;
  const updates: any = {};
  
  if (currentPhase === 1) {
    nextPhase = 2;
    const now = admin.firestore.Timestamp.now();
    
    // Use rank-based duration if rank available, otherwise default
    const phaseDuration = averageRank 
      ? getRankPhaseDuration(averageRank, 2)
      : 180; // Default 3 minutes
    
    updates['config.phase'] = 2;
    updates['config.phaseDuration'] = phaseDuration;
    updates['timing.phase2StartTime'] = now; // Use Timestamp.now() instead of serverTimestamp()
    updates['coordination.allPlayersReady'] = false;
    updates['coordination.readyCount'] = 0;
    updates['state'] = 'active';
    updates['updatedAt'] = now;
    
    console.log(`🔄 SESSION ORCHESTRATOR - Transitioning to phase 2 (${phaseDuration}s / ${Math.round(phaseDuration/60)} min)${averageRank ? ` - Rank: ${averageRank}` : ' - Default'}`);
    console.log('🕐 SESSION ORCHESTRATOR - Phase 2 start time set to:', now.toMillis());
    
  } else if (currentPhase === 2) {
    nextPhase = 3;
    const now = admin.firestore.Timestamp.now();
    
    // Use rank-based duration if rank available, otherwise default
    const phaseDuration = averageRank 
      ? getRankPhaseDuration(averageRank, 3)
      : 240; // Default 4 minutes
    
    updates['config.phase'] = 3;
    updates['config.phaseDuration'] = phaseDuration;
    updates['timing.phase3StartTime'] = now; // Use Timestamp.now() instead of serverTimestamp()
    updates['coordination.allPlayersReady'] = false;
    updates['coordination.readyCount'] = 0;
    updates['state'] = 'active';
    updates['updatedAt'] = now;
    
    console.log(`🔄 SESSION ORCHESTRATOR - Transitioning to phase 3 (${phaseDuration}s / ${Math.round(phaseDuration/60)} min)${averageRank ? ` - Rank: ${averageRank}` : ' - Default'}`);
    console.log('🕐 SESSION ORCHESTRATOR - Phase 3 start time set to:', now.toMillis());
    
  } else if (currentPhase === 3) {
    // Session complete
    const now = admin.firestore.Timestamp.now();
    
    updates['state'] = 'completed';
    updates['coordination.allPlayersReady'] = true;
    updates['updatedAt'] = now;
    
    console.log('🎉 SESSION ORCHESTRATOR - Session completed!');
  }
  
  await sessionRef.update(updates);
  
  if (nextPhase) {
    console.log(`✅ SESSION ORCHESTRATOR - Transitioned to phase ${nextPhase}`);
  } else {
    console.log('✅ SESSION ORCHESTRATOR - Session marked as completed');
  }
}

/**
 * Scheduled function: Clean up stale connections
 * Runs every minute to detect disconnected players
 */
export const cleanupStaleConnections = functions.pubsub
  .schedule('every 1 minutes')
  .onRun(async () => {
    console.log('🧹 SESSION ORCHESTRATOR - Running stale connection cleanup');
    
    const now = admin.firestore.Timestamp.now();
    const staleThreshold = 15; // seconds without heartbeat = disconnected
    const abandonThreshold = 300; // 5 minutes = abandon session
    
    // Get all active sessions
    const sessionsSnapshot = await db
      .collection('sessions')
      .where('state', 'in', ['forming', 'active', 'waiting', 'transitioning'])
      .get();
    
    console.log(`🔍 SESSION ORCHESTRATOR - Checking ${sessionsSnapshot.size} active sessions`);
    
    const batch = db.batch();
    let updatedCount = 0;
    let abandonedCount = 0;
    
    for (const doc of sessionsSnapshot.docs) {
      const session = doc.data();
      let hasActivePlayer = false;
      const sessionAge = now.seconds - session.createdAt.seconds;
      
      // Check each player's heartbeat
      for (const [userId, player] of Object.entries(session.players as Record<string, any>)) {
        if (player.isAI) continue; // Skip AI players
        
        const secondsSinceHeartbeat = now.seconds - player.lastHeartbeat.seconds;
        
        if (secondsSinceHeartbeat > staleThreshold && player.status === 'connected') {
          // Mark as disconnected
          console.log(`⚠️ SESSION ORCHESTRATOR - Player ${player.displayName} disconnected (${secondsSinceHeartbeat}s since heartbeat)`);
          
          batch.update(doc.ref, {
            [`players.${userId}.status`]: 'disconnected',
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          });
          
          updatedCount++;
        } else if (secondsSinceHeartbeat <= staleThreshold) {
          hasActivePlayer = true;
        }
      }
      
      // If no active players for 5 minutes, abandon session
      if (!hasActivePlayer && sessionAge > abandonThreshold) {
        console.log(`🗑️ SESSION ORCHESTRATOR - Abandoning session ${doc.id} (${sessionAge}s old, no active players)`);
        
        batch.update(doc.ref, {
          state: 'abandoned',
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        
        abandonedCount++;
      }
    }
    
    // Commit batch updates
    if (updatedCount > 0 || abandonedCount > 0) {
      await batch.commit();
      console.log(`✅ SESSION ORCHESTRATOR - Cleanup complete: ${updatedCount} players disconnected, ${abandonedCount} sessions abandoned`);
    } else {
      console.log('✅ SESSION ORCHESTRATOR - No stale connections found');
    }
  });

/**
 * HTTP function: Get session stats (for monitoring)
 */
export const getSessionStats = functions.https.onRequest(async (req, res) => {
  try {
    const stats = {
      total: 0,
      byState: {} as Record<string, number>,
      byMode: {} as Record<string, number>,
      averagePlayersPerSession: 0,
    };
    
    const sessionsSnapshot = await db.collection('sessions').get();
    stats.total = sessionsSnapshot.size;
    
    let totalPlayers = 0;
    
    sessionsSnapshot.forEach(doc => {
      const session = doc.data();
      
      // Count by state
      stats.byState[session.state] = (stats.byState[session.state] || 0) + 1;
      
      // Count by mode
      stats.byMode[session.mode] = (stats.byMode[session.mode] || 0) + 1;
      
      // Count players
      totalPlayers += Object.keys(session.players).length;
    });
    
    stats.averagePlayersPerSession = stats.total > 0 
      ? totalPlayers / stats.total 
      : 0;
    
    res.json(stats);
  } catch (error) {
    console.error('❌ SESSION ORCHESTRATOR - Error getting stats:', error);
    res.status(500).json({ error: 'Failed to get session stats' });
  }
});


