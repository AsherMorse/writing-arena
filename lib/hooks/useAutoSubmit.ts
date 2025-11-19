import { useState, useEffect, useRef } from 'react';

interface UseAutoSubmitOptions {
  timeRemaining: number;
  hasSubmitted: () => boolean;
  onSubmit: () => void | Promise<void>;
  minPhaseAge?: number; // Prevent immediate submit on load (ms)
  enabled?: boolean;
  isSessionReady?: () => boolean; // Check if session is initialized
}

// Global ref to track auto-submissions across component re-renders
// Key: `${sessionId}-${phase}`, Value: true if already submitted
const globalAutoSubmittedMap = new Map<string, boolean>();

/**
 * Hook to automatically submit when time runs out
 * Prevents immediate submission on page load/phase transition
 */
export function useAutoSubmit({
  timeRemaining,
  hasSubmitted,
  onSubmit,
  minPhaseAge = 3000,
  enabled = true,
  isSessionReady,
}: UseAutoSubmitOptions) {
  const [phaseLoadTime] = useState(Date.now());
  const hasAutoSubmittedRef = useRef(false);
  const isSubmittingRef = useRef(false);
  const sessionIdRef = useRef<string | null>(null);
  const phaseRef = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled) return;
    
    // Check if session is ready (if check provided)
    if (isSessionReady && !isSessionReady()) {
      return;
    }
    
    // Reset flag if user manually submitted or time increased (phase reset)
    // IMPORTANT: Check hasSubmitted FIRST before checking timeRemaining
    // This prevents auto-submit from firing after a successful submission
    if (hasSubmitted()) {
      hasAutoSubmittedRef.current = true; // Keep true to prevent retries
      isSubmittingRef.current = false;
      // Mark as submitted in global map
      if (sessionIdRef.current && phaseRef.current) {
        globalAutoSubmittedMap.set(`${sessionIdRef.current}-${phaseRef.current}`, true);
      }
      return;
    }
    
    // Reset flag if time increased (phase reset)
    if (timeRemaining > 0) {
      hasAutoSubmittedRef.current = false;
      isSubmittingRef.current = false;
      // Clear global map entry if phase changed
      if (sessionIdRef.current && phaseRef.current) {
        globalAutoSubmittedMap.delete(`${sessionIdRef.current}-${phaseRef.current}`);
      }
      return;
    }

    const phaseAge = Date.now() - phaseLoadTime;

    // Only auto-submit if:
    // 1. Time is actually 0
    // 2. User hasn't submitted
    // 3. Phase has been loaded for at least minPhaseAge (prevent immediate submit)
    // 4. We haven't already triggered auto-submit (local ref)
    // 5. We're not currently submitting
    // 6. Global map doesn't show we've already submitted for this session/phase
    const globalKey = sessionIdRef.current && phaseRef.current 
      ? `${sessionIdRef.current}-${phaseRef.current}` 
      : null;
    
    const alreadySubmittedGlobally = globalKey ? globalAutoSubmittedMap.get(globalKey) : false;
    
    if (
      timeRemaining === 0 &&
      !hasSubmitted() &&
      phaseAge > minPhaseAge &&
      !hasAutoSubmittedRef.current &&
      !isSubmittingRef.current &&
      !alreadySubmittedGlobally
    ) {
      hasAutoSubmittedRef.current = true;
      isSubmittingRef.current = true;
      if (globalKey) {
        globalAutoSubmittedMap.set(globalKey, true);
      }
      console.log('⏰ AUTO-SUBMIT - Time expired, auto-submitting...');
      
      // Call onSubmit and reset submitting flag when done
      // If onSubmit throws, we still want to reset the flag
      Promise.resolve(onSubmit()).catch((err) => {
        console.error('❌ AUTO-SUBMIT - Error during submission:', err);
        // On error, clear the global flag so it can retry
        if (globalKey) {
          globalAutoSubmittedMap.delete(globalKey);
        }
        hasAutoSubmittedRef.current = false;
      }).finally(() => {
        // Only reset submitting flag, keep hasAutoSubmittedRef true to prevent retries
        isSubmittingRef.current = false;
      });
    }
  }, [timeRemaining, hasSubmitted, onSubmit, minPhaseAge, enabled, phaseLoadTime, isSessionReady]);

  // Expose function to set session/phase for global tracking
  return {
    setSessionContext: (sessionId: string, phase: number) => {
      sessionIdRef.current = sessionId;
      phaseRef.current = phase;
    },
  };
}

