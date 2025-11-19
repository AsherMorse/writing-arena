/**
 * Navigation guard utilities
 * Prevents duplicate navigations and ensures safe routing
 */

import { useRef } from 'react';

/**
 * Hook to prevent duplicate navigations
 * Returns a function that only navigates if not already navigating
 */
export function useNavigationGuard() {
  const isNavigatingRef = useRef(false);
  const navigationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const guardedNavigate = (navigateFn: () => void, delay: number = 0) => {
    if (isNavigatingRef.current) {
      console.warn('⚠️ NAVIGATION - Already navigating, ignoring duplicate navigation');
      return;
    }

    isNavigatingRef.current = true;

    const executeNavigation = () => {
      try {
        navigateFn();
      } catch (error) {
        console.error('❌ NAVIGATION - Navigation failed:', error);
        isNavigatingRef.current = false;
      }

      // Reset after navigation completes
      if (navigationTimeoutRef.current) {
        clearTimeout(navigationTimeoutRef.current);
      }
      navigationTimeoutRef.current = setTimeout(() => {
        isNavigatingRef.current = false;
      }, 1000);
    };

    if (delay > 0) {
      setTimeout(executeNavigation, delay);
    } else {
      executeNavigation();
    }
  };

  return guardedNavigate;
}

/**
 * Verify phase matches expected before navigation
 */
export function verifyPhaseBeforeNavigation(
  currentPhase: number,
  expectedPhase: number,
  sessionPhase: number | null
): boolean {
  // If session phase is available, use it (most reliable)
  if (sessionPhase !== null) {
    if (sessionPhase !== expectedPhase) {
      console.warn(
        `⚠️ NAVIGATION - Phase mismatch: expected ${expectedPhase}, session is ${sessionPhase}, aborting navigation`
      );
      return false;
    }
  }

  // Otherwise, check current phase matches expected
  if (currentPhase !== expectedPhase) {
    console.warn(
      `⚠️ NAVIGATION - Phase mismatch: expected ${expectedPhase}, current is ${currentPhase}, aborting navigation`
    );
    return false;
  }

  return true;
}

