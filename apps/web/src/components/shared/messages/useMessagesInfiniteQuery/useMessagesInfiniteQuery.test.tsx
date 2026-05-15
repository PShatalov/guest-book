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

  it('fetches the first page without a category tag filter', async () => {
    mockApiFetchClient.mockResolvedValue({
      items: [
        {
          id: '1',
          text: 'First',
          categoryTag: 'general',
          authorUsername: 'alice',
          createdAt: '2026-05-15T12:00:00.000Z',
        },
      ],
      hasMore: false,
      nextCursor: null,
    });

    const { result } = renderHook(() => useMessagesInfiniteQuery(null), {
      wrapper: createWrapper(),
    });

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

    const { result } = renderHook(() => useMessagesInfiniteQuery('general'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockApiFetchClient).toHaveBeenCalledWith(
      '/messages?limit=5&categoryTag=general',
      expect.any(Object),
    );
  });

  it('exposes the next page cursor when hasMore is true', async () => {
    mockApiFetchClient.mockResolvedValue({
      items: [],
      hasMore: true,
      nextCursor: 'cursor-token',
    });

    const { result } = renderHook(() => useMessagesInfiniteQuery(null), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.hasNextPage).toBe(true);
  });
});
