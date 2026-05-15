import { render, screen } from '@testing-library/react';

import { AppThemeProvider } from './AppThemeProvider';

describe('AppThemeProvider', () => {
  it('renders children without throwing', () => {
    render(
      <AppThemeProvider>
        <span>child</span>
      </AppThemeProvider>,
    );
    expect(screen.getByText('child')).toBeInTheDocument();
  });
});
