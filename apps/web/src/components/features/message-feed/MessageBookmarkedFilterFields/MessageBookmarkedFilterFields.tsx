'use client';

import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Typography from '@mui/material/Typography';
import type { ChangeEvent } from 'react';

export type MessageBookmarkedFilterFieldsProps = {
  isSignedIn: boolean;
  onChange: (value: boolean) => void;
  value: boolean;
};

export const MessageBookmarkedFilterFields = ({
  isSignedIn,
  onChange,
  value,
}: MessageBookmarkedFilterFieldsProps) => {
  const handleChange = (
    _event: ChangeEvent<HTMLInputElement>,
    checked: boolean,
  ) => {
    onChange(checked);
  };

  return (
    <>
      <FormControlLabel
        control={
          <Checkbox
            checked={value}
            disabled={!isSignedIn}
            onChange={handleChange}
          />
        }
        label="Show bookmarked messages only"
      />
      {!isSignedIn ? (
        <Typography color="text.secondary" variant="body2">
          Sign in to filter by bookmarks.
        </Typography>
      ) : null}
    </>
  );
};
