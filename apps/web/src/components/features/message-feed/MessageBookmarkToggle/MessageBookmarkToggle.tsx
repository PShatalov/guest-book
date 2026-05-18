'use client';

import Alert from '@mui/material/Alert';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import SvgIcon from '@mui/material/SvgIcon';
import { useState } from 'react';

import { useBookmarkMessageMutation } from '@/components/shared/messages/useBookmarkMessageMutation';

import { messageBookmarkToggleStyles } from './MessageBookmarkToggle.styles';

export type MessageBookmarkToggleProps = {
  isBookmarked: boolean;
  isSignedIn: boolean;
  messageId: string;
};

export const MessageBookmarkToggle = ({
  isBookmarked,
  isSignedIn,
  messageId,
}: MessageBookmarkToggleProps) => {
  const bookmarkMessage = useBookmarkMessageMutation();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const nextBookmarkState = !isBookmarked;
  const label = isBookmarked ? 'Remove bookmark' : 'Bookmark message';

  if (!isSignedIn) {
    return null;
  }

  const handleToggle = () => {
    setErrorMessage(null);
    bookmarkMessage.mutate(
      { id: messageId, shouldBookmark: nextBookmarkState },
      {
        onError: (error) => {
          console.error('Could not update message bookmark.', error);
          setErrorMessage('Could not update bookmark. Please try again.');
        },
      },
    );
  };

  return (
    <Stack direction="row" spacing={1} sx={messageBookmarkToggleStyles.root}>
      <IconButton
        aria-label={label}
        aria-pressed={isBookmarked}
        color={isBookmarked ? 'primary' : 'default'}
        data-testid="message-bookmark-button"
        disabled={bookmarkMessage.isPending}
        onClick={handleToggle}
        size="small"
        sx={messageBookmarkToggleStyles.iconButton}
      >
        <SvgIcon fontSize="small">
          <path d="M6 2h12a1 1 0 0 1 1 1v19l-7-4-7 4V3a1 1 0 0 1 1-1zm1 2v14.55l5-2.86 5 2.86V4H7z" />
        </SvgIcon>
      </IconButton>
      {errorMessage !== null ? (
        <Alert
          onClose={() => setErrorMessage(null)}
          severity="error"
          sx={messageBookmarkToggleStyles.error}
        >
          {errorMessage}
        </Alert>
      ) : null}
    </Stack>
  );
};
