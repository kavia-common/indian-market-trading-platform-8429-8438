import { useState, useCallback, useRef } from 'react';
import { useApi } from '../services/api';
import { withRetry } from '../utils/retry';

/**
 * Hook for managing API requests with loading and error states
 */
export function useApiRequest(apiFunc, { autoRetry = true, maxAttempts = 3 } = {}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const abortControllerRef = useRef(null);

  const execute = useCallback(async (...args) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setLoading(true);
    setError(null);

    try {
      const fn = autoRetry ? withRetry(apiFunc, { maxAttempts }) : apiFunc;
      const result = await fn(...args, { signal: abortControllerRef.current.signal });
      return result;
    } catch (err) {
      if (err.name === 'AbortError') {
        return;
      }
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiFunc, autoRetry, maxAttempts]);

  const reset = useCallback(() => {
    setError(null);
    setLoading(false);
  }, []);

  return {
    execute,
    loading,
    error,
    reset
  };
}

/**
 * Hook for making paginated API requests
 */
export function usePaginatedApi(apiFunc, { pageSize = 10, autoRetry = true } = {}) {
  const [data, setData] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const { execute, loading, error, reset } = useApiRequest(apiFunc, { autoRetry });

  const loadMore = useCallback(async () => {
    if (!hasMore || loading) return;

    try {
      const response = await execute({ page, pageSize });
      setData(prev => [...prev, ...response.items]);
      setHasMore(response.hasMore);
      setPage(p => p + 1);
    } catch (err) {
      // Error is already handled by useApiRequest
    }
  }, [execute, hasMore, loading, page, pageSize]);

  const refresh = useCallback(async () => {
    setData([]);
    setPage(1);
    setHasMore(true);
    reset();
    await loadMore();
  }, [loadMore, reset]);

  return {
    data,
    loading,
    error,
    hasMore,
    loadMore,
    refresh
  };
}
