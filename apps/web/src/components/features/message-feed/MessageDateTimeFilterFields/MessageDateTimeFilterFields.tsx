'use client';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import type { Dayjs } from 'dayjs';

import { messageDateTimeFilterFieldsStyles } from './MessageDateTimeFilterFields.styles';

export type MessageDateTimeFilterFieldsProps = {
  end: Dayjs | null;
  endError: string | null;
  generalError: string | null;
  hasValidationError: boolean;
  onDismissErrors: () => void;
  onEndBlur: () => void;
  onEndChange: (value: Dayjs | null) => void;
  onStartBlur: () => void;
  onStartChange: (value: Dayjs | null) => void;
  start: Dayjs | null;
  startError: string | null;
};

export const MessageDateTimeFilterFields = ({
  end,
  endError,
  generalError,
  hasValidationError,
  onDismissErrors,
  onEndBlur,
  onEndChange,
  onStartBlur,
  onStartChange,
  start,
  startError,
}: MessageDateTimeFilterFieldsProps) => {
  return (
    <Stack spacing={2} sx={messageDateTimeFilterFieldsStyles.root}>
      <Box
        data-testid="message-date-filter-from"
        sx={messageDateTimeFilterFieldsStyles.input}
      >
        <DateTimePicker
          label="From"
          onChange={onStartChange}
          slotProps={{
            textField: {
              error: startError !== null || generalError !== null,
              fullWidth: true,
              helperText: startError ?? generalError ?? undefined,
              onBlur: onStartBlur,
            },
          }}
          value={start}
        />
      </Box>
      <Box
        data-testid="message-date-filter-to"
        sx={messageDateTimeFilterFieldsStyles.input}
      >
        <DateTimePicker
          label="To"
          onChange={onEndChange}
          slotProps={{
            textField: {
              error: endError !== null,
              fullWidth: true,
              helperText: endError ?? undefined,
              onBlur: onEndBlur,
            },
          }}
          value={end}
        />
      </Box>
      {hasValidationError ? (
        <Button
          data-testid="message-date-filter-dismiss-errors"
          onClick={onDismissErrors}
          sx={messageDateTimeFilterFieldsStyles.dismiss}
          type="button"
          variant="text"
        >
          Dismiss
        </Button>
      ) : null}
    </Stack>
  );
};
