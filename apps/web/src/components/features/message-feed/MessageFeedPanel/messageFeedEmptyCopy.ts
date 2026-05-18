import type { MessageDateRangeFilter } from '@/lib/messages/messageDateRange';

const EMPTY_MESSAGE = 'No messages yet';
const EMPTY_TAG_MESSAGE = 'No messages match this tag';
const EMPTY_DATE_MESSAGE = 'No messages in this date range';
const EMPTY_USERNAME_MESSAGE = 'No messages from this user';
const EMPTY_BOOKMARKED_MESSAGE = 'No bookmarked messages yet';
const EMPTY_COMBINED_MESSAGE = 'No messages match these filters';

const countActiveFilters = (
  activeTag: string | null,
  activeBookmarkedOnly: boolean,
  activeDateRange: MessageDateRangeFilter | null,
  activeAuthorUsername: string | null,
): number =>
  (activeTag !== null ? 1 : 0) +
  (activeBookmarkedOnly ? 1 : 0) +
  (activeDateRange !== null ? 1 : 0) +
  (activeAuthorUsername !== null ? 1 : 0);

export const getMessageFeedEmptyCopy = (
  activeTag: string | null,
  activeBookmarkedOnly: boolean,
  activeDateRange: MessageDateRangeFilter | null,
  activeAuthorUsername: string | null,
): string => {
  const activeCount = countActiveFilters(
    activeTag,
    activeBookmarkedOnly,
    activeDateRange,
    activeAuthorUsername,
  );

  if (activeCount === 0) {
    return EMPTY_MESSAGE;
  }
  if (activeCount > 1) {
    return EMPTY_COMBINED_MESSAGE;
  }
  if (activeTag !== null) {
    return EMPTY_TAG_MESSAGE;
  }
  if (activeAuthorUsername !== null) {
    return EMPTY_USERNAME_MESSAGE;
  }
  if (activeBookmarkedOnly) {
    return EMPTY_BOOKMARKED_MESSAGE;
  }
  return EMPTY_DATE_MESSAGE;
};
