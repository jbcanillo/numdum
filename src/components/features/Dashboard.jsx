import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar
} from 'recharts';
import { useReminders } from '../../hooks/useReminders';
import { useJournal } from '../../hooks/useJournal';
import useAnalytics from '../../hooks/useAnalytics';
import { exportToCSV, exportToJSON } from '../../utils/export';

const COLORS = ['#10b981', '#f59e0b', '#ef4444']; // green, amber, red for priorities

const MOOD_COLORS = {
  '😊': '#10b981', // green
  '😐': '#6b7280', // gray
  '😔': '#3b82f6', // blue
  '😠': '#ef4444', // red
  '😲': '#f59e0b'  // amber
};

const Dashboard = () => {
  const { reminders, loading } = useReminders();
  const { entries: journalEntries } = useJournal();
  const analytics = useAnalytics(reminders, 30);
  const { metrics, trend, weekdayStats, hourlyStats, avgTimeToComplete } = analytics;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-base-content/50">Loading analytics...</div>
      </div>
    );
  }

  const handleExportCSV = () => {
    exportToCSV(reminders);
  };

  const handleExportJSON = () => {
    exportToJSON(reminders);
  };

  const moodCounts = { '😊': 0, '😐': 0, '😔': 0, '😠': 0, '😲': 0 };
  journalEntries?.forEach(entry => {
    if (moodCounts.hasOwnProperty(entry.mood)) {
      moodCounts[entry.mood]++;
    }
  });

  const moodData = Object.entries(moodCounts)
    .map(([mood, count]) => ({ name: mood, value: count }))
    .filter(item => item.value > 0);

  const priorityData = [
    { name: 'High', value: metrics.priorityStats.high },
    { name: 'Medium', value: metrics.priorityStats.medium },
    { name: 'Low', value: metrics.priorityStats.low }
  ];

  return (
    <div className="p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-base-content">Analytics Dashboard</h2>
        <div className="space-x-2">
          <button onClick={handleExportCSV} className="btn btn-primary btn-sm" aria-label="Export reminders as CSV">Export CSV</button>
          <button onClick={handleExportJSON} className="btn btn-secondary btn-sm" aria-label="Export reminders as JSON">Export JSON</button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-base-100 p-4 rounded-lg shadow">
          <div className="text-sm text-base-content/60">Total Reminders</div>
          <div className="text-3xl font-bold text-base-content">{metrics.total}</div>
        </div>
        <div className="bg-base-100 p-4 rounded-lg shadow">
          <div className="text-sm text-base-content/60">Completed</div>
          <div className="text-3xl font-bold text-success">{metrics.completed}</div>
        </div>
        <div className="bg-base-100 p-4 rounded-lg shadow">
          <div className="text-sm text-base-content/60">Pending</div>
          <div className="text-3xl font-bold text-warning">{metrics.pending}</div>
        </div>
        <div className="bg-base-100 p-4 rounded-lg shadow">
          <div className="text-sm text-base-content/60">Completion Rate</div>
          <div className="text-3xl font-bold text-primary">{metrics.completionRate}%</div>
        </div>
        <div className="bg-base-100 p-4 rounded-lg shadow">
          <div className="text-sm text-base-content/60">On-Time Completions</div>
          <div className="text-3xl font-bold text-success">{metrics.onTime}</div>
        </div>
        <div className="bg-base-100 p-4 rounded-lg shadow">
          <div className="text-sm text-base-content/60">Late Completions</div>
          <div className="text-3xl font-bold text-error">{metrics.late}</div>
        </div>
        <div className="bg-base-100 p-4 rounded-lg shadow">
          <div className="text-sm text-base-content/60">Overdue</div>
          <div className="text-3xl font-bold text-warning">{metrics.overdue}</div>
        </div>
        <div className="bg-base-100 p-4 rounded-lg shadow">
          <div className="text-sm text-base-content/60">Snoozed</div>
          <div className="text-3xl font-bold text-accent">{metrics.snoozed}</div>
        </div>
        <div className="bg-base-100 p-4 rounded-lg shadow">
          <div className="text-sm text-base-content/60">Total Journal Entries</div>
          <div className="text-3xl font-bold text-info">{journalEntries?.length || 0}</div>
        </div>
      </div>

      {avgTimeToComplete !== null && (
        <div className="bg-base-100 p-4 rounded-lg shadow">
          <div className="text-sm text-base-content/60">Average Time to Complete</div>
          <div className="text-2xl font-bold text-base-content">{avgTimeToComplete} hours</div>
        </div>
      )}

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-base-100 p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4 text-base-content">Completion Trend (Last 30 Days)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="completions" stroke="#3b82f6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-base-100 p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4 text-base-content">Reminders by Priority</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={priorityData} cx="50%" cy="50%" labelLine={false} label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`} outerRadius={80} fill="#8884d8" dataKey="value">
                {priorityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-base-100 p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4 text-base-content">Completions by Day of Week</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={weekdayStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="completions" fill="#6366f1" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-base-100 p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4 text-base-content">Completions by Hour of Day</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={hourlyStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="completions" fill="#8b5cf6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {moodData.length > 0 && (
        <div className="bg-base-100 p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4 text-base-content">Journal Entries by Mood</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={moodData} cx="50%" cy="50%" labelLine={false} label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`} outerRadius={80} fill="#8884d8" dataKey="value">
                {moodData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={MOOD_COLORS[entry.name] || '#ccc'} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
