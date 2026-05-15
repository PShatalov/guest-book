export const messageFeedPanelStyles = {
  root: {
    width: '100%',
    minWidth: 0,
  },
  feedBody: {
    width: '100%',
  },
  messagesScroll: {
    width: '100%',
    maxHeight: { xs: '50vh', md: 'min(60vh, 32rem)' },
    overflowY: 'auto',
    overflowX: 'hidden',
    minHeight: 0,
  },
  list: {
    width: '100%',
  },
} as const;
