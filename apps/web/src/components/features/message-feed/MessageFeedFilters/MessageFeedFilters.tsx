'use client';

import Badge from '@mui/material/Badge';
import Button from '@mui/material/Button';
import { useCallback, useId, useState, type MouseEvent } from 'react';

import { FilterPopover } from '@/components/shared/filter-popover/FilterPopover';
import type { MessageDateRangeFilter } from '@/lib/messages/messageDateRange';

import { messageFeedFiltersStyles } from './MessageFeedFilters.styles';
import { FilterListIcon } from './FilterListIcon';
import { MessageFeedFilterSectionContent } from './MessageFeedFilterSectionContent/MessageFeedFilterSectionContent';
import {
  MESSAGE_FEED_FILTER_SECTION_IDS,
  type MessageFeedFiltersValue,
  useMessageFeedFilters,
} from './useMessageFeedFilters';

export type MessageFeedFiltersProps = {
  activeAuthorUsername: string | null;
  activeDateRange: MessageDateRangeFilter | null;
  activeTag: string | null;
  onFiltersChange: (filters: MessageFeedFiltersValue) => void;
};

const FILTER_SECTIONS = [
  { id: MESSAGE_FEED_FILTER_SECTION_IDS.categoryTag, label: 'Category tag' },
  { id: MESSAGE_FEED_FILTER_SECTION_IDS.dateTime, label: 'Date & time' },
  { id: MESSAGE_FEED_FILTER_SECTION_IDS.authorUsername, label: 'User name' },
] as const;

const isFilterSectionId = (
  sectionId: string,
): sectionId is (typeof FILTER_SECTIONS)[number]['id'] =>
  FILTER_SECTIONS.some((section) => section.id === sectionId);

export const MessageFeedFilters = ({
  activeAuthorUsername,
  activeDateRange,
  activeTag,
  onFiltersChange,
}: MessageFeedFiltersProps) => {
  const popoverId = useId();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const isOpen = anchorEl !== null;

  const filterState = useMessageFeedFilters({
    activeAuthorUsername,
    activeDateRange,
    activeTag,
  });

  const handleOpen = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      filterState.syncDraftsFromActive();
      filterState.setSelectedSectionId(
        MESSAGE_FEED_FILTER_SECTION_IDS.categoryTag,
      );
      setAnchorEl(event.currentTarget);
    },
    [filterState],
  );

  const handleClose = useCallback(() => {
    filterState.syncDraftsFromActive();
    setAnchorEl(null);
  }, [filterState]);

  const handleApply = useCallback(() => {
    const nextFilters = filterState.validateAllDrafts();
    if (nextFilters === null) {
      return;
    }
    onFiltersChange(nextFilters);
    setAnchorEl(null);
  }, [filterState, onFiltersChange]);

  const handleClearAll = useCallback(() => {
    filterState.clearDrafts();
    onFiltersChange({
      authorUsername: null,
      categoryTag: null,
      dateRange: null,
    });
    setAnchorEl(null);
  }, [filterState, onFiltersChange]);

  return (
    <>
      <Badge
        badgeContent={filterState.activeFilterCount}
        color="primary"
        invisible={filterState.activeFilterCount === 0}
        sx={messageFeedFiltersStyles.badge}
      >
        <Button
          aria-controls={isOpen ? popoverId : undefined}
          aria-expanded={isOpen}
          aria-haspopup="true"
          data-testid="message-feed-filter-trigger"
          onClick={handleOpen}
          startIcon={<FilterListIcon />}
          sx={messageFeedFiltersStyles.trigger}
          variant={filterState.activeFilterCount > 0 ? 'contained' : 'outlined'}
        >
          Filter
        </Button>
      </Badge>
      <FilterPopover
        anchorEl={anchorEl}
        footerPrimary={{ label: 'Apply', onClick: handleApply }}
        footerSecondary={{
          label: 'Clear all filters',
          onClick: handleClearAll,
        }}
        id={popoverId}
        isOpen={isOpen}
        onClose={handleClose}
        onSelectSection={(sectionId) => {
          if (isFilterSectionId(sectionId)) {
            filterState.setSelectedSectionId(sectionId);
          }
        }}
        primaryTestId="message-feed-filters-apply"
        secondaryTestId="message-feed-filters-clear-all"
        sections={[...FILTER_SECTIONS]}
        selectedSectionId={filterState.selectedSectionId}
      >
        <MessageFeedFilterSectionContent
          end={filterState.end}
          endError={filterState.endError}
          generalError={filterState.generalError}
          hasDateValidationError={filterState.hasDateValidationError}
          onDismissDateErrors={filterState.handleDismissDateErrors}
          onEndBlur={filterState.handleEndBlur}
          onEndChange={filterState.handleEndChange}
          onStartBlur={filterState.handleStartBlur}
          onStartChange={filterState.handleStartChange}
          onTagChange={filterState.handleTagChange}
          onUsernameBlur={filterState.handleUsernameBlur}
          onUsernameChange={filterState.handleUsernameChange}
          selectedSectionId={filterState.selectedSectionId}
          start={filterState.start}
          startError={filterState.startError}
          tagError={filterState.tagError}
          tagInput={filterState.tagInput}
          usernameError={filterState.usernameError}
          usernameInput={filterState.usernameInput}
        />
      </FilterPopover>
    </>
  );
};
