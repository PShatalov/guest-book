import { render, screen } from '@testing-library/react';

import { RootProviders } from './RootProviders';

describe('RootProviders', () => {
  it('renders children without throwing', () => {
    render(
      <RootProviders>
        <span>child</span>
      </RootProviders>,
    );
    expect(screen.getByText('child')).toBeInTheDocument();
  });
});
