import { useCallback } from 'react';

/**
 * Hook for making API calls with consistent error handling
 * Provides a standardized way to call APIs and handle errors
 * 
 * @example
 * const { call } = useApiCall();
 * 
 * const handleSubmit = async () => {
 *   const data = await call('/api/user', {
 *     method: 'POST',
 *     body: JSON.stringify({ name: 'John' }),
 *   });
 * };
 */
export function useApiCall() {
  const call = useCallback(async <T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> => {
    const response = await fetch(endpoint, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      let errorData: any = {};
      try {
        errorData = await response.json();
      } catch {
        // If response is not JSON, use status text
      }
      throw new Error(errorData.error || `Request failed: ${response.statusText}`);
    }

    return response.json();
  }, []);

  return { call };
}

