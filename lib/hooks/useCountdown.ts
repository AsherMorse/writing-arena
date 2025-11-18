import { useState, useEffect, useCallback } from 'react';

interface UseCountdownOptions {
  initialValue?: number | null;
  onComplete?: () => void;
  interval?: number;
}

/**
 * Custom hook for countdown timers
 * Handles countdown logic with automatic decrementing
 */
export function useCountdown(options: UseCountdownOptions = {}) {
  const { initialValue = null, onComplete, interval = 1000 } = options;
  const [countdown, setCountdown] = useState<number | null>(initialValue);
  
  const start = useCallback((value: number) => {
    setCountdown(value);
  }, []);
  
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
    
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev === null || prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, interval);
    
    return () => clearInterval(timer);
  }, [countdown, onComplete, interval]);
  
  return {
    countdown,
    start,
    stop,
    reset,
    isActive: countdown !== null && countdown > 0,
  };
}

