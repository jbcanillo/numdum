import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../App';

// Mock hooks
jest.mock('../hooks/useReminders', () => ({
  useReminders: () => ({
    reminders: [],
    loading: false,
    error: null,
    createReminder: jest.fn().mockResolvedValue(undefined),
    updateReminder: jest.fn().mockResolvedValue(undefined),
    deleteReminder: jest.fn().mockResolvedValue(undefined),
    completeReminder: jest.fn().mockResolvedValue(undefined)
  }),
  useFilteredReminders: () => [],
  useSortedReminders: () => []
}));

jest.mock('../hooks/useJournal', () => ({
  useJournal: () => ({
    entries: [],
    loading: false,
    error: null,
    addEntry: jest.fn().mockResolvedValue(undefined),
    removeEntry: jest.fn().mockResolvedValue(undefined),
    editEntry: jest.fn().mockResolvedValue(undefined),
    refresh: jest.fn()
  })
}));

// Mock child components to simplify test
jest.mock('../components/ui/CalendarView', () => {
  return function MockCalendarView({ activeDate, onDateChange }) {
    return (
      <div data-testid="calendar-view">
        <button onClick={() => onDateChange(new Date())}>Change Date</button>
        <span data-testid="active-date">{activeDate.toISOString()}</span>
      </div>
    );
  };
});

jest.mock('../components/features/ReminderList', () => {
  return function MockReminderList() {
    return <div data-testid="reminder-list">Reminder List</div>;
  };
});

jest.mock('../components/features/Dashboard', () => {
  return function MockDashboard() {
    return <div data-testid="dashboard">Dashboard</div>;
  };
});

jest.mock('../components/features/AddJournalEntryForm', () => {
  return function MockAddJournalEntryForm({ onDismiss, onSubmit, asPage }) {
    return (
      <div data-testid="add-journal-form" data-aspage={asPage}>
        <button onClick={() => onSubmit({ text: 'test' })}>Submit</button>
        <button onClick={onDismiss}>Cancel</button>
      </div>
    );
  };
});

jest.mock('../components/features/AddReminderForm', () => {
  return function MockAddReminderForm({ onDismiss, onSubmit, asPage }) {
    return (
      <div data-testid="add-reminder-form" data-aspage={asPage}>
        <button onClick={() => onSubmit({ title: 'test' })}>Submit</button>
        <button onClick={onDismiss}>Cancel</button>
      </div>
    );
  };
});

jest.mock('../components/features/EditReminderFormModal', () => {
  return function MockEditReminderFormModal({ reminder, onDismiss, onSubmit }) {
    return (
      <div data-testid="edit-reminder-modal">
        <button onClick={() => onSubmit({})}>Save</button>
        <button onClick={onDismiss}>Cancel</button>
      </div>
    );
  };
});

jest.mock('../components/layout/BottomNavigation', () => {
  return function MockBottomNavigation({ activeTab, onTabChange }) {
    return (
      <div data-testid="bottom-nav">
        <button onClick={() => onTabChange('calendar')}>Calendar</button>
        <button onClick={() => onTabChange('list')}>List</button>
        <button onClick={() => onTabChange('dashboard')}>Dashboard</button>
      </div>
    );
  };
});

describe('App - Navigation and Forms as Pages', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('shows header buttons for Add Journal and Add Reminder', () => {
    render(<App />);
    expect(screen.getByText('Add Journal')).toBeInTheDocument();
    expect(screen.getByText('New Reminder')).toBeInTheDocument();
  });

  test('opens journal form as full page when Add Journal clicked', () => {
    render(<App />);
    fireEvent.click(screen.getByText('Add Journal'));
    const journalForm = screen.getByTestId('add-journal-form');
    expect(journalForm).toHaveAttribute('data-aspage', 'true');
    // Back button should appear
    expect(screen.getByText('Back')).toBeInTheDocument();
    // Bottom nav should be hidden
    expect(screen.queryByTestId('bottom-nav')).not.toBeInTheDocument();
  });

  test('opens reminder form as full page when New Reminder clicked', () => {
    render(<App />);
    fireEvent.click(screen.getByText('New Reminder'));
    const reminderForm = screen.getByTestId('add-reminder-form');
    expect(reminderForm).toHaveAttribute('data-aspage', 'true');
    expect(screen.getByText('Back')).toBeInTheDocument();
    expect(screen.queryByTestId('bottom-nav')).not.toBeInTheDocument();
  });

  test('navigates back from journal form', () => {
    render(<App />);
    fireEvent.click(screen.getByText('Add Journal'));
    expect(screen.getByTestId('add-journal-form')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Back'));
    expect(screen.queryByTestId('add-journal-form')).not.toBeInTheDocument();
    expect(screen.getByTestId('bottom-nav')).toBeInTheDocument();
  });

  test('navigates back from reminder form', () => {
    render(<App />);
    fireEvent.click(screen.getByText('New Reminder'));
    expect(screen.getByTestId('add-reminder-form')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Back'));
    expect(screen.queryByTestId('add-reminder-form')).not.toBeInTheDocument();
    expect(screen.getByTestId('bottom-nav')).toBeInTheDocument();
  });

  test('submits journal form and returns to main view', async () => {
    render(<App />);
    fireEvent.click(screen.getByText('Add Journal'));
    const submitBtn = screen.getByText('Submit');
    fireEvent.click(submitBtn);
    await waitFor(() => {
      expect(screen.queryByTestId('add-journal-form')).not.toBeInTheDocument();
    });
    expect(screen.getByTestId('calendar-view')).toBeInTheDocument();
  });

  test('bottom navigation switches views', () => {
    render(<App />);
    // Default is calendar
    expect(screen.getByTestId('calendar-view')).toBeInTheDocument();
    // Switch to list
    fireEvent.click(screen.getByText('List'));
    expect(screen.getByTestId('reminder-list')).toBeInTheDocument();
    // Switch to dashboard
    fireEvent.click(screen.getByText('Dashboard'));
    expect(screen.getByTestId('dashboard')).toBeInTheDocument();
  });
});
