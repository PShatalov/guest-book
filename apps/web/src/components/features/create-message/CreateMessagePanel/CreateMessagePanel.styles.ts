export const createMessagePanelStyles = {
  compose: {
    maxWidth: 600,
    width: '100%',
  },
  skeleton: {
    borderRadius: 1,
    height: 200,
    maxWidth: 600,
  },
  unauthorized: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    maxWidth: 600,
  },
  actions: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 1,
  },
} as const;
