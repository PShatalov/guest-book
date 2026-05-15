import { dateRangeFilterKey } from '@/lib/messages/messageDateRange';
import type { MessageDateRangeFilter } from '@/lib/messages/messageDateRange';

export type MessageListFilterKey = {
  authorUsername: string | null;
  categoryTag: string | null;
  dateRange: MessageDateRangeFilter | null;
};

export const messageKeys = {
  all: ['messages'] as const,
  lists: () => [...messageKeys.all, 'list'] as const,
  list: ({ authorUsername, categoryTag, dateRange }: MessageListFilterKey) =>
    [
      ...messageKeys.lists(),
      categoryTag ?? 'all',
      dateRangeFilterKey(dateRange),
      authorUsername ?? 'all',
    ] as const,
};
