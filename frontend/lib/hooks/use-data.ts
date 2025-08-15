"use client"

import { useState, useEffect, useCallback } from "react"

interface UseDataOptions<T> {
  fetcher: () => Promise<T>
  dependencies?: any[]
}

export function useData<T>(options: UseDataOptions<T>) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await options.fetcher()
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch data")
      // Don't retry on error - let user manually retry
      console.error("Data fetch error:", err)
    } finally {
      setLoading(false)
    }
  }, [options.fetcher, ...(options.dependencies || [])])

  useEffect(() => {
    let mounted = true
    
    // Only fetch if component is mounted
    if (mounted) {
      fetchData()
    }
    
    // Cleanup function
    return () => {
      mounted = false
    }
  }, []) // Only run once on mount, not on every fetchData change

  const refetch = useCallback(() => {
    fetchData()
  }, [fetchData])

  return { data, loading, error, refetch }
}
