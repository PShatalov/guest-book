'use client';

import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';

import {
  MAX_CATEGORY_TAG_LENGTH,
  MAX_MESSAGE_TEXT_LENGTH,
} from '@/lib/messages/messageTypes';

import { messageInlineEditFormStyles } from './MessageInlineEditForm.styles';
import { useMessageInlineEditForm } from './useMessageInlineEditForm';

export type MessageInlineEditFormProps = {
  categoryTag: string;
  errorMessage?: string | null;
  isSaving?: boolean;
  onCancel: () => void;
  onDismissError?: () => void;
  onSave: (values: { categoryTag: string; text: string }) => void;
  text: string;
};

export const MessageInlineEditForm = ({
  categoryTag: initialCategoryTag,
  errorMessage = null,
  isSaving = false,
  onCancel,
  onDismissError,
  onSave,
  text: initialText,
}: MessageInlineEditFormProps) => {
  const {
    categoryTag,
    fieldErrors,
    handleCancel,
    handleCategoryTagBlur,
    handleCategoryTagChange,
    handleKeyDown,
    handleSubmit,
    handleTextBlur,
    handleTextChange,
    text,
    textInputRef,
  } = useMessageInlineEditForm({
    initialCategoryTag,
    initialText,
    onCancel,
    onSave,
  });

  return (
    <Stack
      component="form"
      onKeyDown={handleKeyDown}
      onSubmit={handleSubmit}
      spacing={1.5}
      sx={messageInlineEditFormStyles.form}
      noValidate
    >
      {errorMessage !== null ? (
        <Alert onClose={onDismissError} role="alert" severity="error">
          {errorMessage}
        </Alert>
      ) : null}
      <TextField
        error={fieldErrors.text !== undefined}
        helperText={
          fieldErrors.text ??
          `${text.length}/${MAX_MESSAGE_TEXT_LENGTH} characters`
        }
        inputRef={textInputRef}
        label="Message"
        minRows={3}
        multiline
        name="text"
        onBlur={handleTextBlur}
        onChange={(event) => handleTextChange(event.target.value)}
        required
        slotProps={{
          htmlInput: {
            'data-testid': 'message-edit-text-input',
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
        onBlur={handleCategoryTagBlur}
        onChange={(event) => handleCategoryTagChange(event.target.value)}
        required
        slotProps={{
          htmlInput: {
            'data-testid': 'message-edit-tag-input',
            maxLength: MAX_CATEGORY_TAG_LENGTH,
          },
        }}
        value={categoryTag}
      />
      <Stack direction="row" spacing={1} useFlexGap>
        <Button
          data-testid="message-edit-save-button"
          disabled={isSaving}
          type="submit"
          variant="contained"
        >
          {isSaving ? 'Saving…' : 'Save'}
        </Button>
        <Button
          data-testid="message-edit-cancel-button"
          disabled={isSaving}
          onClick={handleCancel}
          type="button"
          variant="outlined"
        >
          Cancel
        </Button>
      </Stack>
    </Stack>
  );
};
