"use client"

import { useState, useEffect, useCallback } from "react"
import { robotService, type RobotFilters } from "@/lib/services/robot.service"
import type { Robot } from "@/lib/types/dataset"

export function useRobots(filters?: RobotFilters) {
  const [robots, setRobots] = useState<Robot[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchRobots = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await robotService.getRobots(filters)
      setRobots(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch robots")
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    fetchRobots()
  }, [fetchRobots])

  const refetch = useCallback(() => {
    fetchRobots()
  }, [fetchRobots])

  return {
    robots,
    loading,
    error,
    refetch,
  }
}

export function useRobot(id: string) {
  const [robot, setRobot] = useState<Robot | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchRobot() {
      try {
        setLoading(true)
        setError(null)
        const data = await robotService.getRobot(id)
        setRobot(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch robot")
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchRobot()
    }
  }, [id])

  return {
    robot,
    loading,
    error,
  }
}
