import { useCallback, useState } from 'react';

import type { MessageDateRangeFilter } from '@/lib/messages/messageDateRange';

import {
  MESSAGE_FEED_FILTER_SECTION_IDS,
  type MessageFeedFilterSectionId,
  type MessageFeedFiltersValue,
  resolveTagFromDraft,
  validateTagDraft,
} from './messageFeedFilterDraft';
import { useMessageFeedDateDraft } from './useMessageFeedDateDraft';
import { useMessageFeedUsernameDraft } from './useMessageFeedUsernameDraft';

export {
  MESSAGE_FEED_FILTER_SECTION_IDS,
  type MessageFeedFilterSectionId,
  type MessageFeedFiltersValue,
} from './messageFeedFilterDraft';

type UseMessageFeedFiltersParams = {
  activeAuthorUsername: string | null;
  activeBookmarkedOnly: boolean;
  activeDateRange: MessageDateRangeFilter | null;
  activeTag: string | null;
};

export const useMessageFeedFilters = ({
  activeAuthorUsername,
  activeBookmarkedOnly,
  activeDateRange,
  activeTag,
}: UseMessageFeedFiltersParams) => {
  const [selectedSectionId, setSelectedSectionId] =
    useState<MessageFeedFilterSectionId>(
      MESSAGE_FEED_FILTER_SECTION_IDS.categoryTag,
    );
  const [tagInput, setTagInput] = useState('');
  const [tagError, setTagError] = useState<string | null>(null);
  const [bookmarkedOnlyInput, setBookmarkedOnlyInput] = useState(false);

  const usernameDraft = useMessageFeedUsernameDraft(activeAuthorUsername);
  const dateDraft = useMessageFeedDateDraft(activeDateRange);

  const syncDraftsFromActive = useCallback(() => {
    setTagInput(activeTag ?? '');
    setTagError(null);
    setBookmarkedOnlyInput(activeBookmarkedOnly);
    usernameDraft.syncUsernameFromActive();
    dateDraft.syncDateFromActive();
  }, [activeBookmarkedOnly, activeTag, dateDraft, usernameDraft]);

  const handleTagChange = useCallback((value: string) => {
    setTagInput(value);
    setTagError(null);
  }, []);

  const handleBookmarkedOnlyChange = useCallback((value: boolean) => {
    setBookmarkedOnlyInput(value);
  }, []);

  const validateAllDrafts = useCallback((): MessageFeedFiltersValue | null => {
    const nextTagError = validateTagDraft(tagInput);
    setTagError(nextTagError);

    const nextUsernameError = usernameDraft.validateUsernameDraftState();
    const { dateErrors, dateRange } = dateDraft.resolveDateRange();

    if (nextTagError !== null) {
      setSelectedSectionId(MESSAGE_FEED_FILTER_SECTION_IDS.categoryTag);
      return null;
    }
    if (nextUsernameError !== null) {
      setSelectedSectionId(MESSAGE_FEED_FILTER_SECTION_IDS.authorUsername);
      return null;
    }
    if (dateErrors !== null) {
      setSelectedSectionId(MESSAGE_FEED_FILTER_SECTION_IDS.dateTime);
      return null;
    }

    return {
      authorUsername: usernameDraft.resolveUsername(),
      bookmarkedOnly: bookmarkedOnlyInput,
      categoryTag: resolveTagFromDraft(tagInput),
      dateRange,
    };
  }, [bookmarkedOnlyInput, dateDraft, tagInput, usernameDraft]);

  const clearDrafts = useCallback(() => {
    setTagInput('');
    setTagError(null);
    setBookmarkedOnlyInput(false);
    usernameDraft.clearUsernameDraft();
    dateDraft.clearDateDraft();
  }, [dateDraft, usernameDraft]);

  const activeFilterCount =
    (activeTag !== null ? 1 : 0) +
    (activeDateRange !== null ? 1 : 0) +
    (activeAuthorUsername !== null ? 1 : 0) +
    (activeBookmarkedOnly ? 1 : 0);

  return {
    activeFilterCount,
    bookmarkedOnlyInput,
    clearDrafts,
    ...dateDraft,
    handleBookmarkedOnlyChange,
    handleTagChange,
    handleUsernameBlur: usernameDraft.handleUsernameBlur,
    handleUsernameChange: usernameDraft.handleUsernameChange,
    selectedSectionId,
    setSelectedSectionId,
    syncDraftsFromActive,
    tagError,
    tagInput,
    usernameError: usernameDraft.usernameError,
    usernameInput: usernameDraft.usernameInput,
    validateAllDrafts,
  };
};
