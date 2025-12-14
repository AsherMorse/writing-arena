import { useState, useEffect, useRef, useCallback } from 'react';
import { TIMING } from '@/lib/constants/scoring';

interface UseMatchmakingCountdownOptions {
  playersCount: number;
  maxPlayers: number;
  onCountdownStart?: () => void;
  onCountdownTick?: (countdown: number) => void;
  onCountdownComplete: () => void;
}

/**
 * Hook for managing matchmaking countdown timer
 * Starts countdown when lobby is full and handles completion
 */
export function useMatchmakingCountdown({
  playersCount,
  maxPlayers,
  onCountdownStart,
  onCountdownTick,
  onCountdownComplete,
}: UseMatchmakingCountdownOptions) {
  const [countdown, setCountdown] = useState<number | null>(null);
  const partyLockedRef = useRef(false);

  const startCountdown = useCallback(() => {
    if (partyLockedRef.current) return;
    partyLockedRef.current = true;
    setCountdown(3);
    onCountdownStart?.();
  }, [onCountdownStart]);

  const resetCountdown = useCallback(() => {
    partyLockedRef.current = false;
    setCountdown(null);
  }, []);

  // Start countdown when lobby is full
  useEffect(() => {
    if (playersCount >= maxPlayers && countdown === null && !partyLockedRef.current) {
      startCountdown();
    }
  }, [playersCount, maxPlayers, countdown, startCountdown]);

  // Handle countdown timer
  useEffect(() => {
    if (countdown === null) return;
    
    if (countdown > 0) {
      onCountdownTick?.(countdown);
      const timer = setTimeout(() => setCountdown(countdown - 1), TIMING.COUNTDOWN_INTERVAL);
      return () => clearTimeout(timer);
    } else {
      onCountdownComplete();
    }
  }, [countdown, onCountdownTick, onCountdownComplete]);

  return {
    countdown,
    startCountdown,
    resetCountdown,
    isLocked: partyLockedRef.current,
    partyLockedRef,
  };
}

