'use client';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';

import type { MessageDateRangeFilter } from '@/lib/messages/messageDateRange';

import { messageDateTimeFilterStyles } from './MessageDateTimeFilter.styles';
import { useMessageDateTimeFilter } from './useMessageDateTimeFilter';

export type MessageDateTimeFilterProps = {
  onApply: (dateRange: MessageDateRangeFilter) => void;
  onClear: () => void;
};

export const MessageDateTimeFilter = ({
  onApply,
  onClear,
}: MessageDateTimeFilterProps) => {
  const {
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
  } = useMessageDateTimeFilter({ onApply, onClear });

  return (
    <Stack
      component="form"
      direction={{ xs: 'column', sm: 'row' }}
      spacing={1}
      sx={messageDateTimeFilterStyles.root}
      onSubmit={handleApply}
    >
      <Box
        data-testid="message-date-filter-from"
        sx={messageDateTimeFilterStyles.input}
      >
        <DateTimePicker
          label="From"
          onChange={handleStartChange}
          slotProps={{
            textField: {
              error: startError !== null || generalError !== null,
              fullWidth: true,
              helperText: startError ?? generalError ?? undefined,
              onBlur: handleStartBlur,
            },
          }}
          value={start}
        />
      </Box>
      <Box
        data-testid="message-date-filter-to"
        sx={messageDateTimeFilterStyles.input}
      >
        <DateTimePicker
          label="To"
          onChange={handleEndChange}
          slotProps={{
            textField: {
              error: endError !== null,
              fullWidth: true,
              helperText: endError ?? undefined,
              onBlur: handleEndBlur,
            },
          }}
          value={end}
        />
      </Box>
      <Stack
        direction="row"
        spacing={1}
        sx={messageDateTimeFilterStyles.actions}
      >
        <Button
          data-testid="message-date-filter-apply"
          type="submit"
          variant="contained"
        >
          Apply
        </Button>
        <Button
          data-testid="message-date-filter-clear"
          onClick={handleClear}
          type="button"
          variant="outlined"
        >
          Clear
        </Button>
        {hasValidationError ? (
          <Button
            data-testid="message-date-filter-dismiss-errors"
            onClick={handleDismissErrors}
            type="button"
            variant="text"
          >
            Dismiss
          </Button>
        ) : null}
      </Stack>
    </Stack>
  );
};
