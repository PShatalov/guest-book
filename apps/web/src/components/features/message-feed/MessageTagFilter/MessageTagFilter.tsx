'use client';

import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import { useState, type FormEvent } from 'react';

import { MAX_CATEGORY_TAG_LENGTH } from '@/lib/messages/messageTypes';

import { messageTagFilterStyles } from './MessageTagFilter.styles';

export type MessageTagFilterProps = {
  onApply: (categoryTag: string) => void;
  onClear: () => void;
};

const normalizeTag = (value: string): string => value.trim().toLowerCase();

export const MessageTagFilter = ({
  onApply,
  onClear,
}: MessageTagFilterProps) => {
  const [input, setInput] = useState('');
  const [fieldError, setFieldError] = useState<string | null>(null);

  const handleApply = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalized = normalizeTag(input);
    if (normalized.length === 0) {
      setFieldError('Category tag is required to filter.');
      return;
    }
    if (normalized.length > MAX_CATEGORY_TAG_LENGTH) {
      setFieldError(
        `Category tag must be ${MAX_CATEGORY_TAG_LENGTH} characters or fewer.`,
      );
      return;
    }
    setFieldError(null);
    onApply(normalized);
  };

  const handleClear = () => {
    setInput('');
    setFieldError(null);
    onClear();
  };

  return (
    <Stack
      component="form"
      direction={{ xs: 'column', sm: 'row' }}
      spacing={1}
      sx={messageTagFilterStyles.root}
      onSubmit={handleApply}
    >
      <TextField
        data-testid="message-tag-filter-input"
        error={fieldError !== null}
        helperText={fieldError}
        label="Filter by tag"
        onChange={(event) => setInput(event.target.value)}
        sx={messageTagFilterStyles.input}
        value={input}
      />
      <Stack direction="row" spacing={1} sx={messageTagFilterStyles.actions}>
        <Button
          data-testid="message-tag-filter-apply"
          type="submit"
          variant="contained"
        >
          Apply
        </Button>
        <Button
          data-testid="message-tag-filter-clear"
          onClick={handleClear}
          type="button"
          variant="outlined"
        >
          Clear
        </Button>
      </Stack>
    </Stack>
  );
};
