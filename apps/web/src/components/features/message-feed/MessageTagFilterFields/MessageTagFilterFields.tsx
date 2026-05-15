'use client';

import TextField from '@mui/material/TextField';

import { messageTagFilterFieldsStyles } from './MessageTagFilterFields.styles';

export type MessageTagFilterFieldsProps = {
  error: string | null;
  onChange: (value: string) => void;
  value: string;
};

export const MessageTagFilterFields = ({
  error,
  onChange,
  value,
}: MessageTagFilterFieldsProps) => {
  return (
    <TextField
      data-testid="message-tag-filter-input"
      error={error !== null}
      fullWidth
      helperText={error ?? undefined}
      label="Filter by tag"
      onChange={(event) => onChange(event.target.value)}
      sx={messageTagFilterFieldsStyles.input}
      value={value}
    />
  );
};
