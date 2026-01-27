"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache data for 5 minutes (300000 ms)
      staleTime: 1000 * 60 * 5,
      // Keep data in cache for 10 minutes (600000 ms) even if unused
      gcTime: 1000 * 60 * 10,
      // Refetch on window focus
      refetchOnWindowFocus: true,
      // Refetch on mount if data is stale
      refetchOnMount: true,
      // Don't refetch on reconnect by default
      refetchOnReconnect: false,
      // Retry failed requests once
      retry: 1,
    },
  },
});

export default function QueryProvider({ children }: React.PropsWithChildren) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
