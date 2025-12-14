import { useRef, useEffect, useCallback } from 'react';

/**
 * Hook to track component mount time and calculate time since mount
 * 
 * Useful for preventing actions before a minimum phase age has passed,
 * such as showing ranking modals immediately after component mounts.
 * 
 * @returns Object with getTimeSinceMount function
 * 
 * @example
 * ```tsx
 * const { getTimeSinceMount } = useComponentMountTime();
 * 
 * useEffect(() => {
 *   const timeSinceMount = getTimeSinceMount();
 *   const minPhaseAge = TIMING.MIN_PHASE_AGE;
 *   
 *   if (timeRemaining === 0 && timeSinceMount >= minPhaseAge) {
 *     setShowRankingModal(true);
 *   }
 * }, [timeRemaining, getTimeSinceMount]);
 * ```
 */
export function useComponentMountTime() {
  const mountedTimeRef = useRef<number | null>(null);
  
  useEffect(() => {
    if (mountedTimeRef.current === null) {
      mountedTimeRef.current = Date.now();
    }
  }, []);
  
  const getTimeSinceMount = useCallback(() => {
    return mountedTimeRef.current 
      ? Date.now() - mountedTimeRef.current 
      : Infinity;
  }, []);
  
  return { getTimeSinceMount };
}

