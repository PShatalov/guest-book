export const homePageStyles = {
  layout: {
    display: 'flex',
    flexDirection: { xs: 'column', md: 'row' },
    alignItems: 'flex-start',
    gap: 4,
    width: '100%',
  },
  composeColumn: {
    flex: { md: '0 0 38%' },
    width: '100%',
    minWidth: 0,
  },
  feedColumn: {
    flex: { md: '1 1 62%' },
    width: '100%',
    minWidth: 0,
  },
} as const;
