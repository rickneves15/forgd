import { QueryClient } from '@tanstack/react-query'

// One QueryClient for the app. StaleTime 0 keeps the cache fresh on every
// mount; screens opt into longer staleTime per their APP spec §4 tables.
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0,
      gcTime: 5 * 60 * 1000,
    },
  },
})
