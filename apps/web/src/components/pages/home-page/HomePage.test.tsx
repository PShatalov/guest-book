import { render, screen } from '@testing-library/react';

import { RootProviders } from '@/components/shared/root-providers';

import { HomePage } from './HomePage';

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
  });
});
