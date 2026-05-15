import { createTheme } from '@mui/material/styles';

import { filterPopoverTokens } from './filterPopoverTokens';

export const appTheme = createTheme({
  filterPopover: filterPopoverTokens,
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
  },
});
