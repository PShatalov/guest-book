import type { SxProps, Theme } from '@mui/material/styles';

export const messageDateTimeFilterStyles = {
  actions: {
    flexShrink: 0,
  } satisfies SxProps<Theme>,
  input: {
    flex: 1,
    minWidth: 0,
  } satisfies SxProps<Theme>,
  root: {
    width: '100%',
  } satisfies SxProps<Theme>,
};
