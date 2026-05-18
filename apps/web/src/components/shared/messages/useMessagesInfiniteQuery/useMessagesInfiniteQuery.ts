'use client';

import { useInfiniteQuery, type InfiniteData } from '@tanstack/react-query';

import { apiFetchClient } from '@/lib/api/apiFetchClient';
import type { MessageDateRangeFilter } from '@/lib/messages/messageDateRange';
import {
  isPaginatedMessages,
  type PaginatedMessages,
} from '@/lib/messages/messageTypes';

import { messageKeys } from '../messageKeys';

const DEFAULT_PAGE_SIZE = 5;

export type MessagesFeedFilters = {
  authorUsername: string | null;
  bookmarkedOnly: boolean;
  categoryTag: string | null;
  dateRange: MessageDateRangeFilter | null;
};

type ListMessagesParams = {
  limit?: number;
  cursor?: string;
  authorUsername?: string;
  bookmarkedOnly?: boolean;
  categoryTag?: string;
  createdFrom?: string;
  createdTo?: string;
};

const buildMessagesPath = ({
  limit = DEFAULT_PAGE_SIZE,
  cursor,
  authorUsername,
  bookmarkedOnly,
  categoryTag,
  createdFrom,
  createdTo,
}: ListMessagesParams): string => {
  const search = new URLSearchParams();
  search.set('limit', String(limit));
  if (cursor !== undefined) {
    search.set('cursor', cursor);
  }
  if (authorUsername !== undefined) {
    search.set('authorUsername', authorUsername);
  }
  if (bookmarkedOnly === true) {
    search.set('bookmarkedOnly', 'true');
  }
  if (categoryTag !== undefined) {
    search.set('categoryTag', categoryTag);
  }
  if (createdFrom !== undefined) {
    search.set('createdFrom', createdFrom);
  }
  if (createdTo !== undefined) {
    search.set('createdTo', createdTo);
  }
  return `/messages?${search.toString()}`;
};

const parsePaginatedMessages = (data: unknown): PaginatedMessages => {
  if (!isPaginatedMessages(data)) {
    throw new Error('Invalid paginated messages response shape');
  }
  return data;
};

export const useMessagesInfiniteQuery = (filters: MessagesFeedFilters) => {
  const { authorUsername, bookmarkedOnly, categoryTag, dateRange } = filters;

  return useInfiniteQuery<
    PaginatedMessages,
    Error,
    InfiniteData<PaginatedMessages>,
    ReturnType<typeof messageKeys.list>,
    string | undefined
  >({
    queryKey: messageKeys.list({
      authorUsername,
      bookmarkedOnly,
      categoryTag,
      dateRange,
    }),
    queryFn: async ({ pageParam, signal }) => {
      const data = await apiFetchClient<unknown>(
        buildMessagesPath({
          cursor: pageParam,
          authorUsername: authorUsername ?? undefined,
          bookmarkedOnly,
          categoryTag: categoryTag ?? undefined,
          createdFrom: dateRange?.createdFrom,
          createdTo: dateRange?.createdTo,
        }),
        { signal },
      );
      return parsePaginatedMessages(data);
    },
    initialPageParam: undefined,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore && lastPage.nextCursor !== null
        ? lastPage.nextCursor
        : undefined,
  });
};
