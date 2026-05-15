'use client';

import { useInfiniteQuery } from '@tanstack/react-query';

import { apiFetchClient } from '@/lib/api/apiFetchClient';
import {
  isPaginatedMessages,
  type PaginatedMessages,
} from '@/lib/messages/messageTypes';

import { messageKeys } from '../messageKeys';

const DEFAULT_PAGE_SIZE = 5;

type ListMessagesParams = {
  limit?: number;
  cursor?: string;
  categoryTag?: string;
};

const buildMessagesPath = ({
  limit = DEFAULT_PAGE_SIZE,
  cursor,
  categoryTag,
}: ListMessagesParams): string => {
  const search = new URLSearchParams();
  search.set('limit', String(limit));
  if (cursor !== undefined) {
    search.set('cursor', cursor);
  }
  if (categoryTag !== undefined) {
    search.set('categoryTag', categoryTag);
  }
  return `/messages?${search.toString()}`;
};

const parsePaginatedMessages = (data: unknown): PaginatedMessages => {
  if (!isPaginatedMessages(data)) {
    throw new Error('Invalid paginated messages response shape');
  }
  return data;
};

export const useMessagesInfiniteQuery = (categoryTag: string | null) => {
  return useInfiniteQuery({
    queryKey: messageKeys.list(categoryTag),
    queryFn: async ({ pageParam, signal }) => {
      const data = await apiFetchClient<unknown>(
        buildMessagesPath({
          cursor: pageParam,
          categoryTag: categoryTag ?? undefined,
        }),
        { signal },
      );
      return parsePaginatedMessages(data);
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore && lastPage.nextCursor !== null
        ? lastPage.nextCursor
        : undefined,
  });
};
