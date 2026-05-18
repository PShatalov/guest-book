'use client';

import Stack from '@mui/material/Stack';

import { MessageBookmarkToggle } from '../MessageBookmarkToggle';
import { MessageListItemAuthorActions } from '../MessageListItemAuthorActions';
import { messageListItemActionsStyles } from './MessageListItemActions.styles';

export type MessageListItemActionsProps = {
  canManage: boolean;
  isBookmarked: boolean;
  isSignedIn: boolean;
  messageId: string;
  onDelete: () => void;
  onEdit: () => void;
};

export const MessageListItemActions = ({
  canManage,
  isBookmarked,
  isSignedIn,
  messageId,
  onDelete,
  onEdit,
}: MessageListItemActionsProps) => (
  <Stack direction="row" spacing={0} sx={messageListItemActionsStyles.root}>
    <MessageBookmarkToggle
      isBookmarked={isBookmarked}
      isSignedIn={isSignedIn}
      messageId={messageId}
    />
    <MessageListItemAuthorActions
      canManage={canManage}
      onDelete={onDelete}
      onEdit={onEdit}
    />
  </Stack>
);
