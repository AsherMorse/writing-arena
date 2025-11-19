import { useEffect, useRef } from 'react';
import { GameSession, Phase } from '@/lib/types/session';
import { checkAndTransitionPhase } from '@/lib/services/phase-transition';

interface UsePhaseTransitionOptions {
  session: GameSession | null;
  currentPhase: Phase;
  hasSubmitted: () => boolean;
  sessionId: string;
  checkInterval?: number; // How often to check (ms)
  onTransition?: (nextPhase: Phase) => void;
}

/**
 * Hook to monitor phase transitions when all players have submitted
 * Uses client-side Firestore checks instead of Cloud Functions
 */
export function usePhaseTransition({
  session,
  currentPhase,
  hasSubmitted,
  sessionId,
  checkInterval = 1000, // Check every second
  onTransition,
}: UsePhaseTransitionOptions) {
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isTransitioningRef = useRef(false);

  useEffect(() => {
    if (!session || !hasSubmitted()) {
      // Clear interval if user hasn't submitted
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
        checkIntervalRef.current = null;
      }
      return;
    }

    // Only check if we're still in the current phase
    if (session.config?.phase !== currentPhase) {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
        checkIntervalRef.current = null;
      }
      return;
    }

    // Don't check if already transitioning
    if (isTransitioningRef.current) {
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
      !session.coordination?.allPlayersReady &&
      realPlayers.length > 0
    ) {
      // Try immediate transition first
      if (!checkIntervalRef.current && !isTransitioningRef.current) {
        console.log(`⏱️ PHASE MONITOR - All submitted, attempting immediate phase transition...`);
        
        // Try immediately
        (async () => {
          try {
            isTransitioningRef.current = true;
            const transitioned = await checkAndTransitionPhase(sessionId, currentPhase);
            
            if (transitioned) {
          const nextPhase = (currentPhase + 1) as Phase;
              onTransition?.(nextPhase);
              isTransitioningRef.current = false;
              return; // Success, don't start polling
            }
          } catch (error) {
            console.error('❌ PHASE MONITOR - Immediate transition failed:', error);
          } finally {
            isTransitioningRef.current = false;
          }
          
          // If immediate transition didn't work, start polling
          console.log(`⏱️ PHASE MONITOR - Starting polling for phase transition...`);
          checkIntervalRef.current = setInterval(async () => {
            // Prevent multiple simultaneous transitions
            if (isTransitioningRef.current) return;
            
            try {
              isTransitioningRef.current = true;
              const transitioned = await checkAndTransitionPhase(sessionId, currentPhase);
              
              if (transitioned) {
                // Clear interval
                if (checkIntervalRef.current) {
                  clearInterval(checkIntervalRef.current);
                  checkIntervalRef.current = null;
                }
                
                const nextPhase = (currentPhase + 1) as Phase;
          onTransition?.(nextPhase);
              }
        } catch (error) {
              console.error('❌ PHASE MONITOR - Transition check failed:', error);
        } finally {
              isTransitioningRef.current = false;
        }
          }, checkInterval);
        })();
      }
    } else {
      // Clear interval if not all players submitted
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

