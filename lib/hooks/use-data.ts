"use client"

import { useState, useEffect, useCallback } from "react"
import { type ApiResponse, ApiError } from "@/lib/api/base"

export interface UseDataOptions<T> {
  initialData?: T
  enabled?: boolean
  refetchInterval?: number
  onSuccess?: (data: T) => void
  onError?: (error: ApiError) => void
}

export interface UseDataResult<T> {
  data: T | undefined
  loading: boolean
  error: ApiError | null
  refetch: () => Promise<void>
  mutate: (newData: T) => void
}

export function useData<T>(fetcher: () => Promise<ApiResponse<T>>, options: UseDataOptions<T> = {}): UseDataResult<T> {
  const { initialData, enabled = true, refetchInterval, onSuccess, onError } = options

  const [data, setData] = useState<T | undefined>(initialData)
  const [loading, setLoading] = useState<boolean>(!initialData && enabled)
  const [error, setError] = useState<ApiError | null>(null)

  const fetchData = useCallback(async () => {
    if (!enabled) return

    try {
      setLoading(true)
      setError(null)
      const response = await fetcher()

      if (response.success) {
        setData(response.data)
        onSuccess?.(response.data)
      } else {
        const apiError = new ApiError({
          message: response.message || "Request failed",
          code: "API_ERROR",
          status: 400,
        })
        setError(apiError)
        onError?.(apiError)
      }
    } catch (err) {
      const apiError =
        err instanceof ApiError
          ? err
          : new ApiError({
              message: "Unknown error occurred",
              code: "UNKNOWN_ERROR",
              status: 500,
            })
      setError(apiError)
      onError?.(apiError)
    } finally {
      setLoading(false)
    }
  }, [fetcher, enabled, onSuccess, onError])

  const mutate = useCallback((newData: T) => {
    setData(newData)
  }, [])

  useEffect(() => {
    if (enabled) {
      fetchData()
    }
  }, [fetchData, enabled])

  useEffect(() => {
    if (refetchInterval && enabled) {
      const interval = setInterval(fetchData, refetchInterval)
      return () => clearInterval(interval)
    }
  }, [fetchData, refetchInterval, enabled])

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    mutate,
  }
}

// Specialized hooks for common data types
export function useDatasets(filters?: any) {
  return useData(() => import("@/lib/services/dataset.service").then((m) => m.datasetService.getDatasets(filters)))
}

export function useRobots(filters?: any) {
  return useData(() => import("@/lib/services/robot.service").then((m) => m.robotService.getRobots(filters)), {
    refetchInterval: 30000,
  }) // Refresh every 30 seconds
}

export function useRobotStats() {
  return useData(() => import("@/lib/services/robot.service").then((m) => m.robotService.getRobotStats()), {
    refetchInterval: 10000,
  }) // Refresh every 10 seconds
}
