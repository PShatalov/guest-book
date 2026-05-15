import { fireEvent, render, screen } from '@testing-library/react';

import { AppThemeProvider } from '@/components/shared/app-theme-provider';
import { MAX_CATEGORY_TAG_LENGTH } from '@/lib/messages/messageTypes';

import { MessageTagFilter } from './MessageTagFilter';

const renderMessageTagFilter = (props?: {
  onApply?: (tag: string) => void;
  onClear?: () => void;
}) => {
  const onApply = props?.onApply ?? jest.fn();
  const onClear = props?.onClear ?? jest.fn();
  render(
    <AppThemeProvider>
      <MessageTagFilter onApply={onApply} onClear={onClear} />
    </AppThemeProvider>,
  );
  return { onApply, onClear };
};

describe('MessageTagFilter', () => {
  it('renders without throwing', () => {
    renderMessageTagFilter();
    expect(screen.getByLabelText(/filter by tag/i)).toBeInTheDocument();
  });

  it('shows validation error when apply is submitted with whitespace-only tag', () => {
    renderMessageTagFilter();
    fireEvent.change(screen.getByLabelText(/filter by tag/i), {
      target: { value: '   ' },
    });
    fireEvent.click(screen.getByTestId('message-tag-filter-apply'));
    expect(
      screen.getByText(/category tag is required to filter/i),
    ).toBeInTheDocument();
  });

  it('shows validation error when tag exceeds max length', () => {
    renderMessageTagFilter();
    const longTag = 'a'.repeat(MAX_CATEGORY_TAG_LENGTH + 1);
    fireEvent.change(screen.getByLabelText(/filter by tag/i), {
      target: { value: longTag },
    });
    fireEvent.click(screen.getByTestId('message-tag-filter-apply'));
    expect(
      screen.getByText(
        new RegExp(
          `must be ${MAX_CATEGORY_TAG_LENGTH} characters or fewer`,
          'i',
        ),
      ),
    ).toBeInTheDocument();
  });

  it('calls onApply with trimmed and lowercased tag', () => {
    const { onApply } = renderMessageTagFilter();
    fireEvent.change(screen.getByLabelText(/filter by tag/i), {
      target: { value: '  GENERAL  ' },
    });
    fireEvent.click(screen.getByTestId('message-tag-filter-apply'));
    expect(onApply).toHaveBeenCalledWith('general');
  });

  it('calls onClear and clears the input', () => {
    const { onClear } = renderMessageTagFilter();
    fireEvent.change(screen.getByLabelText(/filter by tag/i), {
      target: { value: 'news' },
    });
    fireEvent.click(screen.getByTestId('message-tag-filter-clear'));
    expect(onClear).toHaveBeenCalled();
    expect(screen.getByLabelText(/filter by tag/i)).toHaveValue('');
  });
});
