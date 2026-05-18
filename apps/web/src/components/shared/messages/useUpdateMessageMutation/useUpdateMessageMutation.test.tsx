import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';

import { apiFetchClient } from '@/lib/api/apiFetchClient';
import { messageKeys } from '@/components/shared/messages/messageKeys';

import { useUpdateMessageMutation } from './useUpdateMessageMutation';

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

describe('useUpdateMessageMutation', () => {
  beforeEach(() => {
    mockApiFetchClient.mockReset();
  });

  it('invalidates message list queries after a successful update', async () => {
    mockApiFetchClient.mockResolvedValue({
      id: '1',
      text: 'Updated',
      categoryTag: 'news',
      authorUsername: 'alice',
      createdAt: '2026-05-15T12:00:00.000Z',
      isBookmarked: false,
    });

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useUpdateMessageMutation(), {
      wrapper: createWrapper(queryClient),
    });

    result.current.mutate({
      id: '1',
      payload: { text: 'Updated', categoryTag: 'news' },
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: messageKeys.all,
    });
  });
});
