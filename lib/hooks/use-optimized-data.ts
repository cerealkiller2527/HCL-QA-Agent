"use client"

import type React from "react"

import { useState, useEffect, useCallback, useMemo } from "react"
import { debounce, throttle, PerformanceMonitor } from "@/lib/utils/performance"
import { useData } from "@/lib/hooks/use-data"

// Optimized data fetching with caching and debouncing
export function useOptimizedSearch<T>(searchFn: (query: string) => Promise<T[]>, initialQuery = "", debounceMs = 300) {
  const [query, setQuery] = useState(initialQuery)
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery)
  const [cache, setCache] = useState(new Map<string, T[]>())

  const debouncedSetQuery = useMemo(() => debounce((q: string) => setDebouncedQuery(q), debounceMs), [debounceMs])

  useEffect(() => {
    debouncedSetQuery(query)
  }, [query, debouncedSetQuery])

  const { data, loading, error } = useData(
    async () => {
      if (!debouncedQuery.trim()) {
        return { data: [], success: true }
      }

      // Check cache first
      if (cache.has(debouncedQuery)) {
        return { data: cache.get(debouncedQuery)!, success: true }
      }

      // Fetch and cache
      const results = await PerformanceMonitor.measureAsync(`search-${debouncedQuery}`, () => searchFn(debouncedQuery))

      setCache((prev) => new Map(prev).set(debouncedQuery, results))
      return { data: results, success: true }
    },
    { enabled: !!debouncedQuery },
  )

  const updateQuery = useCallback((newQuery: string) => {
    setQuery(newQuery)
  }, [])

  const clearCache = useCallback(() => {
    setCache(new Map())
  }, [])

  return {
    query,
    updateQuery,
    results: data || [],
    loading,
    error,
    clearCache,
  }
}

// Optimized infinite scroll
export function useInfiniteScroll<T>(
  fetchFn: (page: number) => Promise<{ data: T[]; hasMore: boolean }>,
  threshold = 0.8,
) {
  const [items, setItems] = useState<T[]>([])
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return

    setLoading(true)
    try {
      const result = await PerformanceMonitor.measureAsync(`infinite-scroll-page-${page}`, () => fetchFn(page))

      setItems((prev) => [...prev, ...result.data])
      setHasMore(result.hasMore)
      setPage((prev) => prev + 1)
    } catch (error) {
      console.error("Failed to load more items:", error)
    } finally {
      setLoading(false)
    }
  }, [fetchFn, page, loading, hasMore])

  const throttledLoadMore = useMemo(() => throttle(loadMore, 200), [loadMore])

  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLElement>) => {
      const { scrollTop, scrollHeight, clientHeight } = e.currentTarget
      const scrollPercentage = (scrollTop + clientHeight) / scrollHeight

      if (scrollPercentage >= threshold) {
        throttledLoadMore()
      }
    },
    [threshold, throttledLoadMore],
  )

  const reset = useCallback(() => {
    setItems([])
    setPage(1)
    setHasMore(true)
  }, [])

  return {
    items,
    loading,
    hasMore,
    handleScroll,
    loadMore,
    reset,
  }
}

// Optimized real-time updates
export function useOptimizedRealTime<T>(fetchFn: () => Promise<T>, interval = 5000, enabled = true) {
  const [lastUpdate, setLastUpdate] = useState<Date>()

  const { data, loading, error, refetch } = useData(fetchFn, {
    enabled,
    refetchInterval: enabled ? interval : undefined,
    onSuccess: () => setLastUpdate(new Date()),
  })

  const forceRefresh = useCallback(async () => {
    await refetch()
  }, [refetch])

  return {
    data,
    loading,
    error,
    lastUpdate,
    forceRefresh,
  }
}
