import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ReminderItem from '../components/features/ReminderItem';

describe('ReminderItem - Expanded Details and Checklist', () => {
  const mockReminderWithChecklist = {
    id: '123',
    title: 'Test Reminder',
    description: 'Test description',
    dueDate: new Date(Date.now() + 3600000).toISOString(),
    priority: 'medium',
    repeat: 'never',
    completed: false,
    details: 'Additional details',
    checklist: [
      { id: 1, text: 'Buy milk', completed: false },
      { id: 2, text: 'Buy eggs', completed: true }
    ]
  };

  const onEdit = jest.fn();
  const onComplete = jest.fn();
  const onDelete = jest.fn();
  const onToggleChecklist = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('expands to show details when Show Details clicked', () => {
    render(
      <ReminderItem 
        reminder={mockReminderWithChecklist} 
        onEdit={onEdit} 
        onComplete={onComplete} 
        onDelete={onDelete}
        onToggleChecklist={onToggleChecklist}
      />
    );
    fireEvent.click(screen.getByText('Show Details'));
    expect(screen.getByText('Details')).toBeInTheDocument();
    expect(screen.getByText('Additional details')).toBeInTheDocument();
  });

  test('displays checklist items in expanded view', () => {
    render(
      <ReminderItem 
        reminder={mockReminderWithChecklist} 
        onEdit={onEdit} 
        onComplete={onComplete} 
        onDelete={onDelete}
        onToggleChecklist={onToggleChecklist}
      />
    );
    fireEvent.click(screen.getByText('Show Details'));
    expect(screen.getByText('Buy milk')).toBeInTheDocument();
    expect(screen.getByText('Buy eggs')).toBeInTheDocument();
  });

  test('checkbox for incomplete checklist item is unchecked', () => {
    render(
      <ReminderItem 
        reminder={mockReminderWithChecklist} 
        onEdit={onEdit} 
        onComplete={onComplete} 
        onDelete={onDelete}
        onToggleChecklist={onToggleChecklist}
      />
    );
    fireEvent.click(screen.getByText('Show Details'));
    const checkboxes = screen.getAllByRole('checkbox');
    const unchecked = checkboxes.find(cb => !cb.checked);
    expect(unchecked).toBeDefined();
  });

  test('checkbox for completed checklist item is checked', () => {
    render(
      <ReminderItem 
        reminder={mockReminderWithChecklist} 
        onEdit={onEdit} 
        onComplete={onComplete} 
        onDelete={onDelete}
        onToggleChecklist={onToggleChecklist}
      />
    );
    fireEvent.click(screen.getByText('Show Details'));
    const checkboxes = screen.getAllByRole('checkbox');
    const checked = checkboxes.find(cb => cb.checked);
    expect(checked).toBeDefined();
  });

  test('clicking checklist checkbox calls onToggleChecklist', () => {
    render(
      <ReminderItem 
        reminder={mockReminderWithChecklist} 
        onEdit={onEdit} 
        onComplete={onComplete} 
        onDelete={onDelete}
        onToggleChecklist={onToggleChecklist}
      />
    );
    fireEvent.click(screen.getByText('Show Details'));
    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[0]);
    expect(onToggleChecklist).toHaveBeenCalledWith(mockReminderWithChecklist.id, 1);
  });

  test('compact mode hides edit, delete, and snooze buttons', () => {
    render(
      <ReminderItem 
        reminder={mockReminderWithChecklist} 
        onEdit={onEdit} 
        onComplete={onComplete} 
        onDelete={onDelete}
        onToggleChecklist={onToggleChecklist}
        compact={true}
      />
    );
    // Completion button should still be present
    expect(screen.getByTitle('Mark as complete')).toBeInTheDocument();
    // Edit, delete, snooze should be absent
    expect(screen.queryByTitle('Edit reminder')).not.toBeInTheDocument();
    expect(screen.queryByTitle('Delete reminder')).not.toBeInTheDocument();
    expect(screen.queryByTitle('Snooze reminder')).not.toBeInTheDocument();
  });

  test('non-compact mode shows all buttons', () => {
    render(
      <ReminderItem 
        reminder={mockReminderWithChecklist} 
        onEdit={onEdit} 
        onComplete={onComplete} 
        onDelete={onDelete}
        onToggleChecklist={onToggleChecklist}
        compact={false}
      />
    );
    expect(screen.getByTitle('Mark as complete')).toBeInTheDocument();
    expect(screen.getByTitle('Edit reminder')).toBeInTheDocument();
    expect(screen.getByTitle('Delete reminder')).toBeInTheDocument();
    expect(screen.getByTitle('Snooze reminder')).toBeInTheDocument();
  });
});
