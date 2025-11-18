import { useState, useEffect } from 'react';

interface UseAutoSubmitOptions {
  timeRemaining: number;
  hasSubmitted: () => boolean;
  onSubmit: () => void;
  minPhaseAge?: number; // Prevent immediate submit on load (ms)
  enabled?: boolean;
}

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
}: UseAutoSubmitOptions) {
  const [phaseLoadTime] = useState(Date.now());

  useEffect(() => {
    if (!enabled) return;

    const phaseAge = Date.now() - phaseLoadTime;

    // Only auto-submit if:
    // 1. Time is actually 0
    // 2. User hasn't submitted
    // 3. Phase has been loaded for at least minPhaseAge (prevent immediate submit)
    if (
      timeRemaining === 0 &&
      !hasSubmitted() &&
      phaseAge > minPhaseAge
    ) {
      console.log('⏰ AUTO-SUBMIT - Time expired, auto-submitting...');
      onSubmit();
    }
  }, [timeRemaining, hasSubmitted, onSubmit, minPhaseAge, enabled, phaseLoadTime]);
}

