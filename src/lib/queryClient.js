import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000,
      refetchOnWindowFocus: true,
      retry: 1
    }
  }
});

export const SPOTLIGHT_SONGS_QUERY_KEY = ['spotlight-songs'];
export const SONGS_ADMIN_QUERY_KEY = ['songs-admin'];
