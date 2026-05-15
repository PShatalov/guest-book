'use client';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useMemo, useState } from 'react';

import { useMessagesInfiniteQuery } from '@/components/shared/messages/useMessagesInfiniteQuery';

import { MessageListItem } from '../MessageListItem';
import { MessageTagFilter } from '../MessageTagFilter';
import { messageFeedPanelStyles } from './MessageFeedPanel.styles';

const EMPTY_MESSAGE = 'No messages yet';
const EMPTY_FILTERED_MESSAGE = 'No messages match this tag';

export const MessageFeedPanel = () => {
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isError,
    isFetchingNextPage,
    isPending,
    isRefetching,
    refetch,
  } = useMessagesInfiniteQuery(activeTag);

  const items = useMemo(
    () => data?.pages.flatMap((page) => page.items) ?? [],
    [data],
  );

  const showInitialLoading = isPending;
  const showEmpty =
    !showInitialLoading && !isError && items.length === 0 && !isRefetching;

  return (
    <Stack spacing={2} sx={messageFeedPanelStyles.root}>
      <MessageTagFilter
        onApply={setActiveTag}
        onClear={() => setActiveTag(null)}
      />
      {isError ? (
        <Alert
          action={
            <Button color="inherit" onClick={() => refetch()} size="small">
              Retry
            </Button>
          }
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
                {activeTag === null ? EMPTY_MESSAGE : EMPTY_FILTERED_MESSAGE}
              </Typography>
            ) : null}
            {items.length > 0 ? (
              <Box sx={messageFeedPanelStyles.list}>
                <List disablePadding>
                  {items.map((message) => (
                    <MessageListItem key={message.id} message={message} />
                  ))}
                </List>
              </Box>
            ) : null}
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
