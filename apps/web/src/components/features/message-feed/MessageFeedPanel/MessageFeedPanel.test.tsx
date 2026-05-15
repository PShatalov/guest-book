import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { fireEvent, render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import dayjs from 'dayjs';

import { AppThemeProvider } from '@/components/shared/app-theme-provider';

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
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <MessageFeedPanel />
        </LocalizationProvider>
      </AppThemeProvider>
    </QueryClientProvider>,
  );
};

const openFilterPopover = () => {
  fireEvent.click(screen.getByTestId('message-feed-filter-trigger'));
};

const applyFilters = () => {
  fireEvent.click(screen.getByTestId('message-feed-filters-apply'));
};

const applyTagFilter = (tag: string) => {
  openFilterPopover();
  fireEvent.change(screen.getByLabelText(/filter by tag/i), {
    target: { value: tag },
  });
  applyFilters();
};

const applyUsernameFilter = (username: string) => {
  openFilterPopover();
  fireEvent.click(screen.getByTestId('filter-popover-nav-user-name'));
  const input = screen.getByLabelText(/filter by user name/i);
  fireEvent.change(input, { target: { value: username } });
  applyFilters();
};

const applyDateFilterFrom = (value: string) => {
  openFilterPopover();
  fireEvent.click(screen.getByTestId('filter-popover-nav-date-time'));
  const fromInput = screen
    .getByTestId('message-date-filter-from')
    .querySelector('input');
  if (fromInput === null) {
    throw new Error('From date input not found');
  }
  fireEvent.change(fromInput, { target: { value } });
  applyFilters();
};

const clearDateFilterDraft = () => {
  openFilterPopover();
  fireEvent.click(screen.getByTestId('filter-popover-nav-date-time'));
  const fromInput = screen
    .getByTestId('message-date-filter-from')
    .querySelector('input');
  const toInput = screen
    .getByTestId('message-date-filter-to')
    .querySelector('input');
  if (fromInput === null || toInput === null) {
    throw new Error('Date inputs not found');
  }
  fireEvent.change(fromInput, { target: { value: '' } });
  fireEvent.change(toInput, { target: { value: '' } });
  applyFilters();
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
    applyTagFilter('news');

    expect(screen.getByTestId('message-feed-empty')).toHaveTextContent(
      'No messages match this tag',
    );
  });

  it('shows date-only empty copy when a date filter returns no matches', () => {
    renderMessageFeedPanel();
    applyDateFilterFrom(
      dayjs('2026-05-01T10:00:00').format('MM/DD/YYYY hh:mm A'),
    );

    expect(screen.getByTestId('message-feed-empty')).toHaveTextContent(
      'No messages in this date range',
    );
  });

  it('shows username-only empty copy when a username filter returns no matches', () => {
    renderMessageFeedPanel();
    applyUsernameFilter('alice');

    expect(screen.getByTestId('message-feed-empty')).toHaveTextContent(
      'No messages from this user',
    );
  });

  it('shows combined empty copy when tag and date filters return no matches', () => {
    renderMessageFeedPanel();
    applyTagFilter('news');
    applyDateFilterFrom(
      dayjs('2026-05-01T10:00:00').format('MM/DD/YYYY hh:mm A'),
    );

    expect(screen.getByTestId('message-feed-empty')).toHaveTextContent(
      'No messages match these filters',
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
    expect(screen.getByText(/could not load messages/i)).toBeInTheDocument();
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

  it('keeps tag filter active when the date filter is cleared', () => {
    renderMessageFeedPanel();
    applyTagFilter('news');
    applyDateFilterFrom(
      dayjs('2026-05-01T10:00:00').format('MM/DD/YYYY hh:mm A'),
    );
    clearDateFilterDraft();

    expect(screen.getByTestId('message-feed-empty')).toHaveTextContent(
      'No messages match this tag',
    );
    openFilterPopover();
    fireEvent.click(screen.getByTestId('filter-popover-nav-category-tag'));
    expect(screen.getByLabelText(/filter by tag/i)).toHaveValue('news');
  });

  it('keeps date filter active when the tag filter is cleared', () => {
    renderMessageFeedPanel();
    applyDateFilterFrom(
      dayjs('2026-05-01T10:00:00').format('MM/DD/YYYY hh:mm A'),
    );
    openFilterPopover();
    fireEvent.click(screen.getByTestId('filter-popover-nav-category-tag'));
    fireEvent.change(screen.getByLabelText(/filter by tag/i), {
      target: { value: '' },
    });
    applyFilters();

    expect(screen.getByTestId('message-feed-empty')).toHaveTextContent(
      'No messages in this date range',
    );
    openFilterPopover();
    fireEvent.click(screen.getByTestId('filter-popover-nav-date-time'));
    expect(
      screen.getByTestId('message-date-filter-from').querySelector('input'),
    ).not.toHaveValue('');
  });

  it('clears all filters from the popover footer', () => {
    renderMessageFeedPanel();
    applyTagFilter('news');
    applyUsernameFilter('alice');
    applyDateFilterFrom(
      dayjs('2026-05-01T10:00:00').format('MM/DD/YYYY hh:mm A'),
    );

    openFilterPopover();
    fireEvent.click(screen.getByTestId('message-feed-filters-clear-all'));

    expect(screen.getByTestId('message-feed-empty')).toHaveTextContent(
      'No messages yet',
    );
    expect(screen.getByTestId('message-feed-filter-trigger')).toHaveAttribute(
      'class',
      expect.stringContaining('outlined'),
    );
  });

  it('hides empty state while a refetch is in progress', () => {
    mockQueryState = {
      ...mockQueryState,
      isRefetching: true,
    };
    renderMessageFeedPanel();
    expect(screen.queryByTestId('message-feed-empty')).not.toBeInTheDocument();
  });
});
