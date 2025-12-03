/**
 * Session Operations
 * Handles CRUD operations for game sessions
 */

import { db } from '../config/firebase';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  runTransaction,
  collection,
  query,
  where,
  getDocs,
  limit,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import {
  GameSession,
  PlayerInfo,
  PhaseSubmissionData,
  Phase,
  CreateSessionOptions,
  SessionPlayer,
} from '../types/session';
import { getRankPhaseDuration, SCORING } from '../constants/scoring';
import { generateConnectionId } from './session-connection';
import { createLogger, LOG_CONTEXTS } from '../utils/logger';

const log = createLogger(LOG_CONTEXTS.SESSION_OPERATIONS);

export async function findFormingSession(trait: string): Promise<string | null> {
  const sessionsRef = collection(db, 'sessions');
  const formingQuery = query(
    sessionsRef,
    where('state', '==', 'forming'),
    where('config.trait', '==', trait),
    limit(1)
  );
  
  try {
    const snapshot = await getDocs(formingQuery);
    if (!snapshot.empty) {
      return snapshot.docs[0].id;
    }
  } catch (error) {
    log.error('Error finding existing session', error);
  }
  
  return null;
}

export async function createFormingSession(
  userId: string,
  playerInfo: PlayerInfo,
  trait: string,
  connectionId: string
): Promise<GameSession> {
  const sessionId = `session-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  const matchId = `match-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  
  const session: GameSession = {
    sessionId,
    matchId,
    mode: 'ranked',
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    config: {
      trait,
      promptId: '',
      promptType: 'narrative',
      phase: 1,
      phaseDuration: 120,
    },
    players: {
      [userId]: {
        userId,
        displayName: playerInfo.displayName,
        avatar: playerInfo.avatar,
        rank: playerInfo.rank,
        isAI: false,
        status: 'connected',
        lastHeartbeat: Timestamp.now(),
        connectionId,
        phases: {},
      },
    },
    state: 'forming',
    timing: {},
    coordination: {
      readyCount: 0,
      allPlayersReady: false,
    },
    metadata: {
      createdBy: userId,
      version: 1,
    },
  };
  
  const sessionRef = doc(db, 'sessions', sessionId);
  try {
    await setDoc(sessionRef, session);
    log.info('Created forming session', { sessionId });
  } catch (error) {
    log.error('Failed to create session in Firestore', error);
    throw error;
  }
  
  return {
    ...session,
    sessionId,
  };
}

export async function addPlayerToSession(
  sessionId: string,
  userId: string,
  playerInfo: PlayerInfo,
  connectionId: string,
  isAI: boolean = false
): Promise<void> {
  const sessionRef = doc(db, 'sessions', sessionId);
  
  await updateDoc(sessionRef, {
    [`players.${userId}`]: {
      userId,
      displayName: playerInfo.displayName,
      avatar: playerInfo.avatar,
      rank: playerInfo.rank,
      isAI,
      status: 'connected',
      lastHeartbeat: serverTimestamp(),
      connectionId: isAI ? 'ai-connection' : connectionId,
      phases: {},
    },
    updatedAt: serverTimestamp(),
  });
}

