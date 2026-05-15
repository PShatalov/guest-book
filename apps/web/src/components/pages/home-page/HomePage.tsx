import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { CreateMessagePanel } from '@/components/features/create-message/CreateMessagePanel';
import { MessageFeedPanel } from '@/components/features/message-feed/MessageFeedPanel';

import { homePageStyles } from './HomePage.styles';

export const HomePage = () => {
  return (
    <Container component="main" maxWidth="lg" sx={{ py: 4 }}>
      <Stack spacing={3}>
        <Typography component="h1" variant="h4">
          Guest Book
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Share a short message with a category tag for others.
        </Typography>
        <Box data-testid="home-page-layout" sx={homePageStyles.layout}>
          <Box
            data-testid="home-page-compose"
            sx={homePageStyles.composeColumn}
          >
            <CreateMessagePanel />
          </Box>
          <Box data-testid="home-page-feed" sx={homePageStyles.feedColumn}>
            <MessageFeedPanel />
          </Box>
        </Box>
      </Stack>
    </Container>
  );
};
