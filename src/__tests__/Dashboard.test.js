import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Dashboard from '../components/features/Dashboard';

// Mock hooks
const mockUseReminders = {
  reminders: [],
  loading: false
};

const mockUseJournal = {
  entries: []
};

const mockUseAnalytics = {
  metrics: { total: 0, completed: 0, pending: 0, completionRate: 0, priorityStats: { high: 0, medium: 0, low: 0 }, overdue: 0, snoozed: 0, onTime: 0, late: 0 },
  trend: [],
  weekdayStats: [],
  hourlyStats: [],
  avgTimeToComplete: null
};

jest.mock('../utils/db', () => ({
  deleteAllReminders: jest.fn(),
  deleteAllJournalEntries: jest.fn(),
  createReminder: jest.fn(),
  createJournalEntry: jest.fn()
}));

jest.mock('../../hooks/useReminders', () => ({
  useReminders: () => mockUseReminders,
  useFilteredReminders: (r) => r,
  useSortedReminders: (r) => r
}));

jest.mock('../../hooks/useJournal', () => ({
  useJournal: () => mockUseJournal
}));

jest.mock('../../hooks/useAnalytics', () => ({
  default: () => mockUseAnalytics
}));

jest.mock('../../utils/backupRestore', () => ({
  downloadBackup: jest.fn(),
  restoreFromFile: jest.fn()
}));

describe('Dashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders backup and restore buttons', () => {
    render(<Dashboard />);
    expect(screen.getByText('Backup Data')).toBeInTheDocument();
    expect(screen.getByText('Restore Data')).toBeInTheDocument();
  });

  test('opens backup dialog when Backup Data clicked', () => {
    render(<Dashboard />);
    fireEvent.click(screen.getByText('Backup Data'));
    expect(screen.getByText('Backup Your Data')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter password')).toBeInTheDocument();
  });

  test('opens restore dialog when Restore Data clicked', () => {
    render(<Dashboard />);
    fireEvent.click(screen.getByText('Restore Data'));
    expect(screen.getByText('Restore from Backup')).toBeInTheDocument();
    expect(screen.getByText('Select your encrypted backup file')).toBeInTheDocument();
  });

  test('backup requires password', async () => {
    render(<Dashboard />);
    fireEvent.click(screen.getByText('Backup Data'));
    fireEvent.click(screen.getByText('Download Backup'));
    await waitFor(() => {
      expect(screen.getByText('Password is required')).toBeInTheDocument();
    });
  });

  test('restore requires file and password', async () => {
    render(<Dashboard />);
    fireEvent.click(screen.getByText('Restore Data'));
    fireEvent.click(screen.getByText('Continue'));
    await waitFor(() => {
      expect(screen.getByText('Please select a backup file')).toBeInTheDocument();
    });
  });

  test('closes dialog on Cancel', () => {
    render(<Dashboard />);
    fireEvent.click(screen.getByText('Backup Data'));
    fireEvent.click(screen.getByText('Cancel'));
    expect(screen.queryByText('Backup Your Data')).not.toBeInTheDocument();
  });

  test('renders metric cards', () => {
    const metrics = { total: 5, completed: 3, pending: 2, completionRate: 60, priorityStats: { high: 1, medium: 2, low: 2 }, overdue: 0, snoozed: 0, onTime: 2, late: 1 };
    mockUseAnalytics.metrics = metrics;
    render(<Dashboard />);
    expect(screen.getByText('Total Reminders')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('Completed')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('Completion Rate')).toBeInTheDocument();
    expect(screen.getByText('60%')).toBeInTheDocument();
  });

  test('shows journal entries count', () => {
    mockUseJournal.entries = [{ id: '1', title: 'Entry' }, { id: '2', title: 'Entry2' }];
    render(<Dashboard />);
    expect(screen.getByText('Journal Entries')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  test('displays average time to complete when available', () => {
    mockUseAnalytics.avgTimeToComplete = 12.5;
    render(<Dashboard />);
    expect(screen.getByText('Average Time to Complete')).toBeInTheDocument();
    expect(screen.getByText('12.5 hours')).toBeInTheDocument();
  });
});
