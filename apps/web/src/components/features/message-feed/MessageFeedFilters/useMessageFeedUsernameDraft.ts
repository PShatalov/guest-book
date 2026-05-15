import { useCallback, useState } from 'react';

import {
  resolveUsernameFromDraft,
  validateUsernameDraft,
} from './messageFeedFilterDraft';

export const useMessageFeedUsernameDraft = (
  activeAuthorUsername: string | null,
) => {
  const [usernameInput, setUsernameInput] = useState('');
  const [usernameError, setUsernameError] = useState<string | null>(null);

  const syncUsernameFromActive = useCallback(() => {
    setUsernameInput(activeAuthorUsername ?? '');
    setUsernameError(null);
  }, [activeAuthorUsername]);

  const handleUsernameChange = useCallback((value: string) => {
    setUsernameInput(value);
    setUsernameError(null);
  }, []);

  const handleUsernameBlur = useCallback(() => {
    setUsernameError(validateUsernameDraft(usernameInput));
  }, [usernameInput]);

  const validateUsernameDraftState = useCallback((): string | null => {
    const nextUsernameError = validateUsernameDraft(usernameInput);
    setUsernameError(nextUsernameError);
    return nextUsernameError;
  }, [usernameInput]);

  const clearUsernameDraft = useCallback(() => {
    setUsernameInput('');
    setUsernameError(null);
  }, []);

  const resolveUsername = useCallback(
    () => resolveUsernameFromDraft(usernameInput),
    [usernameInput],
  );

  return {
    clearUsernameDraft,
    handleUsernameBlur,
    handleUsernameChange,
    resolveUsername,
    syncUsernameFromActive,
    usernameError,
    usernameInput,
    validateUsernameDraftState,
  };
};
