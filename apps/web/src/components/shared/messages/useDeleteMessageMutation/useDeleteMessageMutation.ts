'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { apiFetchClient } from '@/lib/api/apiFetchClient';

import { messageKeys } from '../messageKeys';

export const useDeleteMessageMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiFetchClient<void>(`/messages/${id}`, {
        method: 'DELETE',
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: messageKeys.all });
    },
  });
};
