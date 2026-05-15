export const filterPopoverTokens = {
  minWidth: 560,
  navSelectedBarWidth: 3,
  navWidth: 180,
} as const;

declare module '@mui/material/styles' {
  interface Theme {
    filterPopover: typeof filterPopoverTokens;
  }

  interface ThemeOptions {
    filterPopover?: typeof filterPopoverTokens;
  }
}
