import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Data is fresh for 5 minutes for datasets, 2 minutes for episodes
      staleTime: 5 * 60 * 1000,
      // Keep data in cache for 10 minutes after last use
      gcTime: 10 * 60 * 1000,
      // Retry failed requests 3 times with exponential backoff
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      // Don't refetch on window focus by default
      refetchOnWindowFocus: false,
      // Don't refetch on reconnect for stability
      refetchOnReconnect: false,
      // Throw errors to error boundaries
      throwOnError: false,
    },
    mutations: {
      // Retry mutations once on failure
      retry: 1,
      // Don't throw errors by default for mutations
      throwOnError: false,
    },
  },
});

// Query key configurations with different stale times
export const queryConfig = {
  datasets: {
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000,   // 10 minutes
  },
  episodes: {
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000,   // 10 minutes
  },
  telemetry: {
    staleTime: 60 * 1000,     // 1 minute (more dynamic data)
    gcTime: 5 * 60 * 1000,    // 5 minutes
  },
  user: {
    staleTime: 15 * 60 * 1000, // 15 minutes (rarely changes)
    gcTime: 30 * 60 * 1000,    // 30 minutes
  },
};