export async function startSession(
  sessionId: string,
  promptId: string,
  promptType: string,
  phaseDuration: number,
  userRank?: string
): Promise<void> {
  const sessionRef = doc(db, 'sessions', sessionId);
  
  // Use rank-based duration if rank provided, otherwise use passed duration
  const actualPhaseDuration = userRank 
    ? getRankPhaseDuration(userRank, 1)
    : phaseDuration;
  
  await updateDoc(sessionRef, {
    'state': 'active',
    'config.promptId': promptId,
    'config.promptType': promptType,
    'config.phaseDuration': actualPhaseDuration,
    'timing.phase1StartTime': serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function createSession(
  options: CreateSessionOptions,
  connectionId: string
): Promise<GameSession> {
  const sessionId = `session-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  const matchId = options.matchId || `match-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  
  const players: { [userId: string]: SessionPlayer } = {};
  for (const player of options.players) {
    players[player.userId] = {
      userId: player.userId,
      displayName: player.displayName,
      avatar: player.avatar,
      rank: player.rank,
      isAI: player.isAI || false,
      status: 'connected',
      lastHeartbeat: Timestamp.now(),
      connectionId: player.isAI ? 'ai-connection' : connectionId,
      phases: {},
    };
  }
  
  const session: GameSession = {
    sessionId,
    matchId,
    mode: options.mode,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    config: options.config,
    players,
    state: 'active',
    timing: {
      phase1StartTime: Timestamp.now(),
    },
    coordination: {
      readyCount: 0,
      allPlayersReady: false,
    },
    metadata: {
      createdBy: options.players[0].userId,
      version: 1,
    },
  };
  
  const sessionRef = doc(db, 'sessions', sessionId);
  await setDoc(sessionRef, session);
  
  return session;
}

/**
 * @description Submit phase data and transition to next phase if all real players are done.
 * Uses a transaction to ensure atomicity - no race conditions between submission and phase transition.
 * The last real player to submit triggers the phase transition within the same atomic operation.
 */
export async function submitPhase(
  sessionId: string,
  userId: string,
  phase: Phase,
  data: PhaseSubmissionData
): Promise<{ transitioned: boolean; nextPhase?: Phase }> {
  const sessionRef = doc(db, 'sessions', sessionId);
  
  log.debug(`Submitting phase ${phase} with atomic transition check`, {
    sessionId,
    userId,
    phase,
  });
  
  const result = await runTransaction(db, async (transaction) => {
    const sessionDoc = await transaction.get(sessionRef);
    if (!sessionDoc.exists()) {
      throw new Error('Session not found');
    }
    
    const session = sessionDoc.data() as GameSession;
    
    // 1. Prepare player's phase submission
    const phaseData = {
      submitted: true,
      submittedAt: serverTimestamp(),
      ...data,
    };
    
    const updates: Record<string, any> = {
      [`players.${userId}.phases.phase${phase}`]: phaseData,
      updatedAt: serverTimestamp(),
    };
    
    // 2. Check if this submission completes the phase for all REAL players
    const allPlayers = Object.values(session.players || {});
    const realPlayers = allPlayers.filter(p => !p.isAI);
    const phaseKey = `phase${phase}` as 'phase1' | 'phase2' | 'phase3';
    
    // Count already submitted (excluding current user) + this submission
    const alreadySubmittedCount = realPlayers.filter(
      p => p.userId !== userId && p.phases[phaseKey]?.submitted
    ).length;
    const willAllBeSubmitted = alreadySubmittedCount + 1 === realPlayers.length;
    
    // 3. If all will be submitted AND we're still on this phase, do transition
    let transitioned = false;
    let nextPhase: Phase | undefined;
    
    if (willAllBeSubmitted && session.config.phase === phase) {
      // Get median rank for duration calculation
      const ranks = realPlayers.map(p => p.rank).filter(Boolean);
      ranks.sort();
      const medianRank = ranks.length > 0 ? ranks[Math.floor(ranks.length / 2)] : null;
      
      if (phase === 1) {
        nextPhase = 2;
        const phaseDuration = medianRank 
          ? getRankPhaseDuration(medianRank, 2)
          : SCORING.PHASE2_DURATION;
        
        updates['config.phase'] = 2;
        updates['config.phaseDuration'] = phaseDuration;
        updates['timing.phase2StartTime'] = serverTimestamp();
        updates['coordination.allPlayersReady'] = false;
        updates['coordination.readyCount'] = 0;
        updates['state'] = 'active';
        transitioned = true;
        
      } else if (phase === 2) {
        nextPhase = 3;
        const phaseDuration = medianRank 
          ? getRankPhaseDuration(medianRank, 3)
          : SCORING.PHASE3_DURATION;
        
        updates['config.phase'] = 3;
        updates['config.phaseDuration'] = phaseDuration;
        updates['timing.phase3StartTime'] = serverTimestamp();
        updates['coordination.allPlayersReady'] = false;
        updates['coordination.readyCount'] = 0;
        updates['state'] = 'active';
        transitioned = true;
        
      } else if (phase === 3) {
        updates['state'] = 'completed';
        updates['coordination.allPlayersReady'] = true;
        transitioned = true;
      }
    }
    
    transaction.update(sessionRef, updates);
    
    return { transitioned, nextPhase };
  });
  
  log.info(`Submitted phase ${phase}`, { 
    sessionId, 
    transitioned: result.transitioned,
    nextPhase: result.nextPhase 
  });
  
  return result;
}

export async function getSession(sessionId: string): Promise<GameSession | null> {
  const sessionRef = doc(db, 'sessions', sessionId);
  const sessionSnap = await getDoc(sessionRef);
  
  if (sessionSnap.exists()) {
    const sessionData = sessionSnap.data() as GameSession;
    return {
      ...sessionData,
      sessionId: sessionSnap.id,
    };
  }
  
  return null;
}

