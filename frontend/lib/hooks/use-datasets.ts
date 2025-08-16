"use client"

import { useData } from "./use-data"
import datasetsApi from "@/lib/api/datasets.api"
import type { Dataset, Episode, EpisodeData } from "@/lib/api/schemas/dataset.schema"

// Hook for fetching all datasets with optional filtering
export function useDatasets(filters?: { 
  search?: string; 
  status?: string; 
  robotType?: string;
  limit?: number;
}) {
  return useData<Dataset[]>({
    fetcher: async () => {
      // Get all datasets from API
      const datasets = await datasetsApi.getAll();
      
      // Apply frontend filtering if needed
      if (filters) {
        let filteredDatasets = datasets.filter((dataset) => {
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

        // Apply limit after filtering
        if (filters.limit && filters.limit > 0) {
          filteredDatasets = filteredDatasets.slice(0, filters.limit);
        }

        return filteredDatasets;
      }
      
      return datasets;
    },
    dependencies: [filters?.search, filters?.status, filters?.robotType, filters?.limit],
  })
}

// Hook for fetching a single dataset by ID
export function useDataset(id: string) {
  return useData<Dataset | null>({
    fetcher: async () => {
      if (!id) return null;
      return await datasetsApi.getById(id);
    },
    dependencies: [id],
  })
}

// Hook for fetching episodes of a specific dataset
export function useDatasetEpisodes(datasetId: string) {
  return useData<Episode[]>({
    fetcher: async () => {
      if (!datasetId) return [];
      return await datasetsApi.getEpisodes(datasetId);
    },
    dependencies: [datasetId],
  })
}

// Hook for fetching specific episode data including telemetry and videos
export function useEpisodeData(datasetId: string, episodeId: number | null) {
  return useData<EpisodeData | null>({
    fetcher: async () => {
      if (!datasetId || episodeId === null || episodeId === undefined) return null;
      return await datasetsApi.getEpisodeData(datasetId, episodeId);
    },
    dependencies: [datasetId, episodeId],
  })
}

// Hook for checking API health
export function useApiHealth() {
  return useData<boolean>({
    fetcher: async () => {
      return await datasetsApi.checkHealth();
    },
    dependencies: [],
  })
}

// Utility hook for batch operations (used by dataset management pages)
export function useDatasetOperations() {
  const deleteDataset = async (datasetId: string): Promise<void> => {
    return await datasetsApi.delete(datasetId);
  };

  const getDatasetSize = async (datasetId: string): Promise<{ size: number } | null> => {
    return await datasetsApi.getSize(datasetId);
  };

  return {
    deleteDataset,
    getDatasetSize,
  };
}
