export const createMessagePanelStyles = {
  compose: {
    width: '100%',
  },
  skeleton: {
    borderRadius: 1,
    height: 200,
    width: '100%',
  },
  unauthorized: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    width: '100%',
  },
  actions: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 1,
  },
} as const;
