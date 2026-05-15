'use client';

import ListItem from '@mui/material/ListItem';
import Stack from '@mui/material/Stack';
import { useState } from 'react';

import { useDeleteMessageMutation } from '@/components/shared/messages/useDeleteMessageMutation';
import { useUpdateMessageMutation } from '@/components/shared/messages/useUpdateMessageMutation';
import type { Message } from '@/lib/messages/messageTypes';

import { DeleteMessageConfirmDialog } from '../DeleteMessageConfirmDialog';
import { MessageInlineEditForm } from '../MessageInlineEditForm';
import { MessageListItemAuthorActions } from '../MessageListItemAuthorActions';
import { messageListItemStyles } from './MessageListItem.styles';
import { MessageListItemReadContent } from './MessageListItemReadContent/MessageListItemReadContent';
import { mapMessageMutationError } from './mapMessageMutationError';

export type MessageListItemProps = {
  currentUsername?: string | null;
  message: Message;
};

const formatPostedAt = (createdAt: string): string => {
  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) {
    return createdAt;
  }
  return date.toLocaleString();
};

export const MessageListItem = ({
  currentUsername = null,
  message,
}: MessageListItemProps) => {
  const updateMessage = useUpdateMessageMutation();
  const deleteMessage = useDeleteMessageMutation();
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const canManage =
    currentUsername !== null && currentUsername === message.authorUsername;
  const postedAtLabel = formatPostedAt(message.createdAt);

  const handleEdit = () => {
    setEditError(null);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setEditError(null);
    setIsEditing(false);
  };

  const handleSave = (values: { categoryTag: string; text: string }) => {
    setEditError(null);
    updateMessage.mutate(
      {
        id: message.id,
        payload: {
          text: values.text,
          categoryTag: values.categoryTag,
        },
      },
      {
        onSuccess: () => {
          setIsEditing(false);
        },
        onError: (error) => {
          setEditError(mapMessageMutationError(error, 'update'));
        },
      },
    );
  };

  const handleDeleteOpen = () => {
    setDeleteError(null);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteClose = () => {
    if (!deleteMessage.isPending) {
      setDeleteError(null);
      setIsDeleteDialogOpen(false);
    }
  };

  const handleDeleteConfirm = () => {
    setDeleteError(null);
    deleteMessage.mutate(message.id, {
      onSuccess: () => {
        setIsDeleteDialogOpen(false);
      },
      onError: (error) => {
        setDeleteError(mapMessageMutationError(error, 'delete'));
      },
    });
  };

  return (
    <>
      <ListItem
        alignItems="flex-start"
        data-testid="message-list-item"
        sx={messageListItemStyles.root}
      >
        <Stack spacing={0.5} sx={messageListItemStyles.content}>
          {isEditing ? (
            <MessageInlineEditForm
              categoryTag={message.categoryTag}
              errorMessage={editError}
              isSaving={updateMessage.isPending}
              onCancel={handleCancelEdit}
              onDismissError={() => setEditError(null)}
              onSave={handleSave}
              text={message.text}
            />
          ) : (
            <MessageListItemReadContent
              actions={
                <MessageListItemAuthorActions
                  canManage={canManage}
                  onDelete={handleDeleteOpen}
                  onEdit={handleEdit}
                />
              }
              message={message}
              postedAtLabel={postedAtLabel}
            />
          )}
        </Stack>
      </ListItem>
      <DeleteMessageConfirmDialog
        errorMessage={deleteError}
        isDeleting={deleteMessage.isPending}
        isOpen={isDeleteDialogOpen}
        messageText={message.text}
        onClose={handleDeleteClose}
        onConfirm={handleDeleteConfirm}
        onDismissError={() => setDeleteError(null)}
      />
    </>
  );
};
