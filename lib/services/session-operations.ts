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
import { getRankPhaseDuration } from '../constants/scoring';
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

export async function submitPhase(
  sessionId: string,
  userId: string,
  phase: Phase,
  data: PhaseSubmissionData
): Promise<void> {
  const sessionRef = doc(db, 'sessions', sessionId);
  
  const phaseData = {
    submitted: true,
    submittedAt: serverTimestamp(),
    ...data,
  };
  
  log.debug(`Saving phase ${phase} data`, {
    sessionId,
    userId,
    phase,
    data: phaseData,
  });
  
  await updateDoc(sessionRef, {
    [`players.${userId}.phases.phase${phase}`]: phaseData,
    updatedAt: serverTimestamp(),
  });
  
  log.info(`Successfully saved phase ${phase} to session`, { sessionId, phase });
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

