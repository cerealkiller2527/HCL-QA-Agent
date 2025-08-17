/**
 * Query Keys Factory
 * Centralized query key management for TanStack Query
 * Following TanStack Query best practices for hierarchical keys
 */

export const queryKeys = {
  // All dataset-related queries
  datasets: {
    all: ['datasets'] as const,
    lists: () => [...queryKeys.datasets.all, 'list'] as const,
    list: (filters: { page?: number; limit?: number; search?: string; status?: string; robotType?: string }) => 
      [...queryKeys.datasets.lists(), filters] as const,
    details: () => [...queryKeys.datasets.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.datasets.details(), id] as const,
    enhanced: (id: string) => [...queryKeys.datasets.detail(id), 'enhanced'] as const,
    features: (id: string) => [...queryKeys.datasets.detail(id), 'features'] as const,
    analytics: (id: string) => [...queryKeys.datasets.detail(id), 'analytics'] as const,
    compatibility: (id: string) => [...queryKeys.datasets.detail(id), 'compatibility'] as const,
    size: (id: string) => [...queryKeys.datasets.detail(id), 'size'] as const,
  },

  // Episode-related queries
  episodes: {
    all: ['episodes'] as const,
    lists: () => [...queryKeys.episodes.all, 'list'] as const,
    list: (datasetId: string) => [...queryKeys.episodes.lists(), datasetId] as const,
    details: () => [...queryKeys.episodes.all, 'detail'] as const,
    detail: (datasetId: string, episodeId: number) => 
      [...queryKeys.episodes.details(), datasetId, episodeId] as const,
    enhanced: (datasetId: string, episodeId: number) => 
      [...queryKeys.episodes.detail(datasetId, episodeId), 'enhanced'] as const,
    videos: (datasetId: string, episodeId: number) => 
      [...queryKeys.episodes.detail(datasetId, episodeId), 'videos'] as const,
    videoMetadata: (datasetId: string, episodeId: number) => 
      [...queryKeys.episodes.detail(datasetId, episodeId), 'video-metadata'] as const,
  },

  // Telemetry-related queries
  telemetry: {
    all: ['telemetry'] as const,
    details: () => [...queryKeys.telemetry.all, 'detail'] as const,
    detail: (datasetId: string, episodeId: number, params?: { 
      features?: string; downsample?: number; maxPoints?: number; format?: string 
    }) => [...queryKeys.telemetry.details(), datasetId, episodeId, params] as const,
    memoryEstimate: (datasetId: string, episodeId: number, features?: string) => 
      [...queryKeys.telemetry.detail(datasetId, episodeId), 'memory-estimate', features] as const,
  },

  // User-related queries
  user: {
    all: ['user'] as const,
    info: () => [...queryKeys.user.all, 'info'] as const,
  },

  // Configuration and system queries
  config: {
    all: ['config'] as const,
    backend: () => [...queryKeys.config.all, 'backend'] as const,
  },

  // Robot configuration queries
  robots: {
    all: ['robots'] as const,
    config: (datasetId: string) => [...queryKeys.robots.all, 'config', datasetId] as const,
  },
} as const;

// Utility functions for query key management

/**
 * Get all query keys related to a specific dataset
 */
export function getDatasetQueryKeys(datasetId: string) {
  return [
    queryKeys.datasets.detail(datasetId),
    queryKeys.datasets.enhanced(datasetId),
    queryKeys.datasets.features(datasetId),
    queryKeys.datasets.analytics(datasetId),
    queryKeys.datasets.compatibility(datasetId),
    queryKeys.datasets.size(datasetId),
    queryKeys.episodes.list(datasetId),
    queryKeys.robots.config(datasetId),
  ];
}

/**
 * Get all query keys related to a specific episode
 */
export function getEpisodeQueryKeys(datasetId: string, episodeId: number) {
  return [
    queryKeys.episodes.detail(datasetId, episodeId),
    queryKeys.episodes.enhanced(datasetId, episodeId),
    queryKeys.episodes.videos(datasetId, episodeId),
    queryKeys.episodes.videoMetadata(datasetId, episodeId),
    queryKeys.telemetry.detail(datasetId, episodeId),
  ];
}

/**
 * Invalidate all queries related to a dataset
 */
export function invalidateDatasetQueries(queryClient: any, datasetId: string) {
  const keys = getDatasetQueryKeys(datasetId);
  keys.forEach(key => {
    queryClient.invalidateQueries({ queryKey: key });
  });
}

/**
 * Invalidate all queries related to an episode
 */
export function invalidateEpisodeQueries(queryClient: any, datasetId: string, episodeId: number) {
  const keys = getEpisodeQueryKeys(datasetId, episodeId);
  keys.forEach(key => {
    queryClient.invalidateQueries({ queryKey: key });
  });
}

/**
 * Prefetch related data for better UX
 */
export function prefetchRelatedData(queryClient: any, datasetId: string, episodeId?: number) {
  // Prefetch dataset details when viewing episodes
  if (episodeId !== undefined) {
    queryClient.prefetchQuery({
      queryKey: queryKeys.datasets.detail(datasetId),
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
  }
  
  // Additional prefetch logic can be added here
}