'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { apiFetchClient } from '@/lib/api/apiFetchClient';
import { isMessage, type Message } from '@/lib/messages/messageTypes';

import { messageKeys } from '../messageKeys';

export type UpdateMessagePayload = {
  text: string;
  categoryTag: string;
};

export type UpdateMessageVariables = {
  id: string;
  payload: UpdateMessagePayload;
};

const parseMessageResponse = (data: unknown): Message => {
  if (!isMessage(data)) {
    throw new Error('Invalid message response shape');
  }
  return data;
};

export const useUpdateMessageMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, payload }: UpdateMessageVariables) => {
      const data = await apiFetchClient<unknown>(`/messages/${id}`, {
        method: 'PATCH',
        body: payload,
      });
      return parseMessageResponse(data);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: messageKeys.all });
    },
  });
};
