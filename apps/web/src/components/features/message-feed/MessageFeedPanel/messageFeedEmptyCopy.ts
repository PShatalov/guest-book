import type { MessageDateRangeFilter } from '@/lib/messages/messageDateRange';

const EMPTY_MESSAGE = 'No messages yet';
const EMPTY_TAG_MESSAGE = 'No messages match this tag';
const EMPTY_DATE_MESSAGE = 'No messages in this date range';
const EMPTY_COMBINED_MESSAGE = 'No messages match these filters';

export const getMessageFeedEmptyCopy = (
  activeTag: string | null,
  activeDateRange: MessageDateRangeFilter | null,
): string => {
  const hasTag = activeTag !== null;
  const hasDate = activeDateRange !== null;

  if (!hasTag && !hasDate) {
    return EMPTY_MESSAGE;
  }
  if (hasTag && hasDate) {
    return EMPTY_COMBINED_MESSAGE;
  }
  if (hasTag) {
    return EMPTY_TAG_MESSAGE;
  }
  return EMPTY_DATE_MESSAGE;
};
