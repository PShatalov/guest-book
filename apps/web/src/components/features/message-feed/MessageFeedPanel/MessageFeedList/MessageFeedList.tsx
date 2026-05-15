import Box from '@mui/material/Box';
import List from '@mui/material/List';

import type { Message } from '@/lib/messages/messageTypes';

import { MessageListItem } from '../../MessageListItem';
import { messageFeedPanelStyles } from '../MessageFeedPanel.styles';

export type MessageFeedListProps = {
  items: Message[];
};

export const MessageFeedList = ({ items }: MessageFeedListProps) => {
  return (
    <Box sx={messageFeedPanelStyles.list}>
      <List disablePadding>
        {items.map((message) => (
          <MessageListItem key={message.id} message={message} />
        ))}
      </List>
    </Box>
  );
};
