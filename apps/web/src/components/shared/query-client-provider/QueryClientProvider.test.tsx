import { render, screen } from '@testing-library/react';

import { QueryClientProvider } from './QueryClientProvider';

describe('QueryClientProvider', () => {
  it('renders children without throwing', () => {
    render(
      <QueryClientProvider>
        <span>child</span>
      </QueryClientProvider>,
    );
    expect(screen.getByText('child')).toBeInTheDocument();
  });
});
