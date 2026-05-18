import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';

import { apiFetchClient } from '@/lib/api/apiFetchClient';

import { useMessagesInfiniteQuery } from './useMessagesInfiniteQuery';

jest.mock('@/lib/api/apiFetchClient', () => ({
  apiFetchClient: jest.fn(),
}));

const mockApiFetchClient = apiFetchClient as jest.MockedFunction<
  typeof apiFetchClient
>;

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return Wrapper;
};

describe('useMessagesInfiniteQuery', () => {
  beforeEach(() => {
    mockApiFetchClient.mockReset();
  });

  it('fetches the first page without filters', async () => {
    mockApiFetchClient.mockResolvedValue({
      items: [
        {
          id: '1',
          text: 'First',
          categoryTag: 'general',
          authorUsername: 'alice',
          createdAt: '2026-05-15T12:00:00.000Z',
          isBookmarked: false,
        },
      ],
      hasMore: false,
      nextCursor: null,
    });

    const { result } = renderHook(
      () =>
        useMessagesInfiniteQuery({
          authorUsername: null,
          bookmarkedOnly: false,
          categoryTag: null,
          dateRange: null,
        }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockApiFetchClient).toHaveBeenCalledWith(
      '/messages?limit=5',
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
    expect(result.current.data?.pages[0]?.items).toHaveLength(1);
  });

  it('includes categoryTag in the request when filtering', async () => {
    mockApiFetchClient.mockResolvedValue({
      items: [],
      hasMore: false,
      nextCursor: null,
    });

    const { result } = renderHook(
      () =>
        useMessagesInfiniteQuery({
          authorUsername: null,
          bookmarkedOnly: false,
          categoryTag: 'general',
          dateRange: null,
        }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockApiFetchClient).toHaveBeenCalledWith(
      '/messages?limit=5&categoryTag=general',
      expect.any(Object),
    );
  });

  it('includes only createdFrom for an open-ended lower bound', async () => {
    mockApiFetchClient.mockResolvedValue({
      items: [],
      hasMore: false,
      nextCursor: null,
    });

    const { result } = renderHook(
      () =>
        useMessagesInfiniteQuery({
          authorUsername: null,
          bookmarkedOnly: false,
          categoryTag: null,
          dateRange: { createdFrom: '2026-05-01T00:00:00.000Z' },
        }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockApiFetchClient).toHaveBeenCalledWith(
      '/messages?limit=5&createdFrom=2026-05-01T00%3A00%3A00.000Z',
      expect.any(Object),
    );
  });

  it('includes categoryTag and date bounds when both filters are active', async () => {
    mockApiFetchClient.mockResolvedValue({
      items: [],
      hasMore: false,
      nextCursor: null,
    });

    const { result } = renderHook(
      () =>
        useMessagesInfiniteQuery({
          authorUsername: null,
          bookmarkedOnly: false,
          categoryTag: 'general',
          dateRange: {
            createdFrom: '2026-05-01T00:00:00.000Z',
            createdTo: '2026-05-31T23:59:59.999Z',
          },
        }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockApiFetchClient).toHaveBeenCalledWith(
      '/messages?limit=5&categoryTag=general&createdFrom=2026-05-01T00%3A00%3A00.000Z&createdTo=2026-05-31T23%3A59%3A59.999Z',
      expect.any(Object),
    );
  });

  it('includes createdFrom and createdTo when date filtering', async () => {
    mockApiFetchClient.mockResolvedValue({
      items: [],
      hasMore: false,
      nextCursor: null,
    });

    const { result } = renderHook(
      () =>
        useMessagesInfiniteQuery({
          authorUsername: null,
          bookmarkedOnly: false,
          categoryTag: null,
          dateRange: {
            createdFrom: '2026-05-01T00:00:00.000Z',
            createdTo: '2026-05-31T23:59:59.999Z',
          },
        }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockApiFetchClient).toHaveBeenCalledWith(
      '/messages?limit=5&createdFrom=2026-05-01T00%3A00%3A00.000Z&createdTo=2026-05-31T23%3A59%3A59.999Z',
      expect.any(Object),
    );
  });

  it('includes authorUsername in the request when filtering by user', async () => {
    mockApiFetchClient.mockResolvedValue({
      items: [],
      hasMore: false,
      nextCursor: null,
    });

    const { result } = renderHook(
      () =>
        useMessagesInfiniteQuery({
          authorUsername: 'alice',
          bookmarkedOnly: false,
          categoryTag: null,
          dateRange: null,
        }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockApiFetchClient).toHaveBeenCalledWith(
      '/messages?limit=5&authorUsername=alice',
      expect.any(Object),
    );
  });

  it('includes bookmarkedOnly in the request when filtering bookmarks', async () => {
    mockApiFetchClient.mockResolvedValue({
      items: [],
      hasMore: false,
      nextCursor: null,
    });

    const { result } = renderHook(
      () =>
        useMessagesInfiniteQuery({
          authorUsername: null,
          bookmarkedOnly: true,
          categoryTag: null,
          dateRange: null,
        }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockApiFetchClient).toHaveBeenCalledWith(
      '/messages?limit=5&bookmarkedOnly=true',
      expect.any(Object),
    );
  });

  it('exposes the next page cursor when hasMore is true', async () => {
    mockApiFetchClient.mockResolvedValue({
      items: [],
      hasMore: true,
      nextCursor: 'cursor-token',
    });

    const { result } = renderHook(
      () =>
        useMessagesInfiniteQuery({
          authorUsername: null,
          bookmarkedOnly: false,
          categoryTag: null,
          dateRange: null,
        }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.hasNextPage).toBe(true);
  });
});
