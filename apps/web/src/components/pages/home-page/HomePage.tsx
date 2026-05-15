import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { QueryDemo } from './query-demo';

export const HomePage = () => {
  return (
    <Container component="main" maxWidth="md" sx={{ py: 4 }}>
      <Stack spacing={2}>
        <Typography component="h1" variant="h4">
          Guest Book
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Frontend foundation — Next.js, Material UI, and TanStack Query are
          configured.
        </Typography>
        <QueryDemo />
      </Stack>
    </Container>
  );
};
