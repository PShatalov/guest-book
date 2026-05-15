import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import dayjs from 'dayjs';

import { AppThemeProvider } from '@/components/shared/app-theme-provider';

import { MessageDateTimeFilter } from './MessageDateTimeFilter';

const getPickerInput = (testId: string): HTMLInputElement => {
  const input = screen.getByTestId(testId).querySelector('input');
  if (input === null) {
    throw new Error(`Input for ${testId} not found`);
  }
  return input;
};

const renderMessageDateTimeFilter = (props?: {
  onApply?: jest.Mock<void, [{ createdFrom?: string; createdTo?: string }]>;
  onClear?: jest.Mock<void, []>;
}) => {
  const onApply = props?.onApply ?? jest.fn();
  const onClear = props?.onClear ?? jest.fn();
  render(
    <AppThemeProvider>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <MessageDateTimeFilter onApply={onApply} onClear={onClear} />
      </LocalizationProvider>
    </AppThemeProvider>,
  );
  return { onApply, onClear };
};

describe('MessageDateTimeFilter', () => {
  it('renders without throwing', () => {
    renderMessageDateTimeFilter();
    expect(screen.getByTestId('message-date-filter-from')).toBeInTheDocument();
    expect(screen.getByTestId('message-date-filter-to')).toBeInTheDocument();
  });

  it('exposes accessible labels for From and To pickers', () => {
    renderMessageDateTimeFilter();
    expect(
      screen.getByTestId('message-date-filter-from').querySelector('label'),
    ).toHaveTextContent(/^from$/i);
    expect(
      screen.getByTestId('message-date-filter-to').querySelector('label'),
    ).toHaveTextContent(/^to$/i);
  });

  it('shows validation error when apply is submitted with no bounds', async () => {
    const user = userEvent.setup();
    renderMessageDateTimeFilter();

    await user.click(screen.getByTestId('message-date-filter-apply'));

    expect(
      screen.getByText(/select at least one date or time bound/i),
    ).toBeInTheDocument();
  });

  it('shows validation error when end is before start', async () => {
    const user = userEvent.setup();
    renderMessageDateTimeFilter();

    fireEvent.change(getPickerInput('message-date-filter-from'), {
      target: {
        value: dayjs('2026-05-10T12:00:00').format('MM/DD/YYYY hh:mm A'),
      },
    });
    fireEvent.change(getPickerInput('message-date-filter-to'), {
      target: {
        value: dayjs('2026-05-09T12:00:00').format('MM/DD/YYYY hh:mm A'),
      },
    });
    await user.click(screen.getByTestId('message-date-filter-apply'));

    expect(
      screen.getByText(/end must be on or after start/i),
    ).toBeInTheDocument();
  });

  it('calls onApply with serialized ISO bounds for From only', async () => {
    const user = userEvent.setup();
    const { onApply } = renderMessageDateTimeFilter();
    const start = dayjs('2026-05-01T10:00:00');

    fireEvent.change(getPickerInput('message-date-filter-from'), {
      target: { value: start.format('MM/DD/YYYY hh:mm A') },
    });
    await user.click(screen.getByTestId('message-date-filter-apply'));

    expect(onApply).toHaveBeenCalledWith({
      createdFrom: start.toDate().toISOString(),
    });
    expect(onApply).toHaveBeenCalledTimes(1);
    expect(onApply.mock.calls[0][0]).not.toHaveProperty('createdTo');
  });

  it('calls onApply with createdTo only when To is set', async () => {
    const user = userEvent.setup();
    const { onApply } = renderMessageDateTimeFilter();
    const end = dayjs('2026-05-31T18:00:00');

    fireEvent.change(getPickerInput('message-date-filter-to'), {
      target: { value: end.format('MM/DD/YYYY hh:mm A') },
    });
    await user.click(screen.getByTestId('message-date-filter-apply'));

    expect(onApply).toHaveBeenCalledWith({
      createdTo: end.toDate().toISOString(),
    });
    expect(onApply).toHaveBeenCalledTimes(1);
    expect(onApply.mock.calls[0][0]).not.toHaveProperty('createdFrom');
  });

  it('calls onApply with both ISO bounds when From and To are set', async () => {
    const user = userEvent.setup();
    const { onApply } = renderMessageDateTimeFilter();
    const start = dayjs('2026-05-01T10:00:00');
    const end = dayjs('2026-05-31T18:00:00');

    fireEvent.change(getPickerInput('message-date-filter-from'), {
      target: { value: start.format('MM/DD/YYYY hh:mm A') },
    });
    fireEvent.change(getPickerInput('message-date-filter-to'), {
      target: { value: end.format('MM/DD/YYYY hh:mm A') },
    });
    await user.click(screen.getByTestId('message-date-filter-apply'));

    expect(onApply).toHaveBeenCalledWith({
      createdFrom: start.toDate().toISOString(),
      createdTo: end.toDate().toISOString(),
    });
  });

  it('calls onClear and resets picker inputs', async () => {
    const user = userEvent.setup();
    const { onClear } = renderMessageDateTimeFilter();
    const start = dayjs('2026-05-01T10:00:00');

    fireEvent.change(getPickerInput('message-date-filter-from'), {
      target: { value: start.format('MM/DD/YYYY hh:mm A') },
    });
    await user.click(screen.getByTestId('message-date-filter-clear'));

    expect(onClear).toHaveBeenCalled();
    expect(getPickerInput('message-date-filter-from')).toHaveValue('');
  });
});
