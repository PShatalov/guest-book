'use client';

import Autocomplete from '@mui/material/Autocomplete';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import { useState } from 'react';

import { useDebouncedValue } from '@/components/shared/useDebouncedValue';

import { messageUsernameFilterFieldsStyles } from './MessageUsernameFilterFields.styles';
import {
  USERNAME_SUGGEST_DEBOUNCE_MS,
  useUsernameSuggestionsQuery,
} from './useUsernameSuggestionsQuery';

export type MessageUsernameFilterFieldsProps = {
  error: string | null;
  onBlur: () => void;
  onChange: (value: string) => void;
  value: string;
};

export const MessageUsernameFilterFields = ({
  error,
  onBlur,
  onChange,
  value,
}: MessageUsernameFilterFieldsProps) => {
  const [isSuggestionErrorDismissed, setIsSuggestionErrorDismissed] =
    useState(false);
  const debouncedInput = useDebouncedValue(value, USERNAME_SUGGEST_DEBOUNCE_MS);
  const { data, isError, isFetching } =
    useUsernameSuggestionsQuery(debouncedInput);

  const options = data?.items ?? [];
  const suggestionError =
    isError && !isSuggestionErrorDismissed
      ? 'Could not load username suggestions.'
      : null;
  const helperText = error ?? suggestionError ?? undefined;
  const showNoOptions =
    debouncedInput.trim().length >= 1 &&
    !isFetching &&
    !isError &&
    options.length === 0;

  const handleInputBlur = () => {
    onBlur();
  };

  return (
    <Stack spacing={1} sx={messageUsernameFilterFieldsStyles.root}>
      <Autocomplete
        data-testid="message-username-filter-autocomplete"
        freeSolo
        fullWidth
        inputValue={value}
        loading={isFetching}
        noOptionsText={
          showNoOptions ? 'No matching usernames' : 'Type to search'
        }
        onInputChange={(_event, nextValue) => {
          setIsSuggestionErrorDismissed(false);
          onChange(nextValue);
        }}
        options={options}
        renderInput={(params) => (
          <TextField
            {...params}
            error={error !== null || suggestionError !== null}
            helperText={helperText}
            label="Filter by user name"
            onBlur={handleInputBlur}
          />
        )}
        sx={messageUsernameFilterFieldsStyles.autocomplete}
        value={null}
      />
      {suggestionError !== null ? (
        <Button
          onClick={() => setIsSuggestionErrorDismissed(true)}
          size="small"
          sx={messageUsernameFilterFieldsStyles.dismissButton}
        >
          Dismiss
        </Button>
      ) : null}
    </Stack>
  );
};
