import { renderHook, act } from '@testing-library/react';
import type { FormEvent } from 'react';

import { useMessageInlineEditForm } from './useMessageInlineEditForm';

describe('useMessageInlineEditForm', () => {
  it('returns initial text and category tag values', () => {
    const { result } = renderHook(() =>
      useMessageInlineEditForm({
        initialCategoryTag: 'general',
        initialText: 'Hello',
        onCancel: jest.fn(),
        onSave: jest.fn(),
      }),
    );

    expect(result.current.text).toBe('Hello');
    expect(result.current.categoryTag).toBe('general');
  });

  it('calls onSave with trimmed category tag when submit handler validates', () => {
    const onSave = jest.fn();
    const { result } = renderHook(() =>
      useMessageInlineEditForm({
        initialCategoryTag: '  news  ',
        initialText: 'Hello',
        onCancel: jest.fn(),
        onSave,
      }),
    );

    act(() => {
      result.current.handleSubmit({
        preventDefault: jest.fn(),
      } as unknown as FormEvent<HTMLFormElement>);
    });

    expect(onSave).toHaveBeenCalledWith({
      text: 'Hello',
      categoryTag: 'news',
    });
  });
});
