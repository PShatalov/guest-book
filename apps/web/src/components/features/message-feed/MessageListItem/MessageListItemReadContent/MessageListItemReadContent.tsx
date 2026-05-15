'use client';

import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { ReactNode } from 'react';

import type { Message } from '@/lib/messages/messageTypes';

import { messageListItemStyles } from '../MessageListItem.styles';

export type MessageListItemReadContentProps = {
  actions?: ReactNode;
  message: Message;
  postedAtLabel: string;
};

export const MessageListItemReadContent = ({
  actions = null,
  message,
  postedAtLabel,
}: MessageListItemReadContentProps) => {
  return (
    <Stack spacing={0.5} sx={messageListItemStyles.readContent}>
      <Typography component="p" variant="body1">
        {message.text}
      </Typography>
      <Stack
        direction="row"
        spacing={1}
        sx={messageListItemStyles.footer}
        useFlexGap
      >
        <Stack
          direction="row"
          spacing={1}
          sx={messageListItemStyles.meta}
          useFlexGap
        >
          <Chip
            component="span"
            label={message.categoryTag}
            size="small"
            variant="outlined"
          />
          <Typography component="span" variant="body2" color="text.secondary">
            {message.authorUsername} · {postedAtLabel}
          </Typography>
        </Stack>
        {actions}
      </Stack>
    </Stack>
  );
};
