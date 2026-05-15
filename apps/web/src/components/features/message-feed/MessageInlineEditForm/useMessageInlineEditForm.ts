import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from 'react';

import {
  validateMessageFields,
  type MessageFieldErrors,
} from '@/lib/messages/validateMessageFields';

export type UseMessageInlineEditFormParams = {
  initialCategoryTag: string;
  initialText: string;
  onCancel: () => void;
  onSave: (values: { categoryTag: string; text: string }) => void;
};

export const useMessageInlineEditForm = ({
  initialCategoryTag,
  initialText,
  onCancel,
  onSave,
}: UseMessageInlineEditFormParams) => {
  const [text, setText] = useState(initialText);
  const [categoryTag, setCategoryTag] = useState(initialCategoryTag);
  const [fieldErrors, setFieldErrors] = useState<MessageFieldErrors>({});
  const textInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    textInputRef.current?.focus();
  }, []);

  const clearFieldError = (field: keyof MessageFieldErrors) => {
    setFieldErrors((current) => {
      if (current[field] === undefined) {
        return current;
      }
      const next = { ...current };
      delete next[field];
      return next;
    });
  };

  const runValidation = (): MessageFieldErrors =>
    validateMessageFields(text, categoryTag);

  const handleTextBlur = () => {
    const errors = runValidation();
    setFieldErrors((current) => ({
      ...current,
      text: errors.text,
    }));
  };

  const handleCategoryTagBlur = () => {
    const errors = runValidation();
    setFieldErrors((current) => ({
      ...current,
      categoryTag: errors.categoryTag,
    }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validationErrors = runValidation();
    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      return;
    }
    onSave({ text, categoryTag: categoryTag.trim() });
  };

  const handleCancel = () => {
    onCancel();
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      onCancel();
    }
  };

  const handleTextChange = (value: string) => {
    setText(value);
    clearFieldError('text');
  };

  const handleCategoryTagChange = (value: string) => {
    setCategoryTag(value);
    clearFieldError('categoryTag');
  };

  return {
    categoryTag,
    fieldErrors,
    handleCancel,
    handleCategoryTagBlur,
    handleCategoryTagChange,
    handleKeyDown,
    handleSubmit,
    handleTextBlur,
    handleTextChange,
    text,
    textInputRef,
  };
};
