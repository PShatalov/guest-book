import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { AppThemeProvider } from '@/components/shared/app-theme-provider';

import { MessageListItemAuthorActions } from './MessageListItemAuthorActions';

const renderAuthorActions = (
  props: Partial<
    React.ComponentProps<typeof MessageListItemAuthorActions>
  > = {},
) =>
  render(
    <AppThemeProvider>
      <MessageListItemAuthorActions
        canManage={false}
        onDelete={jest.fn()}
        onEdit={jest.fn()}
        {...props}
      />
    </AppThemeProvider>,
  );

describe('MessageListItemAuthorActions', () => {
  it('renders without throwing when management is disabled', () => {
    renderAuthorActions({ canManage: false });
    expect(screen.queryByTestId('message-edit-button')).not.toBeInTheDocument();
  });

  it('shows icon edit and delete controls when the user can manage the message', () => {
    renderAuthorActions({ canManage: true });

    const editButton = screen.getByRole('button', { name: 'Edit' });
    const deleteButton = screen.getByRole('button', { name: 'Delete' });

    expect(editButton).toHaveAttribute('data-testid', 'message-edit-button');
    expect(deleteButton).toHaveAttribute(
      'data-testid',
      'message-delete-button',
    );
    expect(editButton.textContent?.trim()).toBe('');
    expect(deleteButton.textContent?.trim()).toBe('');
  });

  it('does not render visible Edit or Delete text labels on the buttons', () => {
    renderAuthorActions({ canManage: true });

    expect(screen.queryByText('Edit')).not.toBeInTheDocument();
    expect(screen.queryByText('Delete')).not.toBeInTheDocument();
  });

  it('invokes edit and delete callbacks when icon buttons are clicked', async () => {
    const user = userEvent.setup();
    const onEdit = jest.fn();
    const onDelete = jest.fn();
    renderAuthorActions({ canManage: true, onEdit, onDelete });

    await user.click(screen.getByRole('button', { name: 'Edit' }));
    await user.click(screen.getByRole('button', { name: 'Delete' }));

    expect(onEdit).toHaveBeenCalledTimes(1);
    expect(onDelete).toHaveBeenCalledTimes(1);
  });
});
