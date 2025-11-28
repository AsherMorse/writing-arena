import { useState, useRef, useCallback } from 'react';
import { getRandomAIStudents } from '@/lib/services/ai-students';

interface AIPlayer {
  userId: string;
  name: string;
  avatar: string;
  rank: string;
  isAI: boolean;
}

interface UseAIPlayerBackfillOptions {
  userRank: string;
  sessionId: string | null;
  currentPlayers: AIPlayer[];
  addPlayerToSession: (
    sessionId: string,
    userId: string,
    playerInfo: { displayName: string; avatar: string; rank: string },
    isAI: boolean
  ) => Promise<void>;
  buildAIPlayer: (student: any, fallbackRank?: string) => AIPlayer;
  onPlayersUpdate: (players: AIPlayer[]) => void;
  leaveQueue?: () => Promise<void>;
}

/**
 * Hook for managing AI player backfill logic
 * Handles selecting AI students and adding them to the session
 */
export function useAIPlayerBackfill({
  userRank,
  sessionId,
  currentPlayers,
  addPlayerToSession,
  buildAIPlayer,
  onPlayersUpdate,
  leaveQueue,
}: UseAIPlayerBackfillOptions) {
  const [selectedAIStudents, setSelectedAIStudents] = useState<any[]>([]);
  const [hasFilledWithAI, setHasFilledWithAI] = useState(false);
  const aiBackfillIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const fillLobbyWithAI = useCallback(async (sessionIdOverride?: string) => {
    const targetSessionId = sessionIdOverride || sessionId;
    
    if (!targetSessionId) {
      setHasFilledWithAI(false);
      return;
    }
    
    setHasFilledWithAI(true);
    
    if (aiBackfillIntervalRef.current) {
      clearInterval(aiBackfillIntervalRef.current);
      aiBackfillIntervalRef.current = null;
    }
    
    let aiStudents = selectedAIStudents;
    if (aiStudents.length === 0) {
      aiStudents = await getRandomAIStudents(userRank, 4);
      if (aiStudents.length > 0) {
        setSelectedAIStudents(aiStudents);
      }
    }
    
    if (aiStudents.length === 0) {
      setHasFilledWithAI(false);
      return;
    }
    
    if (leaveQueue) {
      await leaveQueue();
    }
    
    const currentPlayerCount = currentPlayers.length;
    const slotsRemaining = 5 - currentPlayerCount;
    if (slotsRemaining <= 0) {
      setHasFilledWithAI(false);
      return;
    }
      
    const aiToAdd = aiStudents
      .slice(0, slotsRemaining)
      .map(ai => buildAIPlayer(ai));
    
    try {
      await Promise.all(
        aiToAdd.map((aiPlayer, index) => {
          const aiStudent = aiStudents[index];
          if (aiStudent) {
            return addPlayerToSession(
              targetSessionId,
              aiPlayer.userId,
              {
                displayName: aiStudent.displayName || 'AI Player',
                avatar: aiStudent.avatar || '🤖',
                rank: aiStudent.currentRank || 'Silver III',
              },
              true
            );
          }
          return Promise.resolve();
        })
      );
    } catch (error) {
      setHasFilledWithAI(false);
      return;
    }
    
    onPlayersUpdate([...currentPlayers, ...aiToAdd].slice(0, 5));
  }, [selectedAIStudents, userRank, sessionId, currentPlayers, buildAIPlayer, addPlayerToSession, onPlayersUpdate, leaveQueue]);

  const clearBackfillInterval = useCallback(() => {
    if (aiBackfillIntervalRef.current) {
      clearInterval(aiBackfillIntervalRef.current);
      aiBackfillIntervalRef.current = null;
    }
  }, []);

  return {
    selectedAIStudents,
    hasFilledWithAI,
    fillLobbyWithAI,
    clearBackfillInterval,
    aiBackfillIntervalRef,
  };
}

