import { useState, useEffect, useRef, useCallback } from 'react';

interface UseInfiniteScrollProps {
  fetchMore: () => Promise<void>;
  hasMore: boolean;
  threshold?: number;
  rootMargin?: string;
}

export const useInfiniteScroll = ({
  fetchMore,
  hasMore,
  threshold = 1.0,
  rootMargin = '100px',
}: UseInfiniteScrollProps) => {
  const [loading, setLoading] = useState(false);
  const observerRef = useRef<HTMLDivElement>(null);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      await fetchMore();
    } finally {
      setLoading(false);
    }
  }, [fetchMore, hasMore, loading]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasMore && !loading) {
          loadMore();
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    const currentRef = observerRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [hasMore, loading, loadMore, threshold, rootMargin]);

  return { observerRef, loading };
};

interface UseLazyLoadingProps<T> {
  initialData?: T[];
  pageSize?: number;
  fetchFunction: (
    page: number,
    pageSize: number
  ) => Promise<{
    data: T[];
    hasMore: boolean;
    total?: number;
  }>;
}

export const useLazyLoading = <T,>({
  initialData = [],
  pageSize = 20,
  fetchFunction,
}: UseLazyLoadingProps<T>) => {
  const [data, setData] = useState<T[]>(initialData);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const fetchMore = useCallback(async () => {
    if (loading) return;

    setLoading(true);
    setError(null);

    try {
      const result = await fetchFunction(page, pageSize);

      setData(prev => [...prev, ...result.data]);
      setHasMore(result.hasMore);
      setPage(prev => prev + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  }, [fetchFunction, page, pageSize, loading]);

  const reset = useCallback(() => {
    setData(initialData);
    setPage(1);
    setHasMore(true);
    setError(null);
  }, [initialData]);

  const { observerRef, loading: infiniteLoading } = useInfiniteScroll({
    fetchMore,
    hasMore,
  });

  return {
    data,
    loading: loading || infiniteLoading,
    hasMore,
    error,
    fetchMore,
    reset,
    observerRef,
  };
};
