import { useEffect, useRef } from 'react';
import { GameSession, Phase } from '@/lib/types/session';
import { checkAndTransitionPhase } from '@/lib/services/phase-transition';

interface UsePhaseTransitionOptions {
  session: GameSession | null;
  currentPhase: Phase;
  hasSubmitted: () => boolean;
  sessionId: string;
  checkInterval?: number;
  onTransition?: (nextPhase: Phase) => void;
}

export function usePhaseTransition({
  session,
  currentPhase,
  hasSubmitted,
  sessionId,
  checkInterval = 1000,
  onTransition,
}: UsePhaseTransitionOptions) {
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isTransitioningRef = useRef(false);

  useEffect(() => {
    if (!session || !hasSubmitted()) {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
        checkIntervalRef.current = null;
      }
      return;
    }

    if (session.config?.phase !== currentPhase) {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
        checkIntervalRef.current = null;
      }
      return;
    }

    if (isTransitioningRef.current) {
      return;
    }

    const allPlayers = Object.values(session.players || {});
    const realPlayers = allPlayers.filter((p) => !p.isAI);
    
    const phaseKey = `phase${currentPhase}` as 'phase1' | 'phase2' | 'phase3';
    const submittedRealPlayers = realPlayers.filter(
      (p) => p.phases[phaseKey]?.submitted
    );

    if (
      submittedRealPlayers.length === realPlayers.length &&
      !session.coordination?.allPlayersReady &&
      realPlayers.length > 0
    ) {
      if (!checkIntervalRef.current && !isTransitioningRef.current) {
        (async () => {
          try {
            isTransitioningRef.current = true;
            const transitioned = await checkAndTransitionPhase(sessionId, currentPhase);
            
            if (transitioned) {
              const nextPhase = (currentPhase + 1) as Phase;
              onTransition?.(nextPhase);
              isTransitioningRef.current = false;
              return;
            }
          } catch (error) {
            // Silent fail
          } finally {
            isTransitioningRef.current = false;
          }
          
          checkIntervalRef.current = setInterval(async () => {
            if (isTransitioningRef.current) return;
            
            try {
              isTransitioningRef.current = true;
              const transitioned = await checkAndTransitionPhase(sessionId, currentPhase);
              
              if (transitioned) {
                if (checkIntervalRef.current) {
                  clearInterval(checkIntervalRef.current);
                  checkIntervalRef.current = null;
                }
                
                const nextPhase = (currentPhase + 1) as Phase;
                onTransition?.(nextPhase);
              }
            } catch (error) {
              // Silent fail
            } finally {
              isTransitioningRef.current = false;
            }
          }, checkInterval);
        })();
      }
    } else {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
        checkIntervalRef.current = null;
      }
    }

    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
        checkIntervalRef.current = null;
      }
    };
  }, [
    session,
    currentPhase,
    hasSubmitted,
    sessionId,
    checkInterval,
    onTransition,
  ]);
}
