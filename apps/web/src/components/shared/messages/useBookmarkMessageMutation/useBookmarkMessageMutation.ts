'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { apiFetchClient } from '@/lib/api/apiFetchClient';

import { messageKeys } from '../messageKeys';

export type BookmarkMessageVariables = {
  id: string;
  shouldBookmark: boolean;
};

export type BookmarkMessageResponse = {
  messageId: string;
  isBookmarked: true;
  createdAt: string;
};

const isBookmarkMessageResponse = (
  value: unknown,
): value is BookmarkMessageResponse => {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const record = value as Record<string, unknown>;
  return (
    typeof record.messageId === 'string' &&
    record.isBookmarked === true &&
    typeof record.createdAt === 'string'
  );
};

const parseBookmarkMessageResponse = (
  data: unknown,
): BookmarkMessageResponse => {
  if (!isBookmarkMessageResponse(data)) {
    throw new Error('Invalid bookmark response shape');
  }
  return data;
};

export const useBookmarkMessageMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, shouldBookmark }: BookmarkMessageVariables) => {
      const data = await apiFetchClient<unknown>(`/messages/${id}/bookmark`, {
        method: shouldBookmark ? 'PUT' : 'DELETE',
      });
      return shouldBookmark ? parseBookmarkMessageResponse(data) : undefined;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: messageKeys.all });
    },
  });
};
