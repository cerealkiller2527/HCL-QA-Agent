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
    } finally {
      setLoading(false)
    }
  }, [options.fetcher, ...(options.dependencies || [])])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const refetch = useCallback(() => {
    fetchData()
  }, [fetchData])

  return { data, loading, error, refetch }
}
