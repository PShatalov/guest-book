'use client';

import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import { useState, type FormEvent } from 'react';

import { useCreateMessageMutation } from '@/components/shared/messages/useCreateMessageMutation';
import { ApiError } from '@/lib/api/apiError';
import {
  MAX_CATEGORY_TAG_LENGTH,
  MAX_MESSAGE_TEXT_LENGTH,
  type Message,
} from '@/lib/messages/messageTypes';

import { createMessageFormStyles } from './CreateMessageForm.styles';
import {
  validateCreateMessageFields,
  type CreateMessageFieldErrors,
} from './validateCreateMessageFields';

export type CreateMessageFormProps = {
  onSuccess?: (message: Message) => void;
};

export const CreateMessageForm = ({ onSuccess }: CreateMessageFormProps) => {
  const createMessage = useCreateMessageMutation();
  const [text, setText] = useState('');
  const [categoryTag, setCategoryTag] = useState('');
  const [fieldErrors, setFieldErrors] = useState<CreateMessageFieldErrors>({});
  const [summaryError, setSummaryError] = useState<string | null>(null);

  const clearErrors = () => {
    setFieldErrors({});
    setSummaryError(null);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    clearErrors();

    const validationErrors = validateCreateMessageFields(text, categoryTag);
    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      return;
    }

    createMessage.mutate(
      { text, categoryTag: categoryTag.trim() },
      {
        onSuccess: (message) => {
          setText('');
          setCategoryTag('');
          onSuccess?.(message);
        },
        onError: (error) => {
          if (!(error instanceof ApiError)) {
            setSummaryError('Something went wrong. Please try again.');
            console.error(error);
            return;
          }

          if (error.status === 401) {
            setSummaryError(
              'Your session has expired. Please sign in again to post a message.',
            );
            return;
          }

          if (error.status === 400) {
            setSummaryError(error.messages.join(' '));
            return;
          }

          setSummaryError('Something went wrong. Please try again.');
          console.error(error);
        },
      },
    );
  };

  return (
    <Stack
      component="form"
      onSubmit={handleSubmit}
      sx={createMessageFormStyles.form}
      noValidate
    >
      {summaryError !== null ? (
        <Alert
          severity="error"
          onClose={() => setSummaryError(null)}
          role="alert"
        >
          {summaryError}
        </Alert>
      ) : null}
      <TextField
        error={fieldErrors.text !== undefined}
        helperText={
          fieldErrors.text ??
          `${text.length}/${MAX_MESSAGE_TEXT_LENGTH} characters`
        }
        label="Message"
        minRows={3}
        multiline
        name="text"
        onChange={(event) => setText(event.target.value)}
        required
        slotProps={{
          htmlInput: {
            'data-testid': 'message-text-input',
            maxLength: MAX_MESSAGE_TEXT_LENGTH,
          },
        }}
        value={text}
      />
      <TextField
        error={fieldErrors.categoryTag !== undefined}
        helperText={fieldErrors.categoryTag ?? undefined}
        label="Category tag"
        name="categoryTag"
        onChange={(event) => setCategoryTag(event.target.value)}
        required
        slotProps={{
          htmlInput: {
            'data-testid': 'category-tag-input',
            maxLength: MAX_CATEGORY_TAG_LENGTH,
          },
        }}
        value={categoryTag}
      />
      <Button
        disabled={createMessage.isPending}
        type="submit"
        variant="contained"
      >
        {createMessage.isPending ? 'Posting…' : 'Post message'}
      </Button>
    </Stack>
  );
};
