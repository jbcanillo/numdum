import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SnoozeSelector from '../components/features/SnoozeSelector';

const mockSnoozeReminder = jest.fn().mockResolvedValue(undefined);

jest.mock('../../hooks/useReminders', () => ({
  useReminders: () => ({
    snoozeReminder: mockSnoozeReminder
  })
}));

describe('SnoozeSelector', () => {
  const reminderId = '12345';
  const onDismiss = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders snooze options', () => {
    render(<SnoozeSelector reminderId={reminderId} onDismiss={onDismiss} />);

    expect(screen.getByText('15 minutes')).toBeInTheDocument();
    expect(screen.getByText('30 minutes')).toBeInTheDocument();
    expect(screen.getByText('1 hour')).toBeInTheDocument();
    expect(screen.getByText('2 hours')).toBeInTheDocument();
    expect(screen.getByText('4 hours')).toBeInTheDocument();
    expect(screen.getByText('Until tomorrow')).toBeInTheDocument();
    expect(screen.getByText('Custom minutes...')).toBeInTheDocument();
    expect(screen.getByText('Pick date/time...')).toBeInTheDocument();
  });

  test('shows custom minutes input when custom selected', () => {
    render(<SnoozeSelector reminderId={reminderId} onDismiss={onDismiss} />);

    fireEvent.click(screen.getByText('Custom minutes...'));

    expect(screen.getByLabelText(/Snooze for \(minutes\)/i)).toBeInTheDocument();
    expect(screen.getByText('Snooze')).toBeInTheDocument();
    expect(screen.getByText('Back')).toBeInTheDocument();
  });

  test('shows datetime picker when datetime option selected', () => {
    render(<SnoozeSelector reminderId={reminderId} onDismiss={onDismiss} />);

    fireEvent.click(screen.getByText('Pick date/time...'));

    expect(screen.getByLabelText(/Snooze until/i)).toBeInTheDocument();
    expect(screen.getByText('Set')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  test('calls snoozeReminder and onDismiss when preset option clicked', async () => {
    render(<SnoozeSelector reminderId={reminderId} onDismiss={onDismiss} />);

    fireEvent.click(screen.getByText('15 minutes'));

    await waitFor(() => {
      expect(mockSnoozeReminder).toHaveBeenCalledWith(reminderId, expect.any(String));
    });
    expect(onDismiss).toHaveBeenCalled();
  });

  test('submits custom minutes', async () => {
    render(<SnoozeSelector reminderId={reminderId} onDismiss={onDismiss} />);

    fireEvent.click(screen.getByText('Custom minutes...'));
    const input = screen.getByLabelText(/Snooze for \(minutes\)/i);
    fireEvent.change(input, { target: { value: '45' } });
    fireEvent.click(screen.getByText('Snooze'));

    await waitFor(() => {
      expect(mockSnoozeReminder).toHaveBeenCalledWith(reminderId, expect.any(String));
    });
    expect(onDismiss).toHaveBeenCalled();
  });

  test('submits datetime picker', async () => {
    render(<SnoozeSelector reminderId={reminderId} onDismiss={onDismiss} />);

    fireEvent.click(screen.getByText('Pick date/time...'));
    const input = screen.getByLabelText(/Snooze until/i);
    const dateValue = '2026-03-25T12:00';
    fireEvent.change(input, { target: { value: dateValue } });
    fireEvent.click(screen.getByText('Set'));

    await waitFor(() => {
      expect(mockSnoozeReminder).toHaveBeenCalledWith(reminderId, expect.any(String));
    });
    expect(onDismiss).toHaveBeenCalled();
  });

  test('cancel button in datetime mode dismisses without calling snooze', () => {
    render(<SnoozeSelector reminderId={reminderId} onDismiss={onDismiss} />);

    fireEvent.click(screen.getByText('Pick date/time...'));
    fireEvent.click(screen.getByText('Cancel'));

    expect(onDismiss).toHaveBeenCalled();
    expect(mockSnoozeReminder).not.toHaveBeenCalled();
  });
});