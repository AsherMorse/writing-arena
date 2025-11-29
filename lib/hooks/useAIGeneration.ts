/**
 * Hook for managing AI content generation (writings, feedback, revisions)
 * Handles Firestore operations, progress tracking, and error handling
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { safeStringifyJSON, parseJSONResponse } from '@/lib/utils/json-utils';
import { isNotEmpty } from '@/lib/utils/array-utils';
import { logger, LOG_CONTEXTS } from '@/lib/utils/logger';
import { scheduleAISubmission } from '@/lib/utils/ai-submission-delay';
import { db } from '@/lib/config/firebase';
import { updateDoc, doc, serverTimestamp } from 'firebase/firestore';

export interface AIGenerationOptions {
  sessionId: string;
  matchId?: string;
  activeSessionId?: string;
  sessionCreatedAt?: any;
  players: Array<{
    userId: string;
    displayName: string;
    avatar?: string;
    rank: number | string;
    isAI: boolean;
  }>;
  sessionPlayers?: Record<string, any>;
  prompt: {
    description: string;
    type: string;
  };
  phase: 1 | 2 | 3;
  enabled?: boolean;
  onProgress?: (progress: number) => void;
  onComplete?: (writings: any[]) => void;
}

export interface AIWriting {
  playerId: string;
  playerName: string;
  content: string;
  wordCount: number;
  isAI: boolean;
  rank: number;
}

export function useAIGeneration({
  sessionId,
  matchId,
  activeSessionId,
  sessionCreatedAt,
  players,
  sessionPlayers,
  prompt,
  phase,
  enabled = true,
  onProgress,
  onComplete,
}: AIGenerationOptions) {
  const [aiWritingsGenerated, setAiWritingsGenerated] = useState(false);
  const [generatingAI, setGeneratingAI] = useState(false);
  const [aiGenerationProgress, setAiGenerationProgress] = useState(0);
  const [aiWordCounts, setAiWordCounts] = useState<number[]>([]);
  const aiTargetCountsRef = useRef<number[]>([]);

  const generateAIWritings = useCallback(async () => {
    if (!enabled || aiWritingsGenerated || !prompt) return;

    try {
      const { getMatchState, ensureMatchState, updateMatchStateArray } = await import('@/lib/utils/firestore-match-state');
      const matchStateId = matchId || sessionId;
      const matchState = await getMatchState(matchStateId);

      if (matchState) {
        const existingWritings = matchState?.aiWritings?.[`phase${phase}` as 'phase1' | 'phase2' | 'phase3'];

        if (isNotEmpty(existingWritings)) {
          aiTargetCountsRef.current = existingWritings.map((w: any) => w.wordCount);
          setAiWordCounts(existingWritings.map((w: any) => w.wordCount));
          setAiWritingsGenerated(true);
          if (onComplete) {
            onComplete(existingWritings);
          }
          return;
        }
      } else if (phase === 1) {
        // Create matchState document if it doesn't exist (only for phase 1)
        await ensureMatchState(matchStateId, {
          sessionId: activeSessionId || sessionId,
          players: Object.values(sessionPlayers || {}).map(p => ({
            userId: p.userId,
            displayName: p.displayName,
            avatar: p.avatar,
            rank: p.rank,
            isAI: p.isAI,
          })),
          phase: 1,
          createdAt: sessionCreatedAt,
        });
      }

      const aiPlayers = players.filter(p => p.isAI);
      if (aiPlayers.length === 0) {
        setAiWritingsGenerated(true);
        return;
      }

      setGeneratingAI(true);
      setAiWritingsGenerated(true);

      // Generate AI writings based on phase
      const aiWritingPromises = aiPlayers.map(async (aiPlayer, index) => {
        let response: Response;
        let data: { content: string; wordCount: number };

        if (phase === 1) {
          // Phase 1: Generate initial writing
          response = await fetch('/api/generate-ai-writing', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: safeStringifyJSON({
              prompt: prompt.description,
              promptType: prompt.type,
              rank: typeof aiPlayer.rank === 'string' ? parseInt(aiPlayer.rank) || 0 : aiPlayer.rank,
              playerName: aiPlayer.displayName,
            }),
          });
          data = await parseJSONResponse<{ content: string; wordCount: number }>(response);
        } else if (phase === 2) {
          // Phase 2: Generate feedback (requires peer writing)
          // This is handled separately in PeerFeedbackContent
          return null;
        } else if (phase === 3) {
          // Phase 3: Generate revision (requires original content and feedback)
          // This is handled separately in RevisionContent
          return null;
        } else {
          return null;
        }

        const progress = ((index + 1) / aiPlayers.length) * 100;
        setAiGenerationProgress(progress);
        if (onProgress) {
          onProgress(progress);
        }

        return {
          playerId: aiPlayer.userId,
          playerName: aiPlayer.displayName,
          content: data.content,
          wordCount: data.wordCount,
          isAI: true,
          rank: typeof aiPlayer.rank === 'string' ? parseInt(aiPlayer.rank) || 0 : aiPlayer.rank,
        };
      });

      const aiWritings = (await Promise.all(aiWritingPromises)).filter(w => w !== null) as AIWriting[];
      aiTargetCountsRef.current = aiWritings.map(w => w.wordCount);
      setAiWordCounts(aiWritings.map(w => w.wordCount));
      setGeneratingAI(false);
      setAiGenerationProgress(100);
      if (onProgress) {
        onProgress(100);
      }

      // Save to Firestore
      try {
        await updateMatchStateArray(
          matchStateId,
          `aiWritings.phase${phase}`,
          aiWritings,
          (existing, newItems) => {
            const merged = [...existing];
            for (const newWriting of newItems) {
              if (!merged.some((w: any) => w.playerId === newWriting.playerId)) {
                merged.push(newWriting);
              }
            }
            return merged;
          }
        );
      } catch (saveError) {
        logger.error(LOG_CONTEXTS.WRITING_SESSION, `Failed to save AI writings to Firestore for phase ${phase}`, saveError);
      }

      // Schedule AI submissions (only for phase 1)
      if (phase === 1) {
        const { clampScore } = await import('@/lib/constants/scoring');
        aiPlayers.forEach((aiPlayer) => {
          scheduleAISubmission(
            aiPlayer,
            async () => {
              const aiWriting = aiWritings.find(w => w.playerId === aiPlayer.userId);
              if (!aiWriting) return;

              const sessionRef = doc(db, 'sessions', activeSessionId || sessionId);

              await updateDoc(sessionRef, {
                [`players.${aiPlayer.userId}.phases.phase1`]: {
                  submitted: true,
                  submittedAt: serverTimestamp(),
                  content: aiWriting.content,
                  wordCount: aiWriting.wordCount,
                  score: clampScore(60 + Math.random() * 30),
                },
                updatedAt: serverTimestamp(),
              });
            },
            5000,
            15000
          );
        });
      }

      if (onComplete) {
        onComplete(aiWritings);
      }
    } catch (error) {
      logger.error(LOG_CONTEXTS.WRITING_SESSION, `Failed to generate AI writings for phase ${phase}`, error);
      setGeneratingAI(false);
      setAiWritingsGenerated(true);
    }
  }, [
    enabled,
    aiWritingsGenerated,
    prompt,
    sessionId,
    matchId,
    activeSessionId,
    sessionCreatedAt,
    players,
    sessionPlayers,
    phase,
    onProgress,
    onComplete,
  ]);

  useEffect(() => {
    if (enabled && !aiWritingsGenerated && prompt) {
      generateAIWritings();
    }
  }, [enabled, aiWritingsGenerated, prompt, generateAIWritings]);

  return {
    aiWritingsGenerated,
    generatingAI,
    aiGenerationProgress,
    aiWordCounts,
    aiTargetCounts: aiTargetCountsRef.current,
    regenerate: () => {
      setAiWritingsGenerated(false);
      generateAIWritings();
    },
  };
}

