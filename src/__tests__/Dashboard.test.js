import React from 'react';
import { render, screen } from '@testing-library/react';
import Dashboard from '../components/features/Dashboard';

// Mock Recharts ResponsiveContainer to avoid ResizeObserver issues
jest.mock('recharts', () => ({
  ...jest.requireActual('recharts'),
  ResponsiveContainer: ({ children }) => (
    <div className="responsive-container">
      {children}
    </div>
  ),
  LineChart: ({ children }) => <div className="line-chart">{children}</div>,
  Line: ({ children }) => <div className="line">{children}</div>,
  XAxis: () => <div className="x-axis" />,
  YAxis: () => <div className="y-axis" />,
  CartesianGrid: () => <div className="cartesian-grid" />,
  Tooltip: () => <div className="tooltip" />,
  Legend: () => <div className="legend" />,
  PieChart: ({ children }) => <div className="pie-chart">{children}</div>,
  Pie: ({ children }) => <div className="pie">{children}</div>,
  Cell: () => <div className="cell" />,
  BarChart: ({ children }) => <div className="bar-chart">{children}</div>,
  Bar: ({ children }) => <div className="bar">{children}</div>
}));

// Mock all dependencies
jest.mock('../hooks/useReminders', () => ({
  useReminders: () => ({ reminders: [], loading: false })
}));

jest.mock('../hooks/useJournal', () => ({
  useJournal: () => ({ entries: [] })
}));

jest.mock('../hooks/useAnalytics', () => ({
  __esModule: true,
  default: () => ({
    metrics: { total: 0, completed: 0, pending: 0, completionRate: 0, priorityStats: { high: 0, medium: 0, low: 0 }, overdue: 0, snoozed: 0, onTime: 0, late: 0 },
    trend: [],
    weekdayStats: [],
    hourlyStats: [],
    avgTimeToComplete: null
  })
}));

jest.mock('../utils/db', () => ({
  deleteAllReminders: jest.fn(),
  deleteAllJournalEntries: jest.fn(),
  createReminder: jest.fn(),
  createJournalEntry: jest.fn()
}));

jest.mock('../utils/backupRestore', () => ({
  downloadBackup: jest.fn(),
  restoreFromFile: jest.fn()
}));

describe('Dashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders without crashing', () => {
    const { container } = render(<Dashboard />);
    expect(container).toBeInTheDocument();
    expect(container.querySelector('[class*="p-4"]')).toBeInTheDocument();
  });
});