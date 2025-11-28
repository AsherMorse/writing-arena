/**
 * Session State Utilities
 * Handles session state queries and helpers
 */

import { GameSession, SessionPlayer, Phase } from '../types/session';
import { Timestamp } from 'firebase/firestore';

export function getPhaseTimeRemaining(session: GameSession | null): number {
  if (!session) return 0;
  
  const { config, timing } = session;
  const phase = config.phase;
  
  let startTime: Timestamp | undefined;
  if (phase === 1) startTime = timing.phase1StartTime;
  else if (phase === 2) startTime = timing.phase2StartTime;
  else if (phase === 3) startTime = timing.phase3StartTime;
  
  // If start time hasn't been set yet (waiting for batch ranking to complete),
  // return the full phase duration to prevent timer from counting down
  if (!startTime) {
    return config.phaseDuration;
  }
  
  const elapsed = Date.now() - startTime.toMillis();
  const remaining = config.phaseDuration - Math.floor(elapsed / 1000);
  
  return Math.max(0, remaining);
}

export function hasSubmittedCurrentPhase(
  session: GameSession | null,
  userId: string | null
): boolean {
  if (!session || !userId) return false;
  
  const player = session.players[userId];
  if (!player) return false;
  
  const phase = session.config.phase;
  return player.phases[`phase${phase}`]?.submitted || false;
}

export function getConnectedPlayers(session: GameSession | null): SessionPlayer[] {
  if (!session) return [];
  
  return Object.values(session.players).filter(
    p => p.status === 'connected'
  );
}

export function getSubmissionCount(
  session: GameSession | null
): { submitted: number; total: number } {
  if (!session) return { submitted: 0, total: 0 };
  
  const phase = session.config.phase;
  const players = Object.values(session.players);
  const realPlayers = players.filter(p => !p.isAI);
  
  const submitted = realPlayers.filter(
    p => p.phases[`phase${phase}`]?.submitted
  ).length;
  
  return {
    submitted,
    total: realPlayers.length,
  };
}

export function detectPhaseTransition(
  previousSession: GameSession | null,
  currentSession: GameSession
): boolean {
  if (!previousSession) return false;
  return previousSession.config.phase !== currentSession.config.phase;
}

export function detectPlayerStatusChanges(
  previousSession: GameSession | null,
  currentSession: GameSession
): Array<{ userId: string; status: string }> {
  if (!previousSession) return [];
  
  const changes: Array<{ userId: string; status: string }> = [];
  
  for (const [userId, player] of Object.entries(currentSession.players)) {
    const prevPlayer = previousSession.players[userId];
    if (prevPlayer && prevPlayer.status !== player.status) {
      changes.push({ userId, status: player.status });
    }
  }
  
  return changes;
}

export function detectAllPlayersReady(
  previousSession: GameSession | null,
  currentSession: GameSession
): boolean {
  if (!previousSession) return false;
  return currentSession.coordination.allPlayersReady && !previousSession.coordination.allPlayersReady;
}

