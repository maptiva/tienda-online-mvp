import { QueryClient } from '@tanstack/react-query';

/**
 * QueryClient configuration for TanStack Query
 * 
 * staleTime: Time in ms before data is considered stale (needs refetch)
 * gcTime: Time in ms before unused data is garbage collected
 * refetchOnWindowFocus: Refetch when user returns to the tab
 * refetchOnReconnect: Refetch when network reconnects
 * retry: Number of retry attempts on failure
 */
export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 30 * 1000,      // 30 seconds default
            gcTime: 5 * 60 * 1000,     // 5 minutes in cache
            refetchOnWindowFocus: true,
            refetchOnReconnect: true,
            retry: 2,
            retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
        },
    },
});
