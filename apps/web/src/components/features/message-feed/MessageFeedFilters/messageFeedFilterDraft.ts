import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';

import type { MessageDateRangeFilter } from '@/lib/messages/messageDateRange';
import { MAX_CATEGORY_TAG_LENGTH } from '@/lib/messages/messageTypes';
import { MAX_USERNAME_LENGTH } from '@/lib/users/usernameTypes';

export const MESSAGE_FEED_FILTER_SECTION_IDS = {
  categoryTag: 'category-tag',
  dateTime: 'date-time',
  authorUsername: 'user-name',
} as const;

export type MessageFeedFilterSectionId =
  (typeof MESSAGE_FEED_FILTER_SECTION_IDS)[keyof typeof MESSAGE_FEED_FILTER_SECTION_IDS];

export type MessageFeedFiltersValue = {
  authorUsername: string | null;
  categoryTag: string | null;
  dateRange: MessageDateRangeFilter | null;
};

const normalizeTag = (value: string): string => value.trim().toLowerCase();

export const dateRangeToPickers = (
  dateRange: MessageDateRangeFilter | null,
): { end: Dayjs | null; start: Dayjs | null } => {
  if (dateRange === null) {
    return { end: null, start: null };
  }
  return {
    end: dateRange.createdTo !== undefined ? dayjs(dateRange.createdTo) : null,
    start:
      dateRange.createdFrom !== undefined ? dayjs(dateRange.createdFrom) : null,
  };
};

export const validateTagDraft = (tagInput: string): string | null => {
  const trimmed = tagInput.trim();
  if (trimmed.length === 0) {
    if (tagInput.length > 0) {
      return 'Category tag is required to filter.';
    }
    return null;
  }
  const normalized = normalizeTag(tagInput);
  if (normalized.length > MAX_CATEGORY_TAG_LENGTH) {
    return `Category tag must be ${MAX_CATEGORY_TAG_LENGTH} characters or fewer.`;
  }
  return null;
};

export const resolveTagFromDraft = (tagInput: string): string | null => {
  const normalized = normalizeTag(tagInput);
  if (normalized.length === 0) {
    return null;
  }
  if (validateTagDraft(tagInput) !== null) {
    return null;
  }
  return normalized;
};

export const validateUsernameDraft = (usernameInput: string): string | null => {
  const trimmed = usernameInput.trim();
  if (trimmed.length === 0) {
    if (usernameInput.length > 0) {
      return 'User name is required to filter.';
    }
    return null;
  }
  if (trimmed.length > MAX_USERNAME_LENGTH) {
    return `User name must be ${MAX_USERNAME_LENGTH} characters or fewer.`;
  }
  return null;
};

export const resolveUsernameFromDraft = (
  usernameInput: string,
): string | null => {
  const trimmed = usernameInput.trim();
  if (trimmed.length === 0) {
    return null;
  }
  if (validateUsernameDraft(usernameInput) !== null) {
    return null;
  }
  return trimmed;
};
