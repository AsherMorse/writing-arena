import { useEffect, useRef } from 'react';

/**
 * Hook for running an effect at a specified interval
 * Similar to setInterval but properly handles React lifecycle
 * 
 * @param callback - Function to call at each interval
 * @param delay - Delay in milliseconds (null to pause)
 * @param dependencies - Dependencies array for the callback
 * 
 * @example
 * ```tsx
 * useInterval(() => {
 *   setCount(prev => prev + 1);
 * }, 1000, []);
 * ```
 */
export function useInterval(
  callback: () => void,
  delay: number | null,
  dependencies: any[] = []
) {
  const callbackRef = useRef(callback);

  // Update callback ref when callback changes
  useEffect(() => {
    callbackRef.current = callback;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [callback, ...dependencies]);

  useEffect(() => {
    if (delay === null) return;

    const interval = setInterval(() => {
      callbackRef.current();
    }, delay);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [delay, ...dependencies]);
}

