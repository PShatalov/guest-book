import { render, screen } from '@testing-library/react';

import { RootProviders } from '@/components/shared/root-providers';

import { HomePage } from './HomePage';

jest.mock('@/components/features/create-message/CreateMessagePanel', () => ({
  CreateMessagePanel: () => <div data-testid="create-message-panel" />,
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
  });
});
