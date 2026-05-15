'use client';

import { useMutation } from '@tanstack/react-query';

import { apiFetchClient } from '@/lib/api/apiFetchClient';
import { isMessage, type Message } from '@/lib/messages/messageTypes';

export type CreateMessagePayload = {
  text: string;
  categoryTag: string;
};

const parseMessageResponse = (data: unknown): Message => {
  if (!isMessage(data)) {
    throw new Error('Invalid message response shape');
  }
  return data;
};

export const useCreateMessageMutation = () => {
  return useMutation({
    mutationFn: async (payload: CreateMessagePayload) => {
      const data = await apiFetchClient<unknown>('/messages', {
        method: 'POST',
        body: payload,
      });
      return parseMessageResponse(data);
    },
  });
};
