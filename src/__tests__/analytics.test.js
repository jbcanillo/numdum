import {
  getMetrics,
  getTrendData,
  getWeekdayStats,
  getHourlyStats,
  getPriorityBreakdown,
  getAvgTimeToComplete
} from '../utils/analytics';
import { format, subDays, startOfDay, isWithinInterval, parseISO } from 'date-fns';

describe('Analytics Utilities', () => {
  const now = new Date();
  const dayMs = 24 * 60 * 60 * 1000;

  const mockReminders = [
    {
      id: '1',
      title: 'High priority completed on time',
      priority: 'high',
      completed: true,
      completed_at: new Date(now.getTime() - 1 * dayMs).toISOString(),
      dueDate: new Date(now.getTime() - 2 * dayMs).toISOString(),
      created_at: new Date(now.getTime() - 5 * dayMs).toISOString(),
      snoozedUntil: null
    },
    {
      id: '2',
      title: 'Medium priority late completion',
      priority: 'medium',
      completed: true,
      completed_at: new Date(now.getTime() - 1 * dayMs).toISOString(),
      dueDate: new Date(now.getTime() - 3 * dayMs).toISOString(),
      created_at: new Date(now.getTime() - 4 * dayMs).toISOString(),
      snoozedUntil: null
    },
    {
      id: '3',
      title: 'Low priority pending',
      priority: 'low',
      completed: false,
      dueDate: new Date(now.getTime() + 2 * dayMs).toISOString(),
      created_at: new Date(now.getTime() - 1 * dayMs).toISOString(),
      snoozedUntil: null
    },
    {
      id: '4',
      title: 'High priority overdue',
      priority: 'high',
      completed: false,
      dueDate: new Date(now.getTime() - 1 * dayMs).toISOString(),
      created_at: new Date(now.getTime() - 2 * dayMs).toISOString(),
      snoozedUntil: null
    },
    {
      id: '5',
      title: 'Medium snoozed',
      priority: 'medium',
      completed: false,
      dueDate: new Date(now.getTime() + 1 * dayMs).toISOString(),
      created_at: new Date(now.getTime() - 1 * dayMs).toISOString(),
      snoozedUntil: new Date(now.getTime() + 0.5 * dayMs).toISOString()
    }
  ];

  describe('getMetrics', () => {
    test('calculates correct totals and completion rate', () => {
      const metrics = getMetrics(mockReminders);
      expect(metrics.total).toBe(5);
      expect(metrics.completed).toBe(2);
      expect(metrics.pending).toBe(3);
      expect(metrics.completionRate).toBe(40); // 2/5 = 40%
    });

    test('calculates on-time vs late', () => {
      const metrics = getMetrics(mockReminders);
      expect(metrics.onTime).toBe(1); // first one: completed before due
      expect(metrics.late).toBe(1); // second one: completed after due
    });

    test('priority breakdown', () => {
      const metrics = getMetrics(mockReminders);
      expect(metrics.priorityStats.high).toBe(2);
      expect(metrics.priorityStats.medium).toBe(2);
      expect(metrics.priorityStats.low).toBe(1);
    });

    test('overdue and snoozed counts', () => {
      const metrics = getMetrics(mockReminders);
      expect(metrics.overdue).toBe(1); // #4 past due, not complete
      expect(metrics.snoozed).toBe(1); // #5 snoozedUntil set
    });

    test('handles empty array', () => {
      const metrics = getMetrics([]);
      expect(metrics.total).toBe(0);
      expect(metrics.completed).toBe(0);
      expect(metrics.pending).toBe(0);
      expect(metrics.completionRate).toBe(0);
      expect(metrics.priorityStats).toEqual({ high: 0, medium: 0, low: 0 });
      expect(metrics.overdue).toBe(0);
      expect(metrics.snoozed).toBe(0);
    });

    test('handles undefined gracefully', () => {
      const metrics = getMetrics(undefined);
      expect(metrics.total).toBe(0);
    });
  });

  describe('getTrendData', () => {
    test('returns correct number of days', () => {
      const trend = getTrendData(mockReminders, 7);
      expect(trend.length).toBe(7);
    });

    test('aggregates completions by day', () => {
      // mockReminders has 2 completions: one 1 day ago, one 1 day ago (same day)
      const trend = getTrendData(mockReminders, 30);
      const todayLabel = format(now, 'MMM dd');
      const yesterdayLabel = format(subDays(now, 1), 'MMM dd');
      
      const todayEntry = trend.find(d => d.label === todayLabel);
      const yesterdayEntry = trend.find(d => d.label === yesterdayLabel);
      
      expect(todayEntry.completions).toBe(0);
      expect(yesterdayEntry.completions).toBe(2);
    });

    test('initializes all days with zero when no completions', () => {
      const pendingOnly = mockReminders.filter(r => !r.completed);
      const trend = getTrendData(pendingOnly, 10);
      expect(trend.every(d => d.completions === 0)).toBe(true);
    });

    test('handles empty array', () => {
      const trend = getTrendData([], 5);
      expect(trend.length).toBe(5);
      expect(trend.every(d => d.completions === 0)).toBe(true);
    });
  });

  describe('getWeekdayStats', () => {
    test('counts completions by weekday', () => {
      const stats = getWeekdayStats(mockReminders);
      expect(Array.isArray(stats)).toBe(true);
      expect(stats.length).toBe(7);
      // Both completions in mockReminders happened 1 day ago
      const total = stats.reduce((sum, d) => sum + d.completions, 0);
      expect(total).toBe(2);
    });

    test('handles empty array', () => {
      const stats = getWeekdayStats([]);
      expect(stats.length).toBe(7);
      expect(stats.every(d => d.completions === 0)).toBe(true);
    });
  });

  describe('getHourlyStats', () => {
    test('counts completions by hour', () => {
      const stats = getHourlyStats(mockReminders);
      expect(Array.isArray(stats)).toBe(true);
      expect(stats.length).toBe(24);
      const total = stats.reduce((sum, d) => sum + d.completions, 0);
      expect(total).toBe(2);
    });

    test('handles empty array', () => {
      const stats = getHourlyStats([]);
      expect(stats.length).toBe(24);
      expect(stats.every(d => d.completions === 0)).toBe(true);
    });
  });

  describe('getPriorityBreakdown', () => {
    test('separates completed vs pending by priority', () => {
      const breakdown = getPriorityBreakdown(mockReminders);
      expect(breakdown.completed.high).toBe(1);
      expect(breakdown.completed.medium).toBe(1);
      expect(breakdown.pending.high).toBe(1);
      expect(breakdown.pending.medium).toBe(1);
      expect(breakdown.pending.low).toBe(1);
    });

    test('handles empty array', () => {
      const breakdown = getPriorityBreakdown([]);
      expect(breakdown.completed).toEqual({ high: 0, medium: 0, low: 0 });
      expect(breakdown.pending).toEqual({ high: 0, medium: 0, low: 0 });
    });
  });

  describe('getAvgTimeToComplete', () => {
    test('calculates average hours correctly', () => {
      const avg = getAvgTimeToComplete(mockReminders);
      // Two completed: (4 days + 3 days) / 2 = 3.5 days = 84 hours
      // But created_at to completed_at:
      // #1: 5d ago created, 1d ago completed => ~4d = 96h
      // #2: 4d ago created, 1d ago completed => ~3d = 72h
      // avg = 84h
      expect(avg).toBeCloseTo(84, 0);
    });

    test('returns null when no completed reminders', () => {
      const pendingOnly = mockReminders.filter(r => !r.completed);
      const avg = getAvgTimeToComplete(pendingOnly);
      expect(avg).toBeNull();
    });

    test('ignore missing timestamps', () => {
      const incomplete = [
        { completed: true, completed_at: null, created_at: null },
        { completed: true, completed_at: 'bad', created_at: 'bad' }
      ];
      const avg = getAvgTimeToComplete(incomplete);
      expect(avg).toBeNull();
    });
  });
});
