import {
  MAX_CATEGORY_TAG_LENGTH,
  MAX_MESSAGE_TEXT_LENGTH,
} from '@/lib/messages/messageTypes';

export type MessageFieldErrors = {
  text?: string;
  categoryTag?: string;
};

export const validateMessageFields = (
  text: string,
  categoryTag: string,
): MessageFieldErrors => {
  const errors: MessageFieldErrors = {};

  if (text.length === 0) {
    errors.text = 'Message is required.';
  } else if (text.length > MAX_MESSAGE_TEXT_LENGTH) {
    errors.text = `Message must be ${MAX_MESSAGE_TEXT_LENGTH} characters or fewer.`;
  }

  const trimmedTag = categoryTag.trim();
  if (trimmedTag.length === 0) {
    errors.categoryTag = 'Category tag is required.';
  } else if (trimmedTag.length > MAX_CATEGORY_TAG_LENGTH) {
    errors.categoryTag = `Category tag must be ${MAX_CATEGORY_TAG_LENGTH} characters or fewer.`;
  }

  return errors;
};
