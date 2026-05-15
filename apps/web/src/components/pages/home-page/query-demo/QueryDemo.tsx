'use client';

import Typography from '@mui/material/Typography';

import { useQueryDemo } from './useQueryDemo';

export const QueryDemo = () => {
  const { data, isPending, isError, error } = useQueryDemo();

  if (isPending) {
    return (
      <Typography variant="body2" role="status">
        Loading demo query…
      </Typography>
    );
  }

  if (isError) {
    const message =
      error instanceof Error ? error.message : 'Demo query failed';
    console.error(error);
    return (
      <Typography variant="body2" color="error" role="alert">
        {message}
      </Typography>
    );
  }

  return (
    <Typography variant="body2">
      TanStack Query demo: todo #{data.id} — {data.title}
    </Typography>
  );
};
