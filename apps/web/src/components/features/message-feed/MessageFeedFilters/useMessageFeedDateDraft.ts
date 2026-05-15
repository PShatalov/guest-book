import type { Dayjs } from 'dayjs';
import { useCallback, useState } from 'react';

import type { MessageDateRangeFilter } from '@/lib/messages/messageDateRange';
import { serializeMessageDateRange } from '@/lib/messages/messageDateRange';

import { validateMessageDateRange } from '../validateMessageDateRange';
import { dateRangeToPickers } from './messageFeedFilterDraft';

export const useMessageFeedDateDraft = (
  activeDateRange: MessageDateRangeFilter | null,
) => {
  const [start, setStart] = useState<Dayjs | null>(null);
  const [end, setEnd] = useState<Dayjs | null>(null);
  const [startError, setStartError] = useState<string | null>(null);
  const [endError, setEndError] = useState<string | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);

  const syncDateFromActive = useCallback(() => {
    const pickers = dateRangeToPickers(activeDateRange);
    setStart(pickers.start);
    setEnd(pickers.end);
    setStartError(null);
    setEndError(null);
    setGeneralError(null);
  }, [activeDateRange]);

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

  const clearDateDraft = useCallback(() => {
    setStart(null);
    setEnd(null);
    setStartError(null);
    setEndError(null);
    setGeneralError(null);
  }, []);

  const resolveDateRange = useCallback(() => {
    const startDate = start?.toDate() ?? null;
    const endDate = end?.toDate() ?? null;
    const dateErrors = applyDateValidation(startDate, endDate);
    if (dateErrors !== null) {
      return { dateErrors, dateRange: null };
    }
    const hasDateBounds = startDate !== null || endDate !== null;
    const dateRange = hasDateBounds
      ? serializeMessageDateRange(startDate, endDate)
      : null;
    return { dateErrors: null, dateRange };
  }, [applyDateValidation, end, start]);

  const hasDateValidationError =
    startError !== null || endError !== null || generalError !== null;

  return {
    clearDateDraft,
    end,
    endError,
    generalError,
    handleDismissDateErrors,
    handleEndBlur,
    handleEndChange,
    handleStartBlur,
    handleStartChange,
    hasDateValidationError,
    resolveDateRange,
    start,
    startError,
    syncDateFromActive,
  };
};
