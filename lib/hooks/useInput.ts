import { useState, useCallback } from 'react';

/**
 * Hook for managing form input state
 * Provides consistent input handling across components
 * 
 * @param initialValue - Initial input value (default: '')
 * @returns Object with value, setValue, handleChange, and reset functions
 * 
 * @example
 * ```tsx
 * const { value, handleChange, reset } = useInput('');
 * 
 * return (
 *   <input 
 *     value={value} 
 *     onChange={handleChange}
 *     placeholder="Enter text..."
 *   />
 * );
 * ```
 */
export function useInput(initialValue = '') {
  const [value, setValue] = useState(initialValue);
  
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setValue(e.target.value);
  }, []);
  
  const reset = useCallback(() => setValue(initialValue), [initialValue]);
  
  return { 
    value, 
    setValue, 
    handleChange, 
    reset,
  };
}

