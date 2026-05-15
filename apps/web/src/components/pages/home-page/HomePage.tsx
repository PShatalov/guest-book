import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { CreateMessagePanel } from '@/components/features/create-message/CreateMessagePanel';

export const HomePage = () => {
  return (
    <Container component="main" maxWidth="md" sx={{ py: 4 }}>
      <Stack spacing={3}>
        <Typography component="h1" variant="h4">
          Guest Book
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Share a short message with a category tag for others to discover.
        </Typography>
        <CreateMessagePanel />
      </Stack>
    </Container>
  );
};
