import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ReminderItem from '../components/features/ReminderItem';

const mockCompleteReminder = jest.fn().mockResolvedValue(undefined);
const mockDeleteReminder = jest.fn().mockResolvedValue(undefined);
const mockSnoozeReminder = jest.fn().mockResolvedValue(undefined);

jest.mock('../hooks/useReminders', () => ({
  useReminders: () => ({
    completeReminder: mockCompleteReminder,
    deleteReminder: mockDeleteReminder,
    snoozeReminder: mockSnoozeReminder
  })
}));

describe('ReminderItem', () => {
  const mockReminder = {
    id: '123',
    title: 'Test Reminder',
    description: 'Test description',
    dueDate: new Date(Date.now() + 3600000).toISOString(),
    priority: 'medium',
    repeat: 'never',
    completed: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  const onEdit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders reminder title', () => {
    render(<ReminderItem reminder={mockReminder} onEdit={onEdit} />);
    expect(screen.getByText('Test Reminder')).toBeInTheDocument();
  });

  test('clicking complete button calls completeReminder', async () => {
    render(<ReminderItem reminder={mockReminder} onEdit={onEdit} />);
    fireEvent.click(screen.getByTitle('Mark as complete'));
    await waitFor(() => {
      expect(mockCompleteReminder).toHaveBeenCalledWith(mockReminder.id);
    });
  });

  test('clicking delete button calls deleteReminder', async () => {
    render(<ReminderItem reminder={mockReminder} onEdit={onEdit} />);
    fireEvent.click(screen.getByTitle('Delete reminder'));
    await waitFor(() => {
      expect(mockDeleteReminder).toHaveBeenCalledWith(mockReminder.id);
    });
  });

  test('clicking snooze button opens SnoozeSelector', () => {
    render(<ReminderItem reminder={mockReminder} onEdit={onEdit} />);
    fireEvent.click(screen.getByTitle('Snooze reminder'));
    expect(screen.getByText('Snooze Reminder')).toBeInTheDocument();
  });

  test('edit button appears and opens EditReminderFormModal when onEdit provided', () => {
    render(<ReminderItem reminder={mockReminder} onEdit={onEdit} />);
    fireEvent.click(screen.getByTitle('Edit reminder'));
    expect(screen.getByText('Edit Reminder')).toBeInTheDocument();
  });

  test('edit button does nothing when onEdit is not provided', () => {
    render(<ReminderItem reminder={mockReminder} onEdit={null} />);
    expect(screen.queryByTitle('Edit reminder')).not.toBeInTheDocument();
  });
});