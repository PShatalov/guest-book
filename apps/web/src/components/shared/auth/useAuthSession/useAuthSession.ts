'use client';

import { useQuery } from '@tanstack/react-query';

import { apiFetchClient } from '@/lib/api/apiFetchClient';
import { ApiError } from '@/lib/api/apiError';
import { isAuthUser, type AuthUser } from '@/lib/auth/authTypes';

import { authKeys } from '../authKeys';

export const useAuthSession = () => {
  const query = useQuery({
    queryKey: authKeys.session,
    retry: false,
    queryFn: async ({ signal }): Promise<AuthUser | null> => {
      try {
        const data = await apiFetchClient<unknown>('/auth/session', { signal });
        if (!isAuthUser(data)) {
          throw new Error('Invalid session response shape');
        }
        return data;
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
          return null;
        }
        // Timeouts and other transport failures: render signed-out chrome.
        if (error instanceof ApiError) {
          throw error;
        }
        return null;
      }
    },
  });

  return {
    username: query.data?.username ?? null,
    isPending: query.isPending,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
};
