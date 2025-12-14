import { useMemo } from 'react';
import { GameSession, SessionPlayer } from '@/lib/types/session';

/**
 * Hook to extract and provide common session data
 * Reduces repetitive destructuring across components
 */
export function useSessionData(session: GameSession | null) {
  const matchId = session?.matchId || '';
  const config = session?.config;
  const players = useMemo(() => session?.players || {}, [session?.players]);
  const coordination = session?.coordination;
  const sessionId = session?.sessionId || '';
  const state = session?.state;
  const timing = session?.timing;

  // Helper getters
  // Sort by userId to ensure stable order (prevents "jumping" in UI)
  const allPlayers = useMemo(() => {
    return Object.values(players).sort((a, b) => a.userId.localeCompare(b.userId));
  }, [players]);

  const realPlayers = useMemo(() => allPlayers.filter((p) => !p.isAI), [allPlayers]);
  const aiPlayers = useMemo(() => allPlayers.filter((p) => p.isAI), [allPlayers]);

  // Get current phase
  const currentPhase = config?.phase || 1;

  // Get player by userId
  const getPlayer = (userId: string): SessionPlayer | undefined => {
    return players[userId];
  };

  // Check if player has submitted for a phase
  const hasPlayerSubmitted = (
    userId: string,
    phase: 1 | 2 | 3
  ): boolean => {
    const player = getPlayer(userId);
    const phaseKey = `phase${phase}` as 'phase1' | 'phase2' | 'phase3';
    return player?.phases[phaseKey]?.submitted || false;
  };

  // Get submitted players for a phase
  const getSubmittedPlayers = (phase: 1 | 2 | 3): SessionPlayer[] => {
    const phaseKey = `phase${phase}` as 'phase1' | 'phase2' | 'phase3';
    return realPlayers.filter((p) => p.phases[phaseKey]?.submitted);
  };

  return {
    // Core data
    matchId,
    config,
    players,
    coordination,
    sessionId,
    state,
    timing,

    // Helper arrays
    allPlayers,
    realPlayers,
    aiPlayers,

    // Current phase
    currentPhase,

    // Helper functions
    getPlayer,
    hasPlayerSubmitted,
    getSubmittedPlayers,
  };
}

