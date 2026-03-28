import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ReminderList from '../components/features/ReminderList';

describe('ReminderList - Search and Filters', () => {
  const mockReminders = [
    {
      id: '1',
      title: 'Buy groceries',
      description: 'Milk, eggs, bread',
      dueDate: new Date().toISOString(),
      priority: 'medium',
      completed: false
    },
    {
      id: '2',
      title: 'Call mom',
      description: 'Wish her happy birthday',
      dueDate: new Date().toISOString(),
      priority: 'high',
      completed: false
    }
  ];

  const mockJournal = [
    {
      id: 'j1',
      text: 'Had a great day today',
      date: new Date().toISOString(),
      mood: '😊'
    }
  ];

  const defaultProps = {
    reminders: mockReminders,
    journalEntries: mockJournal,
    loading: false,
    error: null,
    onEdit: jest.fn(),
    onComplete: jest.fn(),
    onDelete: jest.fn(),
    onToggleChecklist: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders search input', () => {
    render(<ReminderList {...defaultProps} />);
    expect(screen.getByPlaceholderText('Search reminders and journal...')).toBeInTheDocument();
  });

  test('filters by search term in reminder title', () => {
    render(<ReminderList {...defaultProps} />);
    const searchInput = screen.getByPlaceholderText('Search reminders and journal...');
    fireEvent.change(searchInput, { target: { value: 'groceries' } });
    expect(screen.getByText('Buy groceries')).toBeInTheDocument();
    expect(screen.queryByText('Call mom')).not.toBeInTheDocument();
  });

  test('type filter shows only reminders when "reminders" selected', () => {
    render(<ReminderList {...defaultProps} />);
    const typeSelect = screen.getByRole('combobox');
    fireEvent.change(typeSelect, { target: { value: 'reminders' } });
    expect(screen.getByText('Buy groceries')).toBeInTheDocument();
    expect(screen.queryByText('Had a great day today')).not.toBeInTheDocument();
  });

  test('type filter shows only journal when "journal" selected', () => {
    render(<ReminderList {...defaultProps} />);
    const typeSelect = screen.getByRole('combobox');
    fireEvent.change(typeSelect, { target: { value: 'journal' } });
    expect(screen.getByText('Had a great day today')).toBeInTheDocument();
    expect(screen.queryByText('Buy groceries')).not.toBeInTheDocument();
  });

  test('clear filters button appears and resets filters', async () => {
    render(<ReminderList {...defaultProps} />);
    const searchInput = screen.getByPlaceholderText('Search reminders and journal...');
    fireEvent.change(searchInput, { target: { value: 'nonexistent' } });
    // After applying filter, clear button should appear.
    await waitFor(() => {
      expect(screen.getByText('Clear filters')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('Clear filters'));
    // Now all items should be back
    expect(screen.getByText('Buy groceries')).toBeInTheDocument();
    expect(screen.getByText('Call mom')).toBeInTheDocument();
    expect(screen.getByText('Had a great day today')).toBeInTheDocument();
  });
});
