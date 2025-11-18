import { useState, useEffect, useCallback } from 'react';

interface UseAsyncDataOptions {
  immediate?: boolean;
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}

/**
 * Hook for managing async data fetching with loading and error states
 */
export function useAsyncData<T>(
  fetchFn: () => Promise<T>,
  dependencies: any[] = [],
  options: UseAsyncDataOptions = {}
) {
  const { immediate = true, onSuccess, onError } = options;
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchFn();
      setData(result);
      onSuccess?.(result);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      onError?.(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [fetchFn, onSuccess, onError]);

  useEffect(() => {
    if (immediate) {
      fetchData();
    }
  }, dependencies);

  const refetch = useCallback(() => {
    return fetchData();
  }, [fetchData]);

  return { 
    data, 
    loading, 
    error, 
    refetch,
    reset: () => {
      setData(null);
      setError(null);
      setLoading(false);
    },
  };
}

