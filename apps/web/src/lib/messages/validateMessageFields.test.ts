import { MAX_MESSAGE_TEXT_LENGTH } from '@/lib/messages/messageTypes';

import { validateMessageFields } from './validateMessageFields';

describe('validateMessageFields', () => {
  it('returns no errors for valid text and category tag', () => {
    expect(validateMessageFields('Hello', 'general')).toEqual({});
  });

  it('returns text error when message is empty', () => {
    expect(validateMessageFields('', 'general').text).toMatch(/required/i);
  });

  it('returns category tag error when tag is whitespace only', () => {
    expect(validateMessageFields('Hello', '   ').categoryTag).toMatch(
      /required/i,
    );
  });

  it('returns text error when message exceeds max length', () => {
    const longText = 'a'.repeat(MAX_MESSAGE_TEXT_LENGTH + 1);
    expect(validateMessageFields(longText, 'general').text).toMatch(/240/);
  });
});
