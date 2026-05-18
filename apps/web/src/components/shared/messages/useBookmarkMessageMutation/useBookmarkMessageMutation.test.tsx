import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';

import { messageKeys } from '@/components/shared/messages/messageKeys';
import { apiFetchClient } from '@/lib/api/apiFetchClient';

import { useBookmarkMessageMutation } from './useBookmarkMessageMutation';

jest.mock('@/lib/api/apiFetchClient', () => ({
  apiFetchClient: jest.fn(),
}));

const mockApiFetchClient = apiFetchClient as jest.MockedFunction<
  typeof apiFetchClient
>;

const createWrapper = (queryClient: QueryClient) => {
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return Wrapper;
};

describe('useBookmarkMessageMutation', () => {
  beforeEach(() => {
    mockApiFetchClient.mockReset();
  });

  it('bookmarks a message and invalidates message list queries', async () => {
    mockApiFetchClient.mockResolvedValue({
      messageId: 'msg-1',
      isBookmarked: true,
      createdAt: '2026-05-18T09:00:00.000Z',
    });
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useBookmarkMessageMutation(), {
      wrapper: createWrapper(queryClient),
    });

    result.current.mutate({ id: 'msg-1', shouldBookmark: true });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockApiFetchClient).toHaveBeenCalledWith(
      '/messages/msg-1/bookmark',
      {
        method: 'PUT',
      },
    );
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: messageKeys.all,
    });
    expect(result.current.data).toEqual({
      messageId: 'msg-1',
      isBookmarked: true,
      createdAt: '2026-05-18T09:00:00.000Z',
    });
  });

  it('unbookmarks a message with DELETE', async () => {
    mockApiFetchClient.mockResolvedValue(undefined);
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    const { result } = renderHook(() => useBookmarkMessageMutation(), {
      wrapper: createWrapper(queryClient),
    });

    result.current.mutate({ id: 'msg-1', shouldBookmark: false });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockApiFetchClient).toHaveBeenCalledWith(
      '/messages/msg-1/bookmark',
      {
        method: 'DELETE',
      },
    );
  });
});
