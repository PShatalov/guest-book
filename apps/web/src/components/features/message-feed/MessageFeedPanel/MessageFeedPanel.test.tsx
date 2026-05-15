import { fireEvent, render, screen } from '@testing-library/react';

import { AppThemeProvider } from '@/components/shared/app-theme-provider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { MessageFeedPanel } from './MessageFeedPanel';

const sampleMessage = {
  id: 'msg-1',
  text: 'Latest post',
  categoryTag: 'general',
  authorUsername: 'alice',
  createdAt: '2026-05-15T12:00:00.000Z',
};

const mockFetchNextPage = jest.fn();
const mockRefetch = jest.fn();

type MockQueryState = {
  data?: {
    pages: Array<{
      items: Array<{
        id: string;
        text: string;
        categoryTag: string;
        authorUsername: string;
        createdAt: string;
      }>;
      hasMore: boolean;
      nextCursor: string | null;
    }>;
  };
  fetchNextPage: typeof mockFetchNextPage;
  hasNextPage: boolean;
  isError: boolean;
  isFetchingNextPage: boolean;
  isPending: boolean;
  isRefetching: boolean;
  refetch: typeof mockRefetch;
};

let mockQueryState: MockQueryState = {
  data: { pages: [{ items: [], hasMore: false, nextCursor: null }] },
  fetchNextPage: mockFetchNextPage,
  hasNextPage: false,
  isError: false,
  isFetchingNextPage: false,
  isPending: false,
  isRefetching: false,
  refetch: mockRefetch,
};

jest.mock('@/components/shared/messages/useMessagesInfiniteQuery', () => ({
  useMessagesInfiniteQuery: () => mockQueryState,
}));

const renderMessageFeedPanel = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <AppThemeProvider>
        <MessageFeedPanel />
      </AppThemeProvider>
    </QueryClientProvider>,
  );
};

describe('MessageFeedPanel', () => {
  beforeEach(() => {
    mockFetchNextPage.mockReset();
    mockRefetch.mockReset();
    mockQueryState = {
      data: { pages: [{ items: [], hasMore: false, nextCursor: null }] },
      fetchNextPage: mockFetchNextPage,
      hasNextPage: false,
      isError: false,
      isFetchingNextPage: false,
      isPending: false,
      isRefetching: false,
      refetch: mockRefetch,
    };
  });

  it('shows loading skeletons while the first page is pending', () => {
    mockQueryState = { ...mockQueryState, isPending: true, data: undefined };
    renderMessageFeedPanel();
    expect(screen.getByTestId('message-feed-loading')).toBeInTheDocument();
    expect(screen.queryByTestId('message-feed-empty')).not.toBeInTheDocument();
  });

  it('shows "No messages yet" when the feed is empty', () => {
    renderMessageFeedPanel();
    expect(screen.getByTestId('message-feed-empty')).toHaveTextContent(
      'No messages yet',
    );
  });

  it('shows filtered empty copy when a tag filter returns no matches', () => {
    renderMessageFeedPanel();
    fireEvent.change(screen.getByLabelText(/filter by tag/i), {
      target: { value: 'news' },
    });
    fireEvent.click(screen.getByTestId('message-tag-filter-apply'));

    expect(screen.getByTestId('message-feed-empty')).toHaveTextContent(
      'No messages match this tag',
    );
  });

  it('renders message rows when items are available', () => {
    mockQueryState = {
      ...mockQueryState,
      data: {
        pages: [{ items: [sampleMessage], hasMore: false, nextCursor: null }],
      },
    };
    renderMessageFeedPanel();
    expect(screen.getByText('Latest post')).toBeInTheDocument();
    expect(screen.queryByTestId('message-feed-empty')).not.toBeInTheDocument();
  });

  it('shows an error alert with retry when the query fails', () => {
    mockQueryState = { ...mockQueryState, isError: true, data: undefined };
    renderMessageFeedPanel();
    expect(
      screen.getByText(/could not load messages/i),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /retry/i }));
    expect(mockRefetch).toHaveBeenCalled();
  });

  it('shows Load more and fetches the next page when more results exist', () => {
    mockQueryState = {
      ...mockQueryState,
      data: {
        pages: [{ items: [sampleMessage], hasMore: true, nextCursor: 'c1' }],
      },
      hasNextPage: true,
    };
    renderMessageFeedPanel();
    fireEvent.click(screen.getByTestId('message-feed-load-more'));
    expect(mockFetchNextPage).toHaveBeenCalled();
  });

  it('disables Load more while the next page is fetching', () => {
    mockQueryState = {
      ...mockQueryState,
      data: {
        pages: [{ items: [sampleMessage], hasMore: true, nextCursor: 'c1' }],
      },
      hasNextPage: true,
      isFetchingNextPage: true,
    };
    renderMessageFeedPanel();
    expect(screen.getByTestId('message-feed-load-more')).toBeDisabled();
    expect(screen.getByTestId('message-feed-load-more')).toHaveTextContent(
      /loading/i,
    );
  });
});
