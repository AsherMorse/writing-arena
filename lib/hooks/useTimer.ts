import { useEffect, useRef } from 'react';

/**
 * Hook for managing timeouts
 */
export function useTimeout(callback: () => void, delay: number | null) {
  const callbackRef = useRef(callback);
  
  // Update callback ref when callback changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);
  
  useEffect(() => {
    if (delay === null) return;
    
    const timer = setTimeout(() => {
      callbackRef.current();
    }, delay);
    
    return () => clearTimeout(timer);
  }, [delay]);
}

/**
 * Hook for managing intervals
 */
export function useInterval(callback: () => void, delay: number | null) {
  const callbackRef = useRef(callback);
  
  // Update callback ref when callback changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);
  
  useEffect(() => {
    if (delay === null) return;
    
    const interval = setInterval(() => {
      callbackRef.current();
    }, delay);
    
    return () => clearInterval(interval);
  }, [delay]);
}

