import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { AppThemeProvider } from '@/components/shared/app-theme-provider';

import { MessageInlineEditForm } from './MessageInlineEditForm';

const renderInlineEditForm = (
  props: Partial<React.ComponentProps<typeof MessageInlineEditForm>> = {},
) =>
  render(
    <AppThemeProvider>
      <MessageInlineEditForm
        categoryTag="general"
        onCancel={jest.fn()}
        onSave={jest.fn()}
        text="Hello guestbook"
        {...props}
      />
    </AppThemeProvider>,
  );

describe('MessageInlineEditForm', () => {
  it('renders pre-filled fields and save/cancel controls', () => {
    renderInlineEditForm();
    expect(screen.getByTestId('message-edit-text-input')).toHaveValue(
      'Hello guestbook',
    );
    expect(screen.getByTestId('message-edit-tag-input')).toHaveValue('general');
    expect(screen.getByTestId('message-edit-save-button')).toBeInTheDocument();
    expect(
      screen.getByTestId('message-edit-cancel-button'),
    ).toBeInTheDocument();
  });

  it('calls onSave with trimmed category tag when validation passes', async () => {
    const user = userEvent.setup();
    const onSave = jest.fn();
    renderInlineEditForm({ onSave });

    await user.clear(screen.getByTestId('message-edit-text-input'));
    await user.type(
      screen.getByTestId('message-edit-text-input'),
      'Updated text',
    );
    await user.clear(screen.getByTestId('message-edit-tag-input'));
    await user.type(screen.getByTestId('message-edit-tag-input'), '  news  ');
    await user.click(screen.getByTestId('message-edit-save-button'));

    expect(onSave).toHaveBeenCalledWith({
      text: 'Updated text',
      categoryTag: 'news',
    });
  });

  it('calls onCancel when cancel is clicked', async () => {
    const user = userEvent.setup();
    const onCancel = jest.fn();
    renderInlineEditForm({ onCancel });

    await user.click(screen.getByTestId('message-edit-cancel-button'));

    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('calls onCancel when Escape is pressed', async () => {
    const user = userEvent.setup();
    const onCancel = jest.fn();
    renderInlineEditForm({ onCancel });

    await user.click(screen.getByTestId('message-edit-text-input'));
    await user.keyboard('{Escape}');

    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('shows validation error when message text is cleared', async () => {
    const user = userEvent.setup();
    const onSave = jest.fn();
    renderInlineEditForm({ onSave });

    await user.clear(screen.getByTestId('message-edit-text-input'));
    await user.click(screen.getByTestId('message-edit-save-button'));

    expect(screen.getByText(/message is required/i)).toBeInTheDocument();
    expect(onSave).not.toHaveBeenCalled();
  });
});
