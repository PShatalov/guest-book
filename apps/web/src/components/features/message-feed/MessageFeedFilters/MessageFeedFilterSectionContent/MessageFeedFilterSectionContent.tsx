'use client';

import type { Dayjs } from 'dayjs';

import { MessageDateTimeFilterFields } from '../../MessageDateTimeFilterFields';
import { MessageTagFilterFields } from '../../MessageTagFilterFields';
import { MessageUsernameFilterFields } from '../../MessageUsernameFilterFields';
import { MESSAGE_FEED_FILTER_SECTION_IDS } from '../messageFeedFilterDraft';
import type { MessageFeedFilterSectionId } from '../messageFeedFilterDraft';

export type MessageFeedFilterSectionContentProps = {
  end: Dayjs | null;
  endError: string | null;
  generalError: string | null;
  hasDateValidationError: boolean;
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
  end,
  endError,
  generalError,
  hasDateValidationError,
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
