'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { apiFetchClient } from '@/lib/api/apiFetchClient';
import { isAuthUser, type AuthUser } from '@/lib/auth/authTypes';

import { authKeys } from '../authKeys';

type Credentials = {
  username: string;
  password: string;
};

const parseAuthResponse = (data: unknown): AuthUser => {
  if (!isAuthUser(data)) {
    throw new Error('Invalid auth response shape');
  }
  return data;
};

export const useAuthMutations = () => {
  const queryClient = useQueryClient();

  const invalidateSession = async () => {
    await queryClient.invalidateQueries({ queryKey: authKeys.session });
  };

  const registerMutation = useMutation({
    mutationFn: async (credentials: Credentials) => {
      const data = await apiFetchClient<unknown>('/auth/register', {
        method: 'POST',
        body: credentials,
      });
      return parseAuthResponse(data);
    },
    onSuccess: invalidateSession,
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: Credentials) => {
      const data = await apiFetchClient<unknown>('/auth/login', {
        method: 'POST',
        body: credentials,
      });
      return parseAuthResponse(data);
    },
    onSuccess: invalidateSession,
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiFetchClient('/auth/logout', { method: 'POST' });
    },
    onSuccess: async () => {
      queryClient.setQueryData(authKeys.session, null);
      await invalidateSession();
    },
  });

  return {
    register: registerMutation,
    login: loginMutation,
    logout: logoutMutation,
  };
};
