'use client';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Link from 'next/link';
import { useState } from 'react';

import { useAuthSession } from '@/components/shared/auth/useAuthSession';
import { CreateMessageForm } from '../CreateMessageForm';
import { createMessagePanelStyles } from './CreateMessagePanel.styles';

export const CreateMessagePanel = () => {
  const { username, isPending } = useAuthSession();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleMessageCreated = () => {
    setSuccessMessage('Your message was posted successfully.');
  };

  if (isPending) {
    return (
      <Skeleton
        data-testid="create-message-loading"
        sx={createMessagePanelStyles.skeleton}
        variant="rounded"
      />
    );
  }

  if (username === null) {
    return (
      <Stack sx={createMessagePanelStyles.unauthorized}>
        <Typography variant="body1">
          Sign in to post a message to the guestbook.
        </Typography>
        <Box sx={createMessagePanelStyles.actions}>
          <Button component={Link} href="/login" variant="contained">
            Sign in
          </Button>
          <Button component={Link} href="/register" variant="outlined">
            Sign up
          </Button>
        </Box>
      </Stack>
    );
  }

  return (
    <Stack spacing={2}>
      {successMessage !== null ? (
        <Alert
          severity="success"
          onClose={() => setSuccessMessage(null)}
          role="status"
        >
          {successMessage}
        </Alert>
      ) : null}
      <CreateMessageForm onSuccess={handleMessageCreated} />
    </Stack>
  );
};
