'use client';

import Chip from '@mui/material/Chip';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import type { Message } from '@/lib/messages/messageTypes';

import { messageListItemStyles } from './MessageListItem.styles';

export type MessageListItemProps = {
  message: Message;
};

const formatPostedAt = (createdAt: string): string => {
  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) {
    return createdAt;
  }
  return date.toLocaleString();
};

export const MessageListItem = ({ message }: MessageListItemProps) => {
  return (
    <ListItem
      alignItems="flex-start"
      data-testid="message-list-item"
      sx={messageListItemStyles.root}
    >
      <ListItemText
        primary={message.text}
        secondary={
          <Stack
            component="span"
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
              {message.authorUsername} · {formatPostedAt(message.createdAt)}
            </Typography>
          </Stack>
        }
      />
    </ListItem>
  );
};
