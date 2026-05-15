'use client';

import Badge from '@mui/material/Badge';
import Button from '@mui/material/Button';
import { useCallback, useId, useState, type MouseEvent } from 'react';

import { FilterPopover } from '@/components/shared/filter-popover/FilterPopover';
import type { MessageDateRangeFilter } from '@/lib/messages/messageDateRange';

import { MessageDateTimeFilterFields } from '../MessageDateTimeFilterFields';
import { MessageTagFilterFields } from '../MessageTagFilterFields';
import { messageFeedFiltersStyles } from './MessageFeedFilters.styles';
import { FilterListIcon } from './FilterListIcon';
import {
  MESSAGE_FEED_FILTER_SECTION_IDS,
  type MessageFeedFiltersValue,
  useMessageFeedFilters,
} from './useMessageFeedFilters';

export type MessageFeedFiltersProps = {
  activeDateRange: MessageDateRangeFilter | null;
  activeTag: string | null;
  onFiltersChange: (filters: MessageFeedFiltersValue) => void;
};

const FILTER_SECTIONS = [
  { id: MESSAGE_FEED_FILTER_SECTION_IDS.categoryTag, label: 'Category tag' },
  { id: MESSAGE_FEED_FILTER_SECTION_IDS.dateTime, label: 'Date & time' },
] as const;

export const MessageFeedFilters = ({
  activeDateRange,
  activeTag,
  onFiltersChange,
}: MessageFeedFiltersProps) => {
  const popoverId = useId();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const isOpen = anchorEl !== null;

  const {
    activeFilterCount,
    clearDrafts,
    end,
    endError,
    generalError,
    handleDismissDateErrors,
    handleEndBlur,
    handleEndChange,
    handleStartBlur,
    handleStartChange,
    handleTagChange,
    hasDateValidationError,
    selectedSectionId,
    setSelectedSectionId,
    start,
    startError,
    syncDraftsFromActive,
    tagError,
    tagInput,
    validateAllDrafts,
  } = useMessageFeedFilters({ activeDateRange, activeTag });

  const handleOpen = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      syncDraftsFromActive();
      setSelectedSectionId(MESSAGE_FEED_FILTER_SECTION_IDS.categoryTag);
      setAnchorEl(event.currentTarget);
    },
    [setSelectedSectionId, syncDraftsFromActive],
  );

  const handleClose = useCallback(() => {
    syncDraftsFromActive();
    setAnchorEl(null);
  }, [syncDraftsFromActive]);

  const handleApply = useCallback(() => {
    const nextFilters = validateAllDrafts();
    if (nextFilters === null) {
      return;
    }
    onFiltersChange(nextFilters);
    setAnchorEl(null);
  }, [onFiltersChange, validateAllDrafts]);

  const handleClearAll = useCallback(() => {
    clearDrafts();
    onFiltersChange({ categoryTag: null, dateRange: null });
    setAnchorEl(null);
  }, [clearDrafts, onFiltersChange]);

  const renderSectionContent = () => {
    if (selectedSectionId === MESSAGE_FEED_FILTER_SECTION_IDS.categoryTag) {
      return (
        <MessageTagFilterFields
          error={tagError}
          onChange={handleTagChange}
          value={tagInput}
        />
      );
    }
    return (
      <MessageDateTimeFilterFields
        end={end}
        endError={endError}
        generalError={generalError}
        hasValidationError={hasDateValidationError}
        onDismissErrors={handleDismissDateErrors}
        onEndBlur={handleEndBlur}
        onEndChange={handleEndChange}
        onStartBlur={handleStartBlur}
        onStartChange={handleStartChange}
        start={start}
        startError={startError}
      />
    );
  };

  return (
    <>
      <Badge
        badgeContent={activeFilterCount}
        color="primary"
        invisible={activeFilterCount === 0}
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
          variant={activeFilterCount > 0 ? 'contained' : 'outlined'}
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
        onSelectSection={(sectionId) =>
          setSelectedSectionId(
            sectionId as (typeof MESSAGE_FEED_FILTER_SECTION_IDS)[keyof typeof MESSAGE_FEED_FILTER_SECTION_IDS],
          )
        }
        primaryTestId="message-feed-filters-apply"
        secondaryTestId="message-feed-filters-clear-all"
        sections={[...FILTER_SECTIONS]}
        selectedSectionId={selectedSectionId}
      >
        {renderSectionContent()}
      </FilterPopover>
    </>
  );
};
