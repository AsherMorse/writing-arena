/**
 * Session Connection Utilities
 * Handles connection management, heartbeat, and reconnection logic
 */

import { doc, updateDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { PlayerInfo } from '../types/session';

export function generateConnectionId(): string {
  return `conn-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

export async function updatePlayerConnection(
  sessionId: string,
  userId: string,
  connectionId: string
): Promise<void> {
  const sessionRef = doc(db, 'sessions', sessionId);
  await updateDoc(sessionRef, {
    [`players.${userId}.status`]: 'connected',
    [`players.${userId}.lastHeartbeat`]: serverTimestamp(),
    [`players.${userId}.connectionId`]: connectionId,
    updatedAt: serverTimestamp(),
  });
}

export async function reconnectPlayerToSession(
  sessionId: string,
  userId: string,
  playerInfo: PlayerInfo,
  connectionId: string
): Promise<void> {
  const sessionRef = doc(db, 'sessions', sessionId);
  
  await updateDoc(sessionRef, {
    [`players.${userId}.status`]: 'connected',
    [`players.${userId}.lastHeartbeat`]: serverTimestamp(),
    [`players.${userId}.connectionId`]: connectionId,
    [`players.${userId}.displayName`]: playerInfo.displayName,
    [`players.${userId}.avatar`]: playerInfo.avatar,
    updatedAt: serverTimestamp(),
  }).catch((error) => {
    if (error?.code === 'not-found') {
      return setDoc(sessionRef, {
        players: {
          [userId]: {
            userId,
            displayName: playerInfo.displayName,
            avatar: playerInfo.avatar,
            rank: playerInfo.rank,
            isAI: false,
            status: 'connected',
            lastHeartbeat: serverTimestamp(),
            connectionId,
            phases: {},
          },
        },
        updatedAt: serverTimestamp(),
      }, { merge: true });
    }
    throw error;
  });
}

export async function disconnectPlayerFromSession(
  sessionId: string,
  userId: string
): Promise<void> {
  const sessionRef = doc(db, 'sessions', sessionId);
  try {
    await updateDoc(sessionRef, {
      [`players.${userId}.status`]: 'disconnected',
      [`players.${userId}.lastHeartbeat`]: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    // Silent fail
  }
}

export function createHeartbeatCallback(
  sessionId: string,
  userId: string
): () => Promise<void> {
  return async () => {
    if (!sessionId || !userId) return;
    
    try {
      await updateDoc(doc(db, 'sessions', sessionId), {
        [`players.${userId}.lastHeartbeat`]: serverTimestamp(),
        [`players.${userId}.status`]: 'connected',
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      throw error;
    }
  };
}

