'use client';

import type { Dayjs } from 'dayjs';

import { MessageBookmarkedFilterFields } from '../../MessageBookmarkedFilterFields';
import { MessageDateTimeFilterFields } from '../../MessageDateTimeFilterFields';
import { MessageTagFilterFields } from '../../MessageTagFilterFields';
import { MessageUsernameFilterFields } from '../../MessageUsernameFilterFields';
import { MESSAGE_FEED_FILTER_SECTION_IDS } from '../messageFeedFilterDraft';
import type { MessageFeedFilterSectionId } from '../messageFeedFilterDraft';

export type MessageFeedFilterSectionContentProps = {
  bookmarkedOnlyInput: boolean;
  end: Dayjs | null;
  endError: string | null;
  generalError: string | null;
  hasDateValidationError: boolean;
  isSignedIn: boolean;
  onBookmarkedOnlyChange: (value: boolean) => void;
  onDismissDateErrors: () => void;
  onEndBlur: () => void;
  onEndChange: (value: Dayjs | null) => void;
  onStartBlur: () => void;
  onStartChange: (value: Dayjs | null) => void;
  onTagChange: (value: string) => void;
  onUsernameBlur: () => void;
  onUsernameChange: (value: string) => void;
  selectedSectionId: MessageFeedFilterSectionId;
  start: Dayjs | null;
  startError: string | null;
  tagError: string | null;
  tagInput: string;
  usernameError: string | null;
  usernameInput: string;
};

export const MessageFeedFilterSectionContent = ({
  bookmarkedOnlyInput,
  end,
  endError,
  generalError,
  hasDateValidationError,
  isSignedIn,
  onBookmarkedOnlyChange,
  onDismissDateErrors,
  onEndBlur,
  onEndChange,
  onStartBlur,
  onStartChange,
  onTagChange,
  onUsernameBlur,
  onUsernameChange,
  selectedSectionId,
  start,
  startError,
  tagError,
  tagInput,
  usernameError,
  usernameInput,
}: MessageFeedFilterSectionContentProps) => {
  if (selectedSectionId === MESSAGE_FEED_FILTER_SECTION_IDS.categoryTag) {
    return (
      <MessageTagFilterFields
        error={tagError}
        onChange={onTagChange}
        value={tagInput}
      />
    );
  }
  if (selectedSectionId === MESSAGE_FEED_FILTER_SECTION_IDS.authorUsername) {
    return (
      <MessageUsernameFilterFields
        error={usernameError}
        onBlur={onUsernameBlur}
        onChange={onUsernameChange}
        value={usernameInput}
      />
    );
  }
  if (selectedSectionId === MESSAGE_FEED_FILTER_SECTION_IDS.bookmarks) {
    return (
      <MessageBookmarkedFilterFields
        isSignedIn={isSignedIn}
        onChange={onBookmarkedOnlyChange}
        value={bookmarkedOnlyInput}
      />
    );
  }
  return (
    <MessageDateTimeFilterFields
      end={end}
      endError={endError}
      generalError={generalError}
      hasValidationError={hasDateValidationError}
      onDismissErrors={onDismissDateErrors}
      onEndBlur={onEndBlur}
      onEndChange={onEndChange}
      onStartBlur={onStartBlur}
      onStartChange={onStartChange}
      start={start}
      startError={startError}
    />
  );
};
