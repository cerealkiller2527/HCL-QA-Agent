"use client"

import { useData } from "./use-data"
import { dataService } from "@/lib/services/data.service"
import type { Dataset } from "@/lib/types/dataset"

export function useDatasets(filters?: { search?: string; status?: string; robotType?: string }) {
  return useData<Dataset[]>({
    fetcher: () => dataService.getDatasets(filters),
    dependencies: [filters?.search, filters?.status, filters?.robotType],
  })
}

export function useDataset(id: string) {
  return useData<Dataset | null>({
    fetcher: () => dataService.getDataset(id),
    dependencies: [id],
  })
}
