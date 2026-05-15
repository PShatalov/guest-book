import type { Dayjs } from 'dayjs';
import { useState, type FormEvent } from 'react';

import type { MessageDateRangeFilter } from '@/lib/messages/messageDateRange';
import { serializeMessageDateRange } from '@/lib/messages/messageDateRange';

import { validateMessageDateRange } from '../validateMessageDateRange';

type UseMessageDateTimeFilterParams = {
  onApply: (dateRange: MessageDateRangeFilter) => void;
  onClear: () => void;
};

export const useMessageDateTimeFilter = ({
  onApply,
  onClear,
}: UseMessageDateTimeFilterParams) => {
  const [start, setStart] = useState<Dayjs | null>(null);
  const [end, setEnd] = useState<Dayjs | null>(null);
  const [startError, setStartError] = useState<string | null>(null);
  const [endError, setEndError] = useState<string | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);

  const applyValidationErrors = (
    startDate: Date | null,
    endDate: Date | null,
  ) => {
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
  };

  const handleApply = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const startDate = start?.toDate() ?? null;
    const endDate = end?.toDate() ?? null;
    const validationErrors = applyValidationErrors(startDate, endDate);

    if (validationErrors !== null) {
      return;
    }

    onApply(serializeMessageDateRange(startDate, endDate));
  };

  const handleStartBlur = () => {
    applyValidationErrors(start?.toDate() ?? null, end?.toDate() ?? null);
  };

  const handleEndBlur = () => {
    applyValidationErrors(start?.toDate() ?? null, end?.toDate() ?? null);
  };

  const handleClear = () => {
    setStart(null);
    setEnd(null);
    setStartError(null);
    setEndError(null);
    setGeneralError(null);
    onClear();
  };

  const handleDismissErrors = () => {
    setStartError(null);
    setEndError(null);
    setGeneralError(null);
  };

  const handleStartChange = (value: Dayjs | null) => {
    setStart(value);
    setStartError(null);
    setGeneralError(null);
  };

  const handleEndChange = (value: Dayjs | null) => {
    setEnd(value);
    setEndError(null);
    setGeneralError(null);
  };

  const hasValidationError =
    startError !== null || endError !== null || generalError !== null;

  return {
    end,
    endError,
    generalError,
    handleApply,
    handleClear,
    handleDismissErrors,
    handleEndBlur,
    handleEndChange,
    handleStartBlur,
    handleStartChange,
    hasValidationError,
    start,
    startError,
  };
};
