/**
 * @fileoverview Hook to detect phase transitions and trigger navigation.
 * Read-only - does NOT write to Firestore.
 * Phase transitions are now handled atomically within submitPhase().
 */

import { useEffect, useRef } from 'react';
import { GameSession, Phase } from '@/lib/types/session';

interface UsePhaseTransitionOptions {
  session: GameSession | null;
  currentPhase: Phase;
  hasSubmitted: () => boolean;
  sessionId: string;
  onTransition?: (nextPhase: Phase) => void;
}

/**
 * @description Hook to detect phase transitions via real-time listener and trigger navigation.
 * This hook is now read-only - it only watches for phase changes in the session.
 * The actual phase transition is handled atomically within submitPhase().
 */
export function usePhaseTransition({
  session,
  currentPhase,
  hasSubmitted,
  sessionId,
  onTransition,
}: UsePhaseTransitionOptions) {
  const hasCalledTransitionRef = useRef(false);
  const lastDetectedPhaseRef = useRef<Phase>(currentPhase);

  useEffect(() => {
    if (!session) return;
    
    const sessionPhase = session.config?.phase;
    
    // Detect if phase changed (from real-time listener updates)
    if (sessionPhase && sessionPhase !== lastDetectedPhaseRef.current) {
      lastDetectedPhaseRef.current = sessionPhase;
      
      // Only trigger callback once per transition, and only if moving forward
      if (!hasCalledTransitionRef.current && sessionPhase > currentPhase) {
        hasCalledTransitionRef.current = true;
        onTransition?.(sessionPhase);
      }
    }
    
    // Reset flag when component is used for the new phase
    if (sessionPhase === currentPhase) {
      hasCalledTransitionRef.current = false;
    }
  }, [session, currentPhase, onTransition]);

  // Also detect session completion
  useEffect(() => {
    if (!session) return;
    
    if (session.state === 'completed' && currentPhase === 3 && !hasCalledTransitionRef.current) {
      hasCalledTransitionRef.current = true;
      // For phase 3 completion, we don't have a "next phase" but we trigger the callback
      // The callback handler should check session.state === 'completed' to navigate to results
      onTransition?.(3);
    }
  }, [session, currentPhase, onTransition]);
}
