import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";

interface UseOptimizedDataProps {
  cacheKey: string;
  cacheDuration?: number; // in milliseconds
  enablePagination?: boolean;
  pageSize?: number;
}

interface PaginationState {
  page: number;
  hasMore: boolean;
  isLoading: boolean;
}

export const useOptimizedData = ({
  cacheKey,
  cacheDuration = 5 * 60 * 1000, // 5 minutes default
  enablePagination = false,
  pageSize = 10
}: UseOptimizedDataProps) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    hasMore: true,
    isLoading: false
  });

  // Cache management
  const getCacheKey = useCallback((page?: number) => {
    return enablePagination ? `${cacheKey}_page_${page || 1}` : cacheKey;
  }, [cacheKey, enablePagination]);

  const getCacheTimestampKey = useCallback((page?: number) => {
    return enablePagination ? `${cacheKey}_timestamp_page_${page || 1}` : `${cacheKey}_timestamp`;
  }, [cacheKey, enablePagination]);

  const isCacheValid = useCallback((page?: number) => {
    const timestamp = localStorage.getItem(getCacheTimestampKey(page));
    if (!timestamp) return false;
    return Date.now() - parseInt(timestamp) < cacheDuration;
  }, [getCacheTimestampKey, cacheDuration]);

  const loadFromCache = useCallback((page?: number) => {
    try {
      const cachedData = localStorage.getItem(getCacheKey(page));
      if (cachedData) {
        return JSON.parse(cachedData);
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error loading from cache:', error);
      }
    }
    return null;
  }, [getCacheKey]);

  const saveToCache = useCallback((data: any[], page?: number) => {
    try {
      localStorage.setItem(getCacheKey(page), JSON.stringify(data));
      localStorage.setItem(getCacheTimestampKey(page), Date.now().toString());
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error saving to cache:', error);
      }
    }
  }, [getCacheKey, getCacheTimestampKey]);

  // Clear cache
  const clearCache = useCallback(() => {
    try {
      if (enablePagination) {
        // Clear all pages
        for (let i = 1; i <= pagination.page; i++) {
          localStorage.removeItem(getCacheKey(i));
          localStorage.removeItem(getCacheTimestampKey(i));
        }
      } else {
        localStorage.removeItem(getCacheKey());
        localStorage.removeItem(getCacheTimestampKey());
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error clearing cache:', error);
      }
    }
  }, [enablePagination, pagination.page, getCacheKey, getCacheTimestampKey]);

  // Generic data fetcher
  const fetchData = useCallback(async (
    queryFn: () => Promise<any[]>,
    page?: number,
    append: boolean = false
  ) => {
    const currentPage = page || pagination.page;
    
    // Check cache first
    if (isCacheValid(currentPage)) {
      const cachedData = loadFromCache(currentPage);
      if (cachedData) {
        if (append) {
          setData(prev => [...prev, ...cachedData]);
        } else {
          setData(cachedData);
        }
        return cachedData;
      }
    }

    // Set loading state
    if (enablePagination) {
      setPagination(prev => ({ ...prev, isLoading: true }));
    } else {
      setLoading(true);
    }

    try {
      const result = await queryFn();
      
      if (append) {
        setData(prev => [...prev, ...result]);
      } else {
        setData(result);
      }

      // Save to cache
      saveToCache(result, currentPage);

      // Update pagination state
      if (enablePagination) {
        setPagination(prev => ({
          ...prev,
          hasMore: result.length === pageSize,
          isLoading: false
        }));
      }

      setError(null);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      if (import.meta.env.DEV) {
        console.error('Error fetching data:', err);
      }
      return [];
    } finally {
      if (!enablePagination) {
        setLoading(false);
      }
    }
  }, [isCacheValid, loadFromCache, saveToCache, enablePagination, pagination.page, pageSize]);

  // Load more data (for pagination)
  const loadMore = useCallback(async (queryFn: () => Promise<any[]>) => {
    if (!enablePagination || pagination.isLoading || !pagination.hasMore) {
      return;
    }

    const nextPage = pagination.page + 1;
    setPagination(prev => ({ ...prev, page: nextPage }));

    await fetchData(queryFn, nextPage, true);
  }, [enablePagination, pagination.isLoading, pagination.hasMore, pagination.page, fetchData]);

  // Refresh data
  const refresh = useCallback(async (queryFn: () => Promise<any[]>) => {
    clearCache();
    setPagination(prev => ({ ...prev, page: 1 }));
    await fetchData(queryFn, 1, false);
  }, [clearCache, fetchData]);

  // Memoized values
  const memoizedData = useMemo(() => data, [data]);
  const memoizedLoading = useMemo(() => loading, [loading]);
  const memoizedError = useMemo(() => error, [error]);
  const memoizedPagination = useMemo(() => pagination, [pagination]);

  return {
    data: memoizedData,
    loading: memoizedLoading,
    error: memoizedError,
    pagination: memoizedPagination,
    fetchData,
    loadMore,
    refresh,
    clearCache,
    isCacheValid: useCallback(() => isCacheValid(), [isCacheValid])
  };
};

// Specialized hook for products
export const useOptimizedProducts = (options?: Partial<UseOptimizedDataProps>) => {
  const {
    data: products,
    loading,
    error,
    pagination,
    fetchData,
    loadMore,
    refresh,
    clearCache
  } = useOptimizedData({
    cacheKey: 'products',
    cacheDuration: 10 * 60 * 1000, // 10 minutes
    enablePagination: options?.enablePagination || false,
    pageSize: options?.pageSize || 12,
    ...options
  });

  const fetchProducts = useCallback(async (page?: number, append: boolean = false) => {
    return fetchData(async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(options?.pageSize || 12)
        .range(
          page ? (page - 1) * (options?.pageSize || 12) : 0,
          page ? page * (options?.pageSize || 12) - 1 : (options?.pageSize || 12) - 1
        );

      if (error) throw error;
      return data || [];
    }, page, append);
  }, [fetchData, options?.pageSize]);

  const loadMoreProducts = useCallback(async () => {
    return loadMore(async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(options?.pageSize || 12)
        .range(
          pagination.page * (options?.pageSize || 12),
          (pagination.page + 1) * (options?.pageSize || 12) - 1
        );

      if (error) throw error;
      return data || [];
    });
  }, [loadMore, pagination.page, options?.pageSize]);

  const refreshProducts = useCallback(async () => {
    return refresh(async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(options?.pageSize || 12);

      if (error) throw error;
      return data || [];
    });
  }, [refresh, options?.pageSize]);

  return {
    products,
    loading,
    error,
    pagination,
    fetchProducts,
    loadMoreProducts,
    refreshProducts,
    clearCache
  };
};
