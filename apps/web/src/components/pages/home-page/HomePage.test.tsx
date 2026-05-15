import { render, screen } from '@testing-library/react';

import { RootProviders } from '@/components/shared/root-providers';

import { HomePage } from './HomePage';

jest.mock('@/components/features/create-message/CreateMessagePanel', () => ({
  CreateMessagePanel: () => <div data-testid="create-message-panel" />,
}));

jest.mock('@/components/features/message-feed/MessageFeedPanel', () => ({
  MessageFeedPanel: () => <div data-testid="message-feed-panel" />,
}));

describe('HomePage', () => {
  it('renders without throwing', () => {
    render(
      <RootProviders>
        <HomePage />
      </RootProviders>,
    );
    expect(
      screen.getByRole('heading', { name: /guest book/i }),
    ).toBeInTheDocument();
    expect(screen.getByTestId('create-message-panel')).toBeInTheDocument();
    expect(screen.getByTestId('message-feed-panel')).toBeInTheDocument();
  });

  it('renders compose on the left and feed on the right', () => {
    render(
      <RootProviders>
        <HomePage />
      </RootProviders>,
    );
    const layout = screen.getByTestId('home-page-layout');
    const compose = screen.getByTestId('home-page-compose');
    const feed = screen.getByTestId('home-page-feed');
    expect(layout).toContainElement(compose);
    expect(layout).toContainElement(feed);
    expect(
      compose.compareDocumentPosition(feed) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });
});
