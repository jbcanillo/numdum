import { renderHook } from '@testing-library/react';
import useAnalytics from '../hooks/useAnalytics';
import {
  getMetrics,
  getTrendData,
  getWeekdayStats,
  getHourlyStats,
  getPriorityBreakdown,
  getAvgTimeToComplete
} from '../utils/analytics';

// Mock analytics utils to isolate hook behavior
jest.mock('../utils/analytics', () => ({
  getMetrics: jest.fn(),
  getTrendData: jest.fn(),
  getWeekdayStats: jest.fn(),
  getHourlyStats: jest.fn(),
  getPriorityBreakdown: jest.fn(),
  getAvgTimeToComplete: jest.fn()
}));

describe('useAnalytics Hook', () => {
  const mockReminders = [
    { id: '1', title: 'Reminder 1', completed: true, dueDate: '2026-03-28T10:00:00Z', created_at: '2026-03-20T10:00:00Z', priority: 'high', completed_at: '2026-03-28T10:00:00Z' },
    { id: '2', title: 'Reminder 2', completed: false, dueDate: '2026-03-29T10:00:00Z', created_at: '2026-03-21T10:00:00Z', priority: 'medium' }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('returns analytics object with expected keys', () => {
    const mockReturn = {
      metrics: { total: 2, completed: 1, pending: 1, completionRate: 50, priorityStats: { high: 1, medium: 1, low: 0 }, overdue: 0, snoozed: 0, onTime: 1, late: 0 },
      trend: [],
      weekdayStats: [],
      hourlyStats: [],
      priorityBreakdown: { completed: { high: 1, medium: 0, low: 0 }, pending: { high: 0, medium: 1, low: 0 } },
      avgTimeToComplete: 24
    };
    Object.values(getMetrics).forEach(fn => fn.mockReturnValue(mockReturn.metrics));
    getTrendData.mockReturnValue(mockReturn.trend);
    getWeekdayStats.mockReturnValue(mockReturn.weekdayStats);
    getHourlyStats.mockReturnValue(mockReturn.hourlyStats);
    getPriorityBreakdown.mockReturnValue(mockReturn.priorityBreakdown);
    getAvgTimeToComplete.mockReturnValue(mockReturn.avgTimeToComplete);

    const { result } = renderHook(() => useAnalytics(mockReminders, 30));
    expect(result.current).toHaveProperty('metrics');
    expect(result.current).toHaveProperty('trend');
    expect(result.current).toHaveProperty('weekdayStats');
    expect(result.current).toHaveProperty('hourlyStats');
    expect(result.current).toHaveProperty('priorityBreakdown');
    expect(result.current).toHaveProperty('avgTimeToComplete');
  });

  test('memoizes when reminders unchanged', () => {
    const mockReturn = {
      metrics: { total: 2 },
      trend: [],
      weekdayStats: [],
      hourlyStats: [],
      priorityBreakdown: { completed: {}, pending: {} },
      avgTimeToComplete: null
    };
    Object.values(getMetrics).forEach(fn => fn.mockReturnValue(mockReturn.metrics));
    getTrendData.mockReturnValue(mockReturn.trend);
    getWeekdayStats.mockReturnValue(mockReturn.weekdayStats);
    getHourlyStats.mockReturnValue(mockReturn.hourlyStats);
    getPriorityBreakdown.mockReturnValue(mockReturn.priorityBreakdown);
    getAvgTimeToComplete.mockReturnValue(mockReturn.avgTimeToComplete);

    const { result, rerender } = renderHook(
      ({ reminders, days }) => useAnalytics(reminders, days),
      { initialParams: { reminders: mockReminders, days: 30 } }
    );

    const firstMetrics = result.current.metrics;
    rerender({ reminders: mockReminders, days: 30 });
    const secondMetrics = result.current.metrics;

    // Should return same object (no recompute) since dependencies unchanged
    expect(firstMetrics).toBe(secondMetrics);
  });

  test('recomputes when reminders change', () => {
    const mockReturnA = { metrics: { total: 2 }, trend: [], weekdayStats: [], hourlyStats: [], priorityBreakdown: { completed: {}, pending: {} }, avgTimeToComplete: null };
    const mockReturnB = { metrics: { total: 3 }, trend: [], weekdayStats: [], hourlyStats: [], priorityBreakdown: { completed: {}, pending: {} }, avgTimeToComplete: null };
    Object.values(getMetrics).forEach(fn => fn.mockReturnValue(mockReturnA.metrics));
    getTrendData.mockReturnValue(mockReturnA.trend);
    getWeekdayStats.mockReturnValue(mockReturnA.weekdayStats);
    getHourlyStats.mockReturnValue(mockReturnA.hourlyStats);
    getPriorityBreakdown.mockReturnValue(mockReturnA.priorityBreakdown);
    getAvgTimeToComplete.mockReturnValue(mockReturnA.avgTimeToComplete);

    const { result, rerender } = renderHook(
      ({ reminders }) => useAnalytics(reminders, 30),
      { initialParams: { reminders: mockReminders } }
    );

    let firstMetrics = result.current.metrics;
    const newReminders = [...mockReminders, { id: '3', completed: false }];
    Object.values(getMetrics).forEach(fn => fn.mockReturnValue(mockReturnB.metrics));
    rerender({ reminders: newReminders });
    const secondMetrics = result.current.metrics;

    expect(firstMetrics.total).toBe(2);
    expect(secondMetrics.total).toBe(3);
  });

  test('recomputes when days change', () => {
    const mockReturn = { metrics: { total: 2 }, trend: [], weekdayStats: [], hourlyStats: [], priorityBreakdown: { completed: {}, pending: {} }, avgTimeToComplete: null };
    Object.values(getMetrics).forEach(fn => fn.mockReturnValue(mockReturn.metrics));
    getTrendData.mockReturnValue(mockReturn.trend);
    getWeekdayStats.mockReturnValue(mockReturn.weekdayStats);
    getHourlyStats.mockReturnValue(mockReturn.hourlyStats);
    getPriorityBreakdown.mockReturnValue(mockReturn.priorityBreakdown);
    getAvgTimeToComplete.mockReturnValue(mockReturn.avgTimeToComplete);

    const { result, rerender } = renderHook(
      ({ reminders, days }) => useAnalytics(reminders, days),
      { initialParams: { reminders: mockReminders, days: 30 } }
    );

    const first = result.current.trend;
    getTrendData.mockClear();
    rerender({ reminders: mockReminders, days: 7 });
    const second = result.current.trend;

    expect(getTrendData).toHaveBeenCalledWith(mockReminders, 7);
    expect(first).not.toBe(second);
  });

  test('handles undefined reminders gracefully', () => {
    Object.values(getMetrics).forEach(fn => fn.mockReturnValue({ total: 0 }));
    getTrendData.mockReturnValue([]);
    getWeekdayStats.mockReturnValue([]);
    getHourlyStats.mockReturnValue([]);
    getPriorityBreakdown.mockReturnValue({ completed: {}, pending: {} });
    getAvgTimeToComplete.mockReturnValue(null);

    const { result } = renderHook(() => useAnalytics(undefined, 30));
    expect(result.current.metrics.total).toBe(0);
  });
});
