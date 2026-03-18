import { useMemo } from 'react';
import {
  getMetrics,
  getTrendData,
  getWeekdayStats,
  getHourlyStats,
  getPriorityBreakdown,
  getAvgTimeToComplete
} from '../utils/analytics';

const useAnalytics = (reminders, trendDays = 30) => {
  return useMemo(() => {
    const metrics = getMetrics(reminders);
    const trend = getTrendData(reminders, trendDays);
    const weekdayStats = getWeekdayStats(reminders);
    const hourlyStats = getHourlyStats(reminders);
    const priorityBreakdown = getPriorityBreakdown(reminders);
    const avgTimeToComplete = getAvgTimeToComplete(reminders);

    return {
      metrics,
      trend,
      weekdayStats,
      hourlyStats,
      priorityBreakdown,
      avgTimeToComplete
    };
  }, [reminders, trendDays]);
};

export default useAnalytics;
