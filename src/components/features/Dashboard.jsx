import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar
} from 'recharts';
import { useReminders } from '../../hooks/useReminders';
import { useJournal } from '../../hooks/useJournal';
import useAnalytics from '../../hooks/useAnalytics';

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
      <div className="flex items-center justify-center h-64 animate-fade-in">
        <div className="text-lg font-medium animate-pulse" style={{ color: 'var(--text-muted)' }}>
          Loading analytics...
        </div>
      </div>
    );
  }

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

  const MetricCard = ({ label, value, subLabel, color = 'var(--text-primary)', bgColor = 'var(--bg-elevated)' }) => (
    <div 
      className="p-5 rounded-[var(--radius-lg)] border border-[var(--border)] 
                bg-[var(--bg-elevated)] shadow-[var(--shadow-sm)] 
                hover:shadow-[var(--shadow-md)] transition-all duration-300 
                flex flex-col justify-between animate-fade-in"
      style={{ '--delay': `${Math.random() * 0.2}s` }}
    >
      <div className="text-sm font-medium" style={{ color: 'var(--text-tertiary)' }}>{label}</div>
      <div className="text-3xl font-bold mt-2" style={{ color: color }}>{value}</div>
      {subLabel && (
        <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{subLabel}</div>
      )}
    </div>
  );

  const ChartCard = ({ title, children, className = '' }) => (
    <div 
      className={`p-5 rounded-[var(--radius-lg)] border border-[var(--border)] 
                  bg-[var(--bg-elevated)] shadow-[var(--shadow-sm)] 
                  hover:shadow-[var(--shadow-md)] transition-shadow duration-300 animate-fade-in ${className}`}
    >
      <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>{title}</h3>
      {children}
    </div>
  );

  return (
    <div className="p-4 space-y-6 animate-slide-up">
      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <MetricCard 
          label="Total Reminders" 
          value={metrics.total} 
        />
        <MetricCard 
          label="Completed" 
          value={metrics.completed} 
          color="var(--success)"
        />
        <MetricCard 
          label="Pending" 
          value={metrics.pending} 
          color="var(--warning)"
        />
        <MetricCard 
          label="Completion Rate" 
          value={`${metrics.completionRate}%`} 
          subLabel="of total"
        />
        <MetricCard 
          label="On-Time" 
          value={metrics.onTime} 
          color="var(--success)"
        />
        <MetricCard 
          label="Late" 
          value={metrics.late} 
          color="var(--error)"
        />
        <MetricCard 
          label="Overdue" 
          value={metrics.overdue} 
          color="var(--warning)"
        />
        <MetricCard 
          label="Snoozed" 
          value={metrics.snoozed} 
          color="var(--accent)"
        />
        <MetricCard 
          label="Journal Entries" 
          value={journalEntries?.length || 0} 
        />
      </div>

      {avgTimeToComplete !== null && (
        <div 
          className="p-5 rounded-[var(--radius-lg)] border border-[var(--border)] 
                    bg-[var(--bg-elevated)] shadow-[var(--shadow-sm)] 
                    animate-fade-in"
          style={{ animationDelay: '0.2s' }}
        >
          <div className="text-sm font-medium" style={{ color: 'var(--text-tertiary)' }}>
            Average Time to Complete
          </div>
          <div className="text-2xl font-bold mt-1" style={{ color: 'var(--text-primary)' }}>
            {avgTimeToComplete} hours
          </div>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Completion Trend (Last 30 Days)">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trend}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="label" tick={{ fontSize: 12 }} stroke="var(--text-tertiary)" />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} stroke="var(--text-tertiary)" />
              <Tooltip 
                contentStyle={{ 
                  background: 'var(--bg-elevated)', 
                  border: '1px solid var(--border)', 
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-primary)'
                }} 
              />
              <Legend />
              <Line type="monotone" dataKey="completions" stroke="var(--primary)" strokeWidth={2} dot={{ fill: 'var(--primary)', r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Reminders by Priority">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie 
                data={priorityData} 
                cx="50%" 
                cy="50%" 
                labelLine={false} 
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`} 
                outerRadius={100} 
                fill="#8884d8" 
                dataKey="value"
              >
                {priorityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  background: 'var(--bg-elevated)', 
                  border: '1px solid var(--border)', 
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-primary)'
                }} 
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Completions by Day of Week">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={weekdayStats}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="var(--text-tertiary)" />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} stroke="var(--text-tertiary)" />
              <Tooltip 
                contentStyle={{ 
                  background: 'var(--bg-elevated)', 
                  border: '1px solid var(--border)', 
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-primary)'
                }} 
              />
              <Bar dataKey="completions" fill="var(--accent)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Completions by Hour of Day">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={hourlyStats}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="hour" tick={{ fontSize: 12 }} stroke="var(--text-tertiary)" />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} stroke="var(--text-tertiary)" />
              <Tooltip 
                contentStyle={{ 
                  background: 'var(--bg-elevated)', 
                  border: '1px solid var(--border)', 
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-primary)'
                }} 
              />
              <Bar dataKey="completions" fill="var(--primary)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {moodData.length > 0 && (
        <ChartCard title="Journal Entries by Mood">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie 
                data={moodData} 
                cx="50%" 
                cy="50%" 
                labelLine={false} 
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`} 
                outerRadius={100} 
                fill="#8884d8" 
                dataKey="value"
              >
                {moodData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={MOOD_COLORS[entry.name] || '#ccc'} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  background: 'var(--bg-elevated)', 
                  border: '1px solid var(--border)', 
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-primary)'
                }} 
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      )}
    </div>
  );
};

export default Dashboard;
