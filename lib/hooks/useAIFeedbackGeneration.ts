/**
 * Hook for managing AI feedback generation in Phase 2
 * Handles Firestore operations and error handling
 */

import { useState, useEffect } from 'react';
import { safeStringifyJSON, parseJSONResponse } from '@/lib/utils/json-utils';
import { logger, LOG_CONTEXTS } from '@/lib/utils/logger';

export interface AIFeedbackGenerationOptions {
  matchId?: string;
  userId?: string;
  enabled?: boolean;
}

export function useAIFeedbackGeneration({
  matchId,
  userId,
  enabled = true,
}: AIFeedbackGenerationOptions) {
  const [aiFeedbackGenerated, setAiFeedbackGenerated] = useState(false);

  useEffect(() => {
    const generateAIFeedback = async () => {
      if (!enabled || !matchId || !userId || aiFeedbackGenerated) return;
      setAiFeedbackGenerated(true);
      
      try {
        const { getMatchState, updateMatchStateArray } = await import('@/lib/utils/firestore-match-state');
        const matchState = await getMatchState(matchId);
        if (!matchState) return;
        
        const players = matchState.players || [];
        const aiPlayers = players.filter((p: any) => p.isAI);
        const writings = matchState.aiWritings?.phase1 || [];
        
        const aiFeedbackPromises = aiPlayers.map(async (aiPlayer: any, idx: number) => {
          const aiIndex = players.findIndex((p: any) => p.userId === aiPlayer.userId);
          const peerIndex = (aiIndex + 1) % players.length;
          const peer = players[peerIndex];
          
          let peerWriting = '';
          if (peer.isAI) {
            const aiWriting = writings.find((w: any) => w.playerId === peer.userId);
            peerWriting = aiWriting?.content || '';
          } else {
            const rankings = matchState.rankings?.phase1 || [];
            const peerRanking = rankings.find((r: any) => r.playerId === peer.userId);
            peerWriting = peerRanking?.content || '';
          }
          
          if (!peerWriting) return null;
          
          const response = await fetch('/api/generate-ai-feedback', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: safeStringifyJSON({ peerWriting, rank: aiPlayer.rank, playerName: aiPlayer.displayName }) || '',
          });
          
          const data = await parseJSONResponse<{ responses: any[] }>(response);
          return { 
            playerId: aiPlayer.userId, 
            playerName: aiPlayer.displayName, 
            responses: data.responses, 
            peerWriting, 
            isAI: true, 
            rank: aiPlayer.rank 
          };
        });
        
        const aiFeedbacks = (await Promise.all(aiFeedbackPromises)).filter(f => f !== null);
        await updateMatchStateArray(matchId, 'aiFeedbacks.phase2', aiFeedbacks);
      } catch (error) {
        logger.error(LOG_CONTEXTS.PEER_FEEDBACK, 'Failed to generate AI feedback', error);
      }
    };
    
    generateAIFeedback();
  }, [matchId, userId, enabled, aiFeedbackGenerated]);

  return {
    aiFeedbackGenerated,
  };
}

