"use client"

import { useData } from "./use-data"
import datasetsApi from "@/lib/api/datasets.api"
import type { Dataset, Episode, EpisodeData } from "@/lib/api/schemas/validation"

export function useDatasets(filters?: { search?: string; status?: string; robotType?: string }) {
  return useData<Dataset[]>({
    fetcher: async () => {
      // Get all datasets from API
      const datasets = await datasetsApi.getAll();
      
      // Apply frontend filtering if needed
      if (filters) {
        return datasets.filter((dataset) => {
          // Search filter
          if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            const matchesSearch =
              dataset.name.toLowerCase().includes(searchLower) ||
              dataset.description.toLowerCase().includes(searchLower) ||
              dataset.tags.some((tag: string) => tag.toLowerCase().includes(searchLower));
            if (!matchesSearch) return false;
          }
          
          // Status filter
          if (filters.status && filters.status !== 'all' && dataset.status !== filters.status) {
            return false;
          }
          
          // Robot type filter
          if (filters.robotType && filters.robotType !== 'all' && dataset.robotType !== filters.robotType) {
            return false;
          }
          
          return true;
        });
      }
      
      return datasets;
    },
    dependencies: [filters?.search, filters?.status, filters?.robotType],
  })
}

export function useDataset(id: string) {
  return useData<Dataset | null>({
    fetcher: () => datasetsApi.getById(id),
    dependencies: [id],
  })
}
