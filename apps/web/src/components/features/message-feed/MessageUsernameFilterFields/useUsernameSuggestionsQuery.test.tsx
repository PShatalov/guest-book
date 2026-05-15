import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';

import { apiFetchClient } from '@/lib/api/apiFetchClient';

import { useUsernameSuggestionsQuery } from './useUsernameSuggestionsQuery';

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

describe('useUsernameSuggestionsQuery', () => {
  beforeEach(() => {
    mockApiFetchClient.mockReset();
  });

  it('does not fetch when the debounced query is empty', () => {
    renderHook(() => useUsernameSuggestionsQuery(''), {
      wrapper: createWrapper(),
    });

    expect(mockApiFetchClient).not.toHaveBeenCalled();
  });

  it('fetches suggestions for a non-empty debounced query', async () => {
    mockApiFetchClient.mockResolvedValue({ items: ['alice', 'alicia'] });

    const { result } = renderHook(() => useUsernameSuggestionsQuery('ali'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockApiFetchClient).toHaveBeenCalledWith(
      '/users/username-suggest?q=ali',
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
    expect(result.current.data?.items).toEqual(['alice', 'alicia']);
  });
});
