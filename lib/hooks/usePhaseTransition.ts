import { useEffect, useRef } from 'react';
import { GameSession, Phase } from '@/lib/types/session';
import { SCORING } from '@/lib/constants/scoring';
import { db } from '@/lib/config/firebase';

interface UsePhaseTransitionOptions {
  session: GameSession | null;
  currentPhase: Phase;
  hasSubmitted: () => boolean;
  sessionId: string;
  fallbackDelay?: number;
  onTransition?: (nextPhase: Phase) => void;
}

/**
 * Hook to monitor phase transitions when all players have submitted
 * Handles Cloud Function fallback if Functions are not responding
 */
export function usePhaseTransition({
  session,
  currentPhase,
  hasSubmitted,
  sessionId,
  fallbackDelay = 10000,
  onTransition,
}: UsePhaseTransitionOptions) {
  const transitionTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!session || !hasSubmitted()) return;

    // Only check if we're still in the current phase
    if (session.config?.phase !== currentPhase) {
      if (transitionTimerRef.current) {
        clearTimeout(transitionTimerRef.current);
        transitionTimerRef.current = null;
      }
      return;
    }

    const allPlayers = Object.values(session.players || {});
    const realPlayers = allPlayers.filter((p) => !p.isAI);
    
    // Get submitted players for current phase
    const phaseKey = `phase${currentPhase}` as 'phase1' | 'phase2' | 'phase3';
    const submittedRealPlayers = realPlayers.filter(
      (p) => p.phases[phaseKey]?.submitted
    );

    console.log(`🔍 PHASE MONITOR - Phase ${currentPhase} submissions:`, {
      currentPhase: session.config?.phase,
      real: realPlayers.length,
      submitted: submittedRealPlayers.length,
      coordFlag: session.coordination?.allPlayersReady,
    });

    // Check if all real players have submitted
    if (
      submittedRealPlayers.length === realPlayers.length &&
      !session.coordination?.allPlayersReady
    ) {
      // Prevent duplicate timers
      if (transitionTimerRef.current) return;

      console.log(
        `⏱️ PHASE MONITOR - All submitted, waiting for Cloud Function...`
      );

      transitionTimerRef.current = setTimeout(async () => {
        console.warn(
          `⚠️ FALLBACK - Cloud Function timeout, transitioning client-side...`
        );

        try {
          const { updateDoc, doc, serverTimestamp } = await import(
            'firebase/firestore'
          );
          const sessionRef = doc(db, 'sessions', sessionId);

          const nextPhase = (currentPhase + 1) as Phase;
          const phaseDuration =
            nextPhase === 2
              ? SCORING.PHASE2_DURATION
              : nextPhase === 3
              ? SCORING.PHASE3_DURATION
              : SCORING.PHASE1_DURATION;

          const updateData: any = {
            'coordination.allPlayersReady': true,
            'coordination.readyCount': submittedRealPlayers.length,
            updatedAt: serverTimestamp(),
          };

          // If transitioning to next phase (not completing)
          if (nextPhase <= 3) {
            updateData['config.phase'] = nextPhase;
            updateData['config.phaseDuration'] = phaseDuration;
            updateData[`timing.phase${nextPhase}StartTime`] = serverTimestamp();
          } else {
            // Phase 3 completed - mark session as completed
            updateData['state'] = 'completed';
          }

          await updateDoc(sessionRef, updateData);

          console.log(
            `✅ FALLBACK - Client-side transition to phase ${nextPhase} complete`
          );

          onTransition?.(nextPhase);
        } catch (error) {
          console.error('❌ FALLBACK - Transition failed:', error);
        } finally {
          transitionTimerRef.current = null;
        }
      }, fallbackDelay);
    } else if (transitionTimerRef.current) {
      // Clear timer if not all players submitted
      clearTimeout(transitionTimerRef.current);
      transitionTimerRef.current = null;
    }

    return () => {
      if (transitionTimerRef.current) {
        clearTimeout(transitionTimerRef.current);
        transitionTimerRef.current = null;
      }
    };
  }, [
    session,
    currentPhase,
    hasSubmitted,
    sessionId,
    fallbackDelay,
    onTransition,
  ]);
}

