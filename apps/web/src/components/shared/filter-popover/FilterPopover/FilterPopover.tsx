'use client';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Popover from '@mui/material/Popover';
import Stack from '@mui/material/Stack';
import type { ReactNode } from 'react';

import { filterPopoverStyles } from './FilterPopover.styles';

export type FilterPopoverSection = {
  id: string;
  label: string;
};

export type FilterPopoverProps = {
  anchorEl: HTMLElement | null;
  children: ReactNode;
  footerPrimary: {
    disabled?: boolean;
    label: string;
    onClick: () => void;
  };
  footerSecondary: {
    disabled?: boolean;
    label: string;
    onClick: () => void;
  };
  id?: string;
  isOpen: boolean;
  onClose: () => void;
  onSelectSection: (sectionId: string) => void;
  primaryTestId?: string;
  secondaryTestId?: string;
  sections: FilterPopoverSection[];
  selectedSectionId: string;
};

export const FilterPopover = ({
  anchorEl,
  children,
  footerPrimary,
  footerSecondary,
  id = 'filter-popover',
  isOpen,
  onClose,
  onSelectSection,
  primaryTestId = 'filter-popover-apply',
  secondaryTestId = 'filter-popover-clear',
  sections,
  selectedSectionId,
}: FilterPopoverProps) => {
  return (
    <Popover
      anchorEl={anchorEl}
      anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
      id={isOpen ? id : undefined}
      onClose={onClose}
      open={isOpen}
      slotProps={{ paper: { sx: filterPopoverStyles.paper } }}
      transformOrigin={{ horizontal: 'left', vertical: 'top' }}
    >
      <Box sx={filterPopoverStyles.body}>
        <Stack
          aria-label="Filter types"
          component="nav"
          role="navigation"
          sx={filterPopoverStyles.nav}
        >
          {sections.map((section) => {
            const isSelected = section.id === selectedSectionId;
            return (
              <Button
                aria-current={isSelected ? 'true' : undefined}
                data-testid={`filter-popover-nav-${section.id}`}
                key={section.id}
                onClick={() => onSelectSection(section.id)}
                sx={filterPopoverStyles.navButton(isSelected)}
                variant="text"
              >
                {section.label}
              </Button>
            );
          })}
        </Stack>
        <Box sx={filterPopoverStyles.content}>{children}</Box>
      </Box>
      <Box sx={filterPopoverStyles.footer}>
        <Button
          data-testid={secondaryTestId}
          disabled={footerSecondary.disabled}
          onClick={footerSecondary.onClick}
          variant="outlined"
        >
          {footerSecondary.label}
        </Button>
        <Button
          data-testid={primaryTestId}
          disabled={footerPrimary.disabled}
          onClick={footerPrimary.onClick}
          variant="contained"
        >
          {footerPrimary.label}
        </Button>
      </Box>
    </Popover>
  );
};
