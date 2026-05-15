import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { AppThemeProvider } from '@/components/shared/app-theme-provider';

import { DeleteMessageConfirmDialog } from './DeleteMessageConfirmDialog';

const renderDeleteDialog = (
  props: Partial<React.ComponentProps<typeof DeleteMessageConfirmDialog>> = {},
) =>
  render(
    <AppThemeProvider>
      <DeleteMessageConfirmDialog
        isOpen
        messageText="Hello guestbook"
        onClose={jest.fn()}
        onConfirm={jest.fn()}
        {...props}
      />
    </AppThemeProvider>,
  );

describe('DeleteMessageConfirmDialog', () => {
  it('renders the confirmation dialog with message snippet', () => {
    renderDeleteDialog();
    expect(screen.getByTestId('message-delete-dialog')).toBeInTheDocument();
    expect(screen.getByText(/hello guestbook/i)).toBeInTheDocument();
  });

  it('calls onConfirm when delete is confirmed', async () => {
    const user = userEvent.setup();
    const onConfirm = jest.fn();
    renderDeleteDialog({ onConfirm });

    await user.click(screen.getByTestId('message-delete-confirm-button'));

    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('shows delete error alert when provided', () => {
    renderDeleteDialog({ errorMessage: 'Could not delete message.' });
    expect(screen.getByText(/could not delete message/i)).toBeInTheDocument();
  });
});
