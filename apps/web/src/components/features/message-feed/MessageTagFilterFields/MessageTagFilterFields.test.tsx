import { fireEvent, render, screen } from '@testing-library/react';

import { AppThemeProvider } from '@/components/shared/app-theme-provider';
import { MAX_CATEGORY_TAG_LENGTH } from '@/lib/messages/messageTypes';

import { MessageTagFilterFields } from './MessageTagFilterFields';

const renderFields = (props?: {
  error?: string | null;
  onChange?: (value: string) => void;
  value?: string;
}) => {
  const onChange = props?.onChange ?? jest.fn();
  render(
    <AppThemeProvider>
      <MessageTagFilterFields
        error={props?.error ?? null}
        onChange={onChange}
        value={props?.value ?? ''}
      />
    </AppThemeProvider>,
  );
  return { onChange };
};

describe('MessageTagFilterFields', () => {
  it('renders without throwing', () => {
    renderFields();
    expect(screen.getByLabelText(/filter by tag/i)).toBeInTheDocument();
  });

  it('shows an error message when provided', () => {
    renderFields({ error: 'Category tag is required to filter.' });
    expect(
      screen.getByText(/category tag is required to filter/i),
    ).toBeInTheDocument();
  });

  it('calls onChange when the input changes', () => {
    const { onChange } = renderFields();
    fireEvent.change(screen.getByLabelText(/filter by tag/i), {
      target: { value: 'news' },
    });
    expect(onChange).toHaveBeenCalledWith('news');
  });

  it('displays max-length helper when error mentions the limit', () => {
    renderFields({
      error: `Category tag must be ${MAX_CATEGORY_TAG_LENGTH} characters or fewer.`,
    });
    expect(
      screen.getByText(
        new RegExp(
          `must be ${MAX_CATEGORY_TAG_LENGTH} characters or fewer`,
          'i',
        ),
      ),
    ).toBeInTheDocument();
  });
});
