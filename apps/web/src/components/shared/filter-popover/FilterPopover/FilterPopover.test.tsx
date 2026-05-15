import { fireEvent, render, screen } from '@testing-library/react';

import { AppThemeProvider } from '@/components/shared/app-theme-provider';

import { FilterPopover } from './FilterPopover';

describe('FilterPopover', () => {
  it('renders navigation and footer actions when open', () => {
    const anchor = document.createElement('button');
    document.body.appendChild(anchor);

    render(
      <AppThemeProvider>
        <FilterPopover
          anchorEl={anchor}
          footerPrimary={{ label: 'Apply', onClick: jest.fn() }}
          footerSecondary={{
            label: 'Clear all filters',
            onClick: jest.fn(),
          }}
          isOpen
          onClose={jest.fn()}
          onSelectSection={jest.fn()}
          sections={[
            { id: 'category-tag', label: 'Category tag' },
            { id: 'date-time', label: 'Date & time' },
          ]}
          selectedSectionId="category-tag"
        >
          <div data-testid="filter-popover-content">Editor</div>
        </FilterPopover>
      </AppThemeProvider>,
    );

    expect(screen.getByText('Category tag')).toBeInTheDocument();
    expect(screen.getByText('Date & time')).toBeInTheDocument();
    expect(screen.getByTestId('filter-popover-apply')).toBeInTheDocument();
    expect(screen.getByTestId('filter-popover-clear')).toBeInTheDocument();
    expect(screen.getByTestId('filter-popover-content')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('filter-popover-nav-date-time'));
  });
});
