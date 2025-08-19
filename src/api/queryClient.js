// React Query client setup for better state management
// Note: This requires @tanstack/react-query to be installed

import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: 2,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
      retryDelay: 1000,
    },
  },
});

// Custom hooks for common API operations
export const useQueryConfig = {
  // Default query configuration
  default: {
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
  },
  
  // For frequently changing data
  frequent: {
    staleTime: 30 * 1000, // 30 seconds
    cacheTime: 2 * 60 * 1000, // 2 minutes
  },
  
  // For rarely changing data
  static: {
    staleTime: 30 * 60 * 1000, // 30 minutes
    cacheTime: 60 * 60 * 1000, // 1 hour
  },
  
  // For real-time data
  realtime: {
    staleTime: 0,
    cacheTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 30 * 1000, // 30 seconds
  },
};

// Query keys factory
export const queryKeys = {
  auth: {
    user: ['auth', 'user'],
    profile: ['auth', 'profile'],
  },
  farmers: {
    all: ['farmers'],
    byId: (id) => ['farmers', id],
    visits: (farmerId) => ['farmers', farmerId, 'visits'],
  },
  dealers: {
    all: ['dealers'],
    byId: (id) => ['dealers', id],
    visits: (dealerId) => ['dealers', dealerId, 'visits'],
  },
  products: {
    all: ['products'],
    byId: (id) => ['products', id],
    categories: ['products', 'categories'],
  },
  orders: {
    all: ['orders'],
    byId: (id) => ['orders', id],
    pending: ['orders', 'pending'],
  },
  payments: {
    all: ['payments'],
    byId: (id) => ['payments', id],
    pending: ['payments', 'pending'],
  },
};
