import { useState, useCallback } from 'react';

/**
 * Hook for managing async operations with loading and error states
 * Similar to useAsyncData but for manual execution rather than automatic fetching
 * 
 * @example
 * const { data, isLoading, error, execute, reset } = useAsyncState<User>();
 * 
 * const handleSubmit = async () => {
 *   const result = await execute(async () => {
 *     const response = await fetch('/api/user');
 *     if (!response.ok) throw new Error('Failed');
 *     return response.json();
 *   });
 * };
 */
export function useAsyncState<T>() {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(async (asyncFn: () => Promise<T>): Promise<T> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await asyncFn();
      setData(result);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return {
    data,
    isLoading,
    error,
    execute,
    reset,
  };
}

/**
 * Hook for managing async operations with string error messages
 * Useful for forms and UI components that display error strings
 * 
 * @example
 * const { isLoading, error, execute } = useAsyncStateWithStringError();
 * 
 * const handleSubmit = async () => {
 *   await execute(async () => {
 *     await signUp(email, password);
 *   });
 * };
 */
export function useAsyncStateWithStringError() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const execute = useCallback(async (asyncFn: () => Promise<void>): Promise<void> => {
    setError('');
    setIsLoading(true);
    try {
      await asyncFn();
    } catch (err: any) {
      const errorMessage = err?.message || String(err) || 'An error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setError('');
    setIsLoading(false);
  }, []);

  return {
    isLoading,
    error,
    execute,
    reset,
    setError,
  };
}

