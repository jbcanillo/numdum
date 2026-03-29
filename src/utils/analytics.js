// Analytics utilities for reminder data
import { format, subDays, startOfDay, isWithinInterval, parseISO } from 'date-fns';

/**
 * Calculate core metrics from reminders array
 * @param {Array<Object>} reminders - Array of reminder objects
 * @returns {Object} Metrics object with totals, counts, and rates
 */
export const getMetrics = (reminders = []) => {
  const total = reminders.length;
  const completed = reminders.filter(r => r.completed).length;
  const pending = total - completed;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  // On-time vs late completions (completed before due date)
  const onTime = reminders.filter(r => {
    if (!r.completed || !r.completed_at || !r.dueDate) return false;
    const completedAt = new Date(r.completed_at);
    const dueDate = new Date(r.dueDate);
    return completedAt <= dueDate;
  }).length;
  const late = completed - onTime;

  // Priority breakdown
  const priorityStats = {
    high: reminders.filter(r => r.priority === 'high').length,
    medium: reminders.filter(r => r.priority === 'medium').length,
    low: reminders.filter(r => r.priority === 'low').length,
  };

  // Upcoming vs overdue vs snoozed
  const now = new Date();
  const upcoming = reminders.filter(r => !r.completed && new Date(r.dueDate) > now).length;
  const overdue = reminders.filter(r => !r.completed && new Date(r.dueDate) < now).length;
  const snoozed = reminders.filter(r => !r.completed && r.snoozedUntil).length;

  return {
    total,
    completed,
    pending,
    completionRate,
    onTime,
    late,
    priorityStats,
    upcoming,
    overdue,
    snoozed
  };
};

/**
 * Generate daily completion trend data for the last N days
 * @param {Array<Object>} reminders - Array of reminder objects
 * @param {number} [days=30] - Number of days to include
 * @returns {Array<{date: string, label: string, completions: number}>} Trend data
 */
export const getTrendData = (reminders = [], days = 30) => {
  const endDate = startOfDay(new Date());
  const startDate = startOfDay(subDays(endDate, days - 1));

  // Initialize array with zero counts for each day
  const trend = [];
  for (let i = 0; i < days; i++) {
    const date = subDays(endDate, days - 1 - i);
    trend.push({
      date: format(date, 'yyyy-MM-dd'),
      label: format(date, 'MMM dd'),
      completions: 0
    });
  }

  // Count completions per day
  reminders.forEach(r => {
    if (r.completed && r.completed_at) {
      const completedDate = startOfDay(parseISO(r.completed_at));
      if (isWithinInterval(completedDate, { start: startDate, end: endDate })) {
        const dayStr = format(completedDate, 'yyyy-MM-dd');
        const dayData = trend.find(d => d.date === dayStr);
        if (dayData) {
          dayData.completions += 1;
        }
      }
    }
  });

  return trend;
};

/**
 * Get completion by day of week (0=Sunday, 6=Saturday)
 * @param {Array<Object>} reminders - Array of reminder objects
 * @returns {Array<{day: string, completions: number}>} Stats per weekday
 */
export const getWeekdayStats = (reminders = []) => {
  const counts = Array(7).fill(0);
  reminders.forEach(r => {
    if (r.completed && r.completed_at) {
      const day = new Date(r.completed_at).getDay();
      counts[day] += 1;
    }
  });
  return counts.map((count, dayIndex) => ({
    day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dayIndex],
    completions: count
  }));
};

/**
 * Get completion by hour of day (0-23)
 * @param {Array<Object>} reminders - Array of reminder objects
 * @returns {Array<{hour: number, completions: number}>} Stats per hour
 */
export const getHourlyStats = (reminders = []) => {
  const counts = Array(24).fill(0);
  reminders.forEach(r => {
    if (r.completed && r.completed_at) {
      const hour = new Date(r.completed_at).getHours();
      counts[hour] += 1;
    }
  });
  return counts.map((count, hour) => ({ hour, completions: count }));
};

/**
 * Get priority distribution among completed vs pending
 * @param {Array<Object>} reminders - Array of reminder objects
 * @returns {{completed: {high: number, medium: number, low: number}, pending: {high: number, medium: number, low: number}}}
 */
export const getPriorityBreakdown = (reminders = []) => {
  const byStatus = {
    completed: { high: 0, medium: 0, low: 0 },
    pending: { high: 0, medium: 0, low: 0 }
  };

  reminders.forEach(r => {
    const status = r.completed ? 'completed' : 'pending';
    if (r.priority && ['high', 'medium', 'low'].includes(r.priority)) {
      byStatus[status][r.priority] += 1;
    }
  });

  return byStatus;
};

/**
 * Estimate avg time from creation to completion (in hours)
 * @param {Array<Object>} reminders - Array of reminder objects
 * @returns {number|null} Average hours, or null if no completed reminders with timestamps
 */
export const getAvgTimeToComplete = (reminders = []) => {
  const times = reminders
    .filter(r => r.completed && r.completed_at && r.created_at)
    .map(r => {
      const created = new Date(r.created_at);
      const completed = new Date(r.completed_at);
      return (completed - created) / (1000 * 60 * 60); // hours
    });

  if (times.length === 0) return null;
  const avg = times.reduce((a, b) => a + b, 0) / times.length;
  return Math.round(avg * 100) / 100;
};
