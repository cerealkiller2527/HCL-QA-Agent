"use client"

import { useData } from "./use-data"
import { dataService } from "@/lib/services/data.service"
import type { Robot } from "@/lib/types/dataset"

export function useRobots(filters?: { status?: string; type?: string }) {
  return useData<Robot[]>({
    fetcher: () => dataService.getRobots(filters),
    dependencies: [filters?.status, filters?.type],
  })
}

export function useRobot(id: string) {
  return useData<Robot | null>({
    fetcher: () => dataService.getRobot(id),
    dependencies: [id],
  })
}
