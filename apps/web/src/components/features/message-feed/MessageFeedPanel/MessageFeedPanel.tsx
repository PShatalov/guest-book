'use client';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useMemo, useState } from 'react';

import { useMessagesInfiniteQuery } from '@/components/shared/messages/useMessagesInfiniteQuery';
import type { MessageDateRangeFilter } from '@/lib/messages/messageDateRange';

import { MessageDateTimeFilter } from '../MessageDateTimeFilter';
import { MessageTagFilter } from '../MessageTagFilter';
import { MessageFeedList } from './MessageFeedList/MessageFeedList';
import { messageFeedPanelStyles } from './MessageFeedPanel.styles';
import { getMessageFeedEmptyCopy } from './messageFeedEmptyCopy';

export const MessageFeedPanel = () => {
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [activeDateRange, setActiveDateRange] =
    useState<MessageDateRangeFilter | null>(null);
  const [isErrorDismissed, setIsErrorDismissed] = useState(false);

  const feedFilters = useMemo(
    () => ({ categoryTag: activeTag, dateRange: activeDateRange }),
    [activeTag, activeDateRange],
  );

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isError,
    isFetchingNextPage,
    isPending,
    isRefetching,
    refetch,
  } = useMessagesInfiniteQuery(feedFilters);

  const items = useMemo(
    () => data?.pages.flatMap((page) => page.items) ?? [],
    [data],
  );

  const showInitialLoading = isPending;
  const showEmpty =
    !showInitialLoading && !isError && items.length === 0 && !isRefetching;
  const emptyMessage = getMessageFeedEmptyCopy(activeTag, activeDateRange);
  const showErrorAlert = isError && !isErrorDismissed;

  const handleRetry = () => {
    setIsErrorDismissed(false);
    void refetch();
  };

  return (
    <Stack spacing={2} sx={messageFeedPanelStyles.root}>
      <MessageTagFilter
        onApply={setActiveTag}
        onClear={() => setActiveTag(null)}
      />
      <MessageDateTimeFilter
        onApply={setActiveDateRange}
        onClear={() => setActiveDateRange(null)}
      />
      {showErrorAlert ? (
        <Alert
          action={
            <Button color="inherit" onClick={handleRetry} size="small">
              Retry
            </Button>
          }
          onClose={() => setIsErrorDismissed(true)}
          severity="error"
        >
          Could not load messages. Please try again.
        </Alert>
      ) : null}
      {showInitialLoading ? (
        <Stack spacing={2} sx={messageFeedPanelStyles.feedBody}>
          <Typography component="h2" variant="h5">
            Messages
          </Typography>
          <Box
            data-testid="message-feed-scroll"
            sx={messageFeedPanelStyles.messagesScroll}
          >
            <Stack data-testid="message-feed-loading" spacing={1}>
              <Skeleton height={72} variant="rounded" />
              <Skeleton height={72} variant="rounded" />
              <Skeleton height={72} variant="rounded" />
            </Stack>
          </Box>
        </Stack>
      ) : null}
      {!showInitialLoading ? (
        <Stack spacing={2} sx={messageFeedPanelStyles.feedBody}>
          <Typography component="h2" variant="h5">
            Messages
          </Typography>
          <Box
            data-testid="message-feed-scroll"
            sx={messageFeedPanelStyles.messagesScroll}
          >
            {showEmpty ? (
              <Typography
                color="text.secondary"
                data-testid="message-feed-empty"
                variant="body1"
              >
                {emptyMessage}
              </Typography>
            ) : null}
            {items.length > 0 ? <MessageFeedList items={items} /> : null}
          </Box>
          {hasNextPage ? (
            <Button
              data-testid="message-feed-load-more"
              disabled={isFetchingNextPage}
              onClick={() => fetchNextPage()}
              variant="outlined"
            >
              {isFetchingNextPage ? 'Loading…' : 'Load more'}
            </Button>
          ) : null}
        </Stack>
      ) : null}
    </Stack>
  );
};
