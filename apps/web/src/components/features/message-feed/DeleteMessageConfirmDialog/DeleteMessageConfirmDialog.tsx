'use client';

import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Typography from '@mui/material/Typography';

import { deleteMessageConfirmDialogStyles } from './DeleteMessageConfirmDialog.styles';

const SNIPPET_MAX_LENGTH = 120;

const truncateMessageText = (text: string): string => {
  if (text.length <= SNIPPET_MAX_LENGTH) {
    return text;
  }
  return `${text.slice(0, SNIPPET_MAX_LENGTH)}…`;
};

export type DeleteMessageConfirmDialogProps = {
  errorMessage?: string | null;
  isDeleting?: boolean;
  isOpen: boolean;
  messageText: string;
  onClose: () => void;
  onConfirm: () => void;
  onDismissError?: () => void;
};

export const DeleteMessageConfirmDialog = ({
  errorMessage = null,
  isDeleting = false,
  isOpen,
  messageText,
  onClose,
  onConfirm,
  onDismissError,
}: DeleteMessageConfirmDialogProps) => {
  const handleClose = () => {
    onClose();
  };

  const handleConfirm = () => {
    onConfirm();
  };

  return (
    <Dialog
      data-testid="message-delete-dialog"
      onClose={handleClose}
      open={isOpen}
    >
      <DialogTitle>Delete message?</DialogTitle>
      <DialogContent>
        {errorMessage !== null ? (
          <Alert
            onClose={onDismissError}
            role="alert"
            severity="error"
            sx={{ mb: 2 }}
          >
            {errorMessage}
          </Alert>
        ) : null}
        <Typography variant="body2">
          This action cannot be undone. The following message will be removed:
        </Typography>
        <Typography
          color="text.secondary"
          sx={deleteMessageConfirmDialogStyles.snippet}
          variant="body2"
        >
          {truncateMessageText(messageText)}
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button disabled={isDeleting} onClick={handleClose}>
          Cancel
        </Button>
        <Button
          color="error"
          data-testid="message-delete-confirm-button"
          disabled={isDeleting}
          onClick={handleConfirm}
          variant="contained"
        >
          {isDeleting ? 'Deleting…' : 'Delete'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
