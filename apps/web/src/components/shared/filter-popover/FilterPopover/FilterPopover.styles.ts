import type { SxProps, Theme } from '@mui/material/styles';

export const filterPopoverStyles = {
  body: {
    display: 'flex',
    minHeight: 240,
  } satisfies SxProps<Theme>,
  content: {
    flex: 1,
    minWidth: 0,
    p: 2,
  } satisfies SxProps<Theme>,
  footer: {
    borderTop: 1,
    borderColor: 'divider',
    display: 'flex',
    gap: 1,
    justifyContent: 'flex-end',
    p: 1.5,
  } satisfies SxProps<Theme>,
  nav: (theme: Theme) => ({
    borderRight: 1,
    borderColor: 'divider',
    flexShrink: 0,
    width: theme.filterPopover.navWidth,
  }),
  navButton: (isSelected: boolean) =>
    ({
      borderRadius: 0,
      justifyContent: 'flex-start',
      px: 2,
      py: 1.5,
      textAlign: 'left',
      textTransform: 'none',
      width: '100%',
      ...(isSelected
        ? {
            backgroundColor: 'action.selected',
            borderLeft: (theme: Theme) =>
              `${theme.filterPopover.navSelectedBarWidth}px solid`,
            borderLeftColor: 'primary.main',
            fontWeight: 600,
          }
        : {
            borderLeft: (theme: Theme) =>
              `${theme.filterPopover.navSelectedBarWidth}px solid transparent`,
          }),
    }) satisfies SxProps<Theme>,
  paper: (theme: Theme) => ({
    minWidth: theme.filterPopover.minWidth,
  }),
} satisfies Record<
  string,
  SxProps<Theme> | ((...args: never[]) => SxProps<Theme>)
>;
