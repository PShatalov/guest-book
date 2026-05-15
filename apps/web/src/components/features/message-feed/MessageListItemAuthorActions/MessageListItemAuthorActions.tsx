'use client';

import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';

import {
  DeleteMessageIcon,
  EditMessageIcon,
} from './MessageListItemAuthorActionsIcons';
import { messageListItemAuthorActionsStyles } from './MessageListItemAuthorActions.styles';

export type MessageListItemAuthorActionsProps = {
  canManage: boolean;
  onDelete: () => void;
  onEdit: () => void;
};

export const MessageListItemAuthorActions = ({
  canManage,
  onDelete,
  onEdit,
}: MessageListItemAuthorActionsProps) => {
  if (!canManage) {
    return null;
  }

  const handleEdit = () => {
    onEdit();
  };

  const handleDelete = () => {
    onDelete();
  };

  return (
    <Stack
      direction="row"
      spacing={0}
      sx={messageListItemAuthorActionsStyles.root}
      useFlexGap
    >
      <IconButton
        aria-label="Edit"
        data-testid="message-edit-button"
        onClick={handleEdit}
        size="small"
        sx={messageListItemAuthorActionsStyles.iconButton}
      >
        <EditMessageIcon />
      </IconButton>
      <IconButton
        aria-label="Delete"
        color="error"
        data-testid="message-delete-button"
        onClick={handleDelete}
        size="small"
        sx={messageListItemAuthorActionsStyles.iconButton}
      >
        <DeleteMessageIcon />
      </IconButton>
    </Stack>
  );
};
