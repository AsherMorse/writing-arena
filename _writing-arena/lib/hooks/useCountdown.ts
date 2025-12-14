import { useState, useEffect, useCallback } from 'react';

interface UseCountdownOptions {
  initialValue?: number;
  onComplete?: () => void;
  interval?: number;
}

/**
 * Custom hook for countdown timers
 * Handles countdown logic with automatic decrement and completion callback
 * 
 * @example
 * ```tsx
 * const countdown = useCountdown({
 *   initialValue: 10,
 *   onComplete: () => router.push('/next-page'),
 * });
 * ```
 */
export function useCountdown(options: UseCountdownOptions = {}) {
  const { initialValue = 0, onComplete, interval = 1000 } = options;
  const [countdown, setCountdown] = useState<number | null>(initialValue || null);
  
  const start = useCallback((value?: number) => {
    setCountdown(value ?? initialValue ?? null);
  }, [initialValue]);
  
  const stop = useCallback(() => {
    setCountdown(null);
  }, []);
  
  const reset = useCallback((value?: number) => {
    setCountdown(value ?? initialValue ?? null);
  }, [initialValue]);
  
  useEffect(() => {
    if (countdown === null || countdown <= 0) {
      if (countdown === 0 && onComplete) {
        onComplete();
      }
      return;
    }
    
    const timer = setTimeout(() => {
      setCountdown(prev => {
        if (prev === null || prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, interval);
    
    return () => clearTimeout(timer);
  }, [countdown, onComplete, interval]);
  
  return {
    countdown,
    start,
    stop,
    reset,
    isActive: countdown !== null && countdown > 0,
  };
}

