'use client';

import { useQuery } from '@tanstack/react-query';

import { apiFetchClient } from '@/lib/api/apiFetchClient';
import {
  isUsernameSuggestResponse,
  type UsernameSuggestResponse,
} from '@/lib/users/usernameTypes';

export const USERNAME_SUGGEST_DEBOUNCE_MS = 300;

export const usernameSuggestionKeys = {
  all: ['username-suggestions'] as const,
  list: (query: string) => [...usernameSuggestionKeys.all, query] as const,
};

const parseUsernameSuggestResponse = (
  data: unknown,
): UsernameSuggestResponse => {
  if (!isUsernameSuggestResponse(data)) {
    throw new Error('Invalid username suggest response shape');
  }
  return data;
};

const buildUsernameSuggestPath = (query: string): string => {
  const search = new URLSearchParams();
  search.set('q', query);
  return `/users/username-suggest?${search.toString()}`;
};

export const useUsernameSuggestionsQuery = (debouncedQuery: string) => {
  const trimmedQuery = debouncedQuery.trim();

  return useQuery({
    queryKey: usernameSuggestionKeys.list(trimmedQuery),
    queryFn: async ({ signal }) => {
      const data = await apiFetchClient<unknown>(
        buildUsernameSuggestPath(trimmedQuery),
        { signal },
      );
      return parseUsernameSuggestResponse(data);
    },
    enabled: trimmedQuery.length >= 1,
    staleTime: 30_000,
  });
};
