import { useEffect, useRef } from 'react';
import { TIMING } from '@/lib/constants/scoring';
import { logger, LOG_CONTEXTS } from '@/lib/utils/logger';

interface UseAutoSubmitOptions {
  timeRemaining: number;
  hasSubmitted: () => boolean;
  onSubmit: () => void | Promise<void>;
  minPhaseAge?: number; // Prevent immediate submit on load (ms)
  enabled?: boolean;
  isSessionReady?: () => boolean; // Check if session is initialized
}

/**
 * Hook to automatically submit when time runs out
 * Simple: Fire once when time hits 0, if not already submitted and session is ready
 */
export function useAutoSubmit({
  timeRemaining,
  hasSubmitted,
  onSubmit,
  minPhaseAge = TIMING.MIN_PHASE_AGE,
  enabled = true,
  isSessionReady,
}: UseAutoSubmitOptions) {
  const phaseStartTimeRef = useRef(Date.now());
  const hasAutoSubmittedRef = useRef(false);

  useEffect(() => {
    if (!enabled) return;
    
    // Reset on phase change (time increased = new phase started)
    if (timeRemaining > 0) {
      hasAutoSubmittedRef.current = false;
      phaseStartTimeRef.current = Date.now();
      return;
    }

    // Already submitted? Don't do anything
    if (hasSubmitted() || hasAutoSubmittedRef.current) {
      return;
    }

    // Session not ready? Don't submit
    if (isSessionReady && !isSessionReady()) {
      return;
    }

    // Time is 0, but phase just started? Wait a bit
    const phaseAge = Date.now() - phaseStartTimeRef.current;
    if (phaseAge < minPhaseAge) {
      return;
    }

    // All checks passed - submit ONCE
    hasAutoSubmittedRef.current = true;
    logger.info(LOG_CONTEXTS.AUTO_SUBMIT, 'Time expired, auto-submitting...');
    
    Promise.resolve(onSubmit()).catch((err) => {
      logger.error(LOG_CONTEXTS.AUTO_SUBMIT, 'Error during submission', err);
      // On error, allow retry by resetting flag
      hasAutoSubmittedRef.current = false;
    });
  }, [timeRemaining, hasSubmitted, onSubmit, minPhaseAge, enabled, isSessionReady]);
}
