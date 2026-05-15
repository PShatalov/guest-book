import type { Dayjs } from 'dayjs';
import { useCallback, useState } from 'react';

import type { MessageDateRangeFilter } from '@/lib/messages/messageDateRange';
import { serializeMessageDateRange } from '@/lib/messages/messageDateRange';

import { validateMessageDateRange } from '../validateMessageDateRange';
import {
  dateRangeToPickers,
  MESSAGE_FEED_FILTER_SECTION_IDS,
  type MessageFeedFilterSectionId,
  type MessageFeedFiltersValue,
  resolveTagFromDraft,
  validateTagDraft,
} from './messageFeedFilterDraft';

export {
  MESSAGE_FEED_FILTER_SECTION_IDS,
  type MessageFeedFilterSectionId,
  type MessageFeedFiltersValue,
} from './messageFeedFilterDraft';

type UseMessageFeedFiltersParams = {
  activeDateRange: MessageDateRangeFilter | null;
  activeTag: string | null;
};

export const useMessageFeedFilters = ({
  activeDateRange,
  activeTag,
}: UseMessageFeedFiltersParams) => {
  const [selectedSectionId, setSelectedSectionId] =
    useState<MessageFeedFilterSectionId>(
      MESSAGE_FEED_FILTER_SECTION_IDS.categoryTag,
    );
  const [tagInput, setTagInput] = useState('');
  const [tagError, setTagError] = useState<string | null>(null);
  const [start, setStart] = useState<Dayjs | null>(null);
  const [end, setEnd] = useState<Dayjs | null>(null);
  const [startError, setStartError] = useState<string | null>(null);
  const [endError, setEndError] = useState<string | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);

  const syncDraftsFromActive = useCallback(() => {
    setTagInput(activeTag ?? '');
    setTagError(null);
    const pickers = dateRangeToPickers(activeDateRange);
    setStart(pickers.start);
    setEnd(pickers.end);
    setStartError(null);
    setEndError(null);
    setGeneralError(null);
  }, [activeDateRange, activeTag]);

  const applyDateValidation = useCallback(
    (startDate: Date | null, endDate: Date | null) => {
      if (startDate === null && endDate === null) {
        setStartError(null);
        setEndError(null);
        setGeneralError(null);
        return null;
      }
      const validationErrors = validateMessageDateRange(startDate, endDate);
      if (validationErrors === null) {
        setStartError(null);
        setEndError(null);
        setGeneralError(null);
        return null;
      }
      setStartError(validationErrors.start ?? null);
      setEndError(validationErrors.end ?? null);
      setGeneralError(validationErrors.general ?? null);
      return validationErrors;
    },
    [],
  );

  const handleStartBlur = useCallback(() => {
    applyDateValidation(start?.toDate() ?? null, end?.toDate() ?? null);
  }, [applyDateValidation, end, start]);

  const handleEndBlur = useCallback(() => {
    applyDateValidation(start?.toDate() ?? null, end?.toDate() ?? null);
  }, [applyDateValidation, end, start]);

  const handleStartChange = useCallback((value: Dayjs | null) => {
    setStart(value);
    setStartError(null);
    setGeneralError(null);
  }, []);

  const handleEndChange = useCallback((value: Dayjs | null) => {
    setEnd(value);
    setEndError(null);
    setGeneralError(null);
  }, []);

  const handleDismissDateErrors = useCallback(() => {
    setStartError(null);
    setEndError(null);
    setGeneralError(null);
  }, []);

  const handleTagChange = useCallback((value: string) => {
    setTagInput(value);
    setTagError(null);
  }, []);

  const validateAllDrafts = useCallback((): MessageFeedFiltersValue | null => {
    const nextTagError = validateTagDraft(tagInput);
    setTagError(nextTagError);

    const startDate = start?.toDate() ?? null;
    const endDate = end?.toDate() ?? null;
    const dateErrors = applyDateValidation(startDate, endDate);

    if (nextTagError !== null) {
      setSelectedSectionId(MESSAGE_FEED_FILTER_SECTION_IDS.categoryTag);
      return null;
    }
    if (dateErrors !== null) {
      setSelectedSectionId(MESSAGE_FEED_FILTER_SECTION_IDS.dateTime);
      return null;
    }

    const categoryTag = resolveTagFromDraft(tagInput);
    const hasDateBounds = startDate !== null || endDate !== null;
    const dateRange = hasDateBounds
      ? serializeMessageDateRange(startDate, endDate)
      : null;

    return { categoryTag, dateRange };
  }, [applyDateValidation, end, start, tagInput]);

  const clearDrafts = useCallback(() => {
    setTagInput('');
    setTagError(null);
    setStart(null);
    setEnd(null);
    setStartError(null);
    setEndError(null);
    setGeneralError(null);
  }, []);

  const hasDateValidationError =
    startError !== null || endError !== null || generalError !== null;

  const activeFilterCount =
    (activeTag !== null ? 1 : 0) + (activeDateRange !== null ? 1 : 0);

  return {
    activeFilterCount,
    clearDrafts,
    end,
    endError,
    generalError,
    handleDismissDateErrors,
    handleEndBlur,
    handleEndChange,
    handleStartBlur,
    handleStartChange,
    handleTagChange,
    hasDateValidationError,
    selectedSectionId,
    setSelectedSectionId,
    start,
    startError,
    syncDraftsFromActive,
    tagError,
    tagInput,
    validateAllDrafts,
  };
};
