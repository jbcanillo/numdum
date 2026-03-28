import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ReminderItem from '../components/features/ReminderItem';

const mockCompleteReminder = jest.fn().mockResolvedValue(undefined);
const mockDeleteReminder = jest.fn().mockResolvedValue(undefined);
const mockSnoozeReminder = jest.fn().mockResolvedValue(undefined);

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
  const onComplete = jest.fn();
  const onDelete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders reminder title', () => {
    render(<ReminderItem reminder={mockReminder} onEdit={onEdit} onComplete={onComplete} onDelete={onDelete} />);
    expect(screen.getByText('Test Reminder')).toBeInTheDocument();
  });

  test('clicking complete button calls onComplete prop', async () => {
    render(<ReminderItem reminder={mockReminder} onEdit={onEdit} onComplete={onComplete} onDelete={onDelete} />);
    fireEvent.click(screen.getByTitle('Mark as complete'));
    await waitFor(() => {
      expect(onComplete).toHaveBeenCalledWith(mockReminder.id);
    });
  });

  test('clicking delete button calls onDelete prop', async () => {
    render(<ReminderItem reminder={mockReminder} onEdit={onEdit} onComplete={onComplete} onDelete={onDelete} />);
    fireEvent.click(screen.getByTitle('Delete reminder'));
    await waitFor(() => {
      expect(onDelete).toHaveBeenCalledWith(mockReminder.id);
    });
  });

  test('clicking snooze button opens SnoozeSelector', () => {
    render(<ReminderItem reminder={mockReminder} onEdit={onEdit} onComplete={onComplete} onDelete={onDelete} />);
    fireEvent.click(screen.getByTitle('Snooze reminder'));
    expect(screen.getByText('Snooze Reminder')).toBeInTheDocument();
  });

  test('edit button appears when onEdit provided', () => {
    render(<ReminderItem reminder={mockReminder} onEdit={onEdit} onComplete={onComplete} onDelete={onDelete} />);
    expect(screen.getByTitle('Edit reminder')).toBeInTheDocument();
  });

  test('clicking edit button calls onEdit with reminder', () => {
    render(<ReminderItem reminder={mockReminder} onEdit={onEdit} onComplete={onComplete} onDelete={onDelete} />);
    fireEvent.click(screen.getByTitle('Edit reminder'));
    expect(onEdit).toHaveBeenCalledWith(mockReminder);
  });

  test('edit button does not appear when onEdit is not provided', () => {
    render(<ReminderItem reminder={mockReminder} onEdit={null} onComplete={onComplete} onDelete={onDelete} />);
    expect(screen.queryByTitle('Edit reminder')).not.toBeInTheDocument();
  });

  test('completion button shows X when not completed', () => {
    render(<ReminderItem reminder={mockReminder} onEdit={onEdit} onComplete={onComplete} onDelete={onDelete} />);
    expect(screen.getByTitle('Mark as complete')).toBeInTheDocument();
  });

  test('completion button shows checkmark when completed', () => {
    const completedReminder = { ...mockReminder, completed: true };
    render(<ReminderItem reminder={completedReminder} onEdit={onEdit} onComplete={onComplete} onDelete={onDelete} />);
    expect(screen.getByTitle('Mark as incomplete')).toBeInTheDocument();
  });
});
