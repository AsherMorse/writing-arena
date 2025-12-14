import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getRandomPromptForRank } from '@/lib/utils/prompts';
import { SCORING } from '@/lib/constants/scoring';
import { createMatchLobby, QueueEntry } from '@/lib/services/matchmaking-queue';

interface UseMatchmakingSessionOptions {
  userId: string;
  userName: string;
  userRank: string;
  userProfile: any;
  trait: string;
  currentSessionId: string | null;
  players: Array<{
    userId: string;
    name: string;
    avatar: string;
    rank: string;
    isAI: boolean;
  }>;
  queueSnapshot: QueueEntry[];
  startSession: (
    sessionId: string,
    promptId: string,
    promptType: string,
    phaseDuration: number,
    userRank: string
  ) => Promise<void>;
}

/**
 * Hook for handling matchmaking session creation and navigation
 * Manages the logic for starting a session when countdown completes
 */
export function useMatchmakingSession({
  userId,
  userName,
  userRank,
  userProfile,
  trait,
  currentSessionId,
  players,
  queueSnapshot,
  startSession,
}: UseMatchmakingSessionOptions) {
  const router = useRouter();

  const handleSessionStart = useCallback(async (
    finalPlayers: Array<{
      userId: string;
      name: string;
      avatar: string;
      rank: string;
      isAI: boolean;
    }>
  ) => {
    const realPlayersInQueue = queueSnapshot.filter(p => 
      finalPlayers.some(fp => fp.userId === p.userId)
    );
    const isMultiPlayer = realPlayersInQueue.length >= 2;
    
    const randomPrompt = getRandomPromptForRank(userProfile?.currentRank);
    
    let matchId: string;
    let amILeader = false;
    
    if (isMultiPlayer) {
      const sortedPlayers = [...realPlayersInQueue].sort((a, b) => {
        const aTime = a.joinedAt?.toMillis() || 0;
        const bTime = b.joinedAt?.toMillis() || 0;
        return aTime - bTime;
      });
      const leaderId = sortedPlayers[0].userId;
      const leaderJoinTime = sortedPlayers[0].joinedAt?.toMillis() || Date.now();
      matchId = `match-${leaderId}-${leaderJoinTime}`;
      amILeader = leaderId === userId;
    } else {
      matchId = `match-${userId}-${Date.now()}`;
      amILeader = true;
    }
      
    if (!currentSessionId) {
      return;
    }
    
    try {
      await startSession(
        currentSessionId,
        randomPrompt.id,
        randomPrompt.type,
        SCORING.PHASE1_DURATION,
        userRank
      );
      
      if (isMultiPlayer && amILeader) {
        const playersToSave = finalPlayers.length > 0 ? finalPlayers : players;
        const lobbyPlayers = playersToSave
          .filter((p: any) => p && (p.userId || p.isYou || p.id))
          .map((p: any) => ({
            userId: p.userId || p.id || (p.isYou ? userId : `ai-${p.name}`),
            displayName: p.name === 'You' ? userName : p.name,
            avatar: p.avatar || '🤖',
            rank: p.currentRank || p.rank || 'Silver III',
            isAI: p.isAI || false,
          }));
        createMatchLobby(matchId, lobbyPlayers, trait, randomPrompt.id).catch(() => {});
      }
      
      router.push(`/session/${currentSessionId}`);
    } catch (err) {
      // Silent fail
    }
  }, [
    router,
    trait,
    userId,
    userName,
    players,
    queueSnapshot,
    startSession,
    currentSessionId,
    userRank,
    userProfile,
  ]);

  return { handleSessionStart };
}

