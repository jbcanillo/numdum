import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Stat from '../components/features/Stat';

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

const mockOnOpenBackup = jest.fn();
const mockOnOpenRestore = jest.fn();

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

describe('Stat', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders backup and restore buttons', () => {
    render(<Stat onOpenBackup={mockOnOpenBackup} onOpenRestore={mockOnOpenRestore} />);
    expect(screen.getByText('Backup')).toBeInTheDocument();
    expect(screen.getByText('Restore')).toBeInTheDocument();
  });

  test('calls onOpenBackup when Backup button clicked', () => {
    render(<Stat onOpenBackup={mockOnOpenBackup} onOpenRestore={mockOnOpenRestore} />);
    fireEvent.click(screen.getByText('Backup'));
    expect(mockOnOpenBackup).toHaveBeenCalledTimes(1);
  });

  test('calls onOpenRestore when Restore button clicked', () => {
    render(<Stat onOpenBackup={mockOnOpenBackup} onOpenRestore={mockOnOpenRestore} />);
    fireEvent.click(screen.getByText('Restore'));
    expect(mockOnOpenRestore).toHaveBeenCalledTimes(1);
  });

  test('renders metric cards', () => {
    const metrics = { total: 5, completed: 3, pending: 2, completionRate: 60, priorityStats: { high: 1, medium: 2, low: 2 }, overdue: 0, snoozed: 0, onTime: 2, late: 1 };
    mockUseAnalytics.metrics = metrics;
    render(<Stat onOpenBackup={mockOnOpenBackup} onOpenRestore={mockOnOpenRestore} />);
    expect(screen.getByText('Total Reminders')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('Completed')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('Completion Rate')).toBeInTheDocument();
    expect(screen.getByText('60%')).toBeInTheDocument();
  });

  test('shows journal entries count', () => {
    mockUseJournal.entries = [{ id: '1', title: 'Entry' }, { id: '2', title: 'Entry2' }];
    render(<Stat onOpenBackup={mockOnOpenBackup} onOpenRestore={mockOnOpenRestore} />);
    expect(screen.getByText('Journal Entries')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  test('displays average time to complete when available', () => {
    mockUseAnalytics.avgTimeToComplete = 12.5;
    render(<Stat onOpenBackup={mockOnOpenBackup} onOpenRestore={mockOnOpenRestore} />);
    expect(screen.getByText('Average Time to Complete')).toBeInTheDocument();
    expect(screen.getByText('12.5 hours')).toBeInTheDocument();
  });
});
