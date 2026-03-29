import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar
} from 'recharts';
import { useReminders } from '../../hooks/useReminders';
import { useJournal } from '../../hooks/useJournal';
import useAnalytics from '../../hooks/useAnalytics';
import remindersDB from '../../utils/db';
import { createJournalEntry, deleteAllJournalEntries } from '../../utils/db';
import { downloadBackup, restoreFromFile } from '../../utils/backupRestore';

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

  // Backup/Restore state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState('backup'); // 'backup' | 'restore'
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [restoreFile, setRestoreFile] = useState(null);
  const [confirmRestore, setConfirmRestore] = useState(false);
  const [backupSuccess, setBackupSuccess] = useState(false);
  const [restoreSuccess, setRestoreSuccess] = useState(false);
  const [processing, setProcessing] = useState(false);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (dialogOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [dialogOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape' && dialogOpen) {
        handleCloseDialog();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [dialogOpen]);

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

  // Backup/Restore handlers
  const handleBackupClick = () => {
    setDialogMode('backup');
    setDialogOpen(true);
    setPassword('');
    setPasswordError('');
    setRestoreFile(null);
    setBackupSuccess(false);
    setRestoreSuccess(false);
  };

  const handleRestoreClick = () => {
    setDialogMode('restore');
    setDialogOpen(true);
    setPassword('');
    setPasswordError('');
    setRestoreFile(null);
    setBackupSuccess(false);
    setRestoreSuccess(false);
    setConfirmRestore(false);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setRestoreFile(e.target.files[0]);
    }
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setPassword('');
    setPasswordError('');
    setRestoreFile(null);
    setConfirmRestore(false);
    setBackupSuccess(false);
    setRestoreSuccess(false);
  };

  const performBackup = async () => {
    if (!password) {
      setPasswordError('Password is required');
      return;
    }
    if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return;
    }
    setProcessing(true);
    try {
      const backupData = {
        version: 1,
        exportedAt: new Date().toISOString(),
        reminders,
        journal: journalEntries || []
      };
      downloadBackup(backupData, password);
      setBackupSuccess(true);
      setPassword('');
    } catch (error) {
      setPasswordError('Backup failed: ' + error.message);
    } finally {
      setProcessing(false);
    }
  };

  const performRestore = async () => {
    if (!password) {
      setPasswordError('Password is required');
      return;
    }
    if (!restoreFile) {
      setPasswordError('Please select a backup file');
      return;
    }
    setProcessing(true);
    try {
      const data = await restoreFromFile(restoreFile, password);
      if (!data.reminders || !Array.isArray(data.reminders)) {
        throw new Error('Invalid backup format');
      }
      // Show confirmation before overwriting
      setConfirmRestore(true);
    } catch (error) {
      setPasswordError('Restore failed: ' + error.message);
    } finally {
      setProcessing(false);
    }
  };

  const confirmAndRestore = async () => {
    if (!restoreFile) return;
    setProcessing(true);
    try {
      const data = await restoreFromFile(restoreFile, password);

      // Wipe existing data
      await Promise.all([
        remindersDB.deleteAllReminders(),
        deleteAllJournalEntries()
      ]);

      // Restore reminders
      for (const r of data.reminders) {
        await remindersDB.createReminder(r);
      }

      // Restore journal entries
      for (const j of (data.journal || [])) {
        await createJournalEntry(j);
      }

      setRestoreSuccess(true);
      setConfirmRestore(false);
      // Optionally reload page or trigger data refresh in parent components
      // For now, just close dialog after short delay
      setTimeout(() => {
        handleCloseDialog();
        window.location.reload(); // simplest way to refresh all data
      }, 1500);
    } catch (error) {
      setPasswordError('Restore failed: ' + error.message);
      setConfirmRestore(false);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="p-4 space-y-6 animate-slide-up">
      {/* Backup/Restore Toolbar */}
      <div className="flex flex-wrap gap-3 items-center">
        <button
          onClick={handleBackupClick}
          className="btn btn-primary btn-sm flex items-center gap-2"
          disabled={processing}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Backup Data
        </button>
        <button
          onClick={handleRestoreClick}
          className="btn btn-secondary btn-sm flex items-center gap-2"
          disabled={processing}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 15v4c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Restore Data
        </button>
        {(backupSuccess || restoreSuccess) && (
          <span className="text-sm text-[var(--success)] font-medium ml-2">
            {backupSuccess ? 'Backup downloaded!' : 'Restore complete!'}
          </span>
        )}
      </div>

      {/* Password / File Dialog */}
      {dialogOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={(e) => { if (e.target === e.currentTarget) handleCloseDialog(); }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="backup-dialog-title"
        >
          <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--bg-elevated)] shadow-lg max-w-md w-full p-6 animate-fade-in">
            <h2 id="backup-dialog-title" className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              {dialogMode === 'backup' ? 'Backup Your Data' : 'Restore from Backup'}
            </h2>
            
            {confirmRestore ? (
              <div className="space-y-4">
                <p className="text-[var(--text-secondary)]">
                  This will <strong>replace all existing reminders and journal entries</strong> with the data from the backup file. This action cannot be undone.
                </p>
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => setConfirmRestore(false)}
                    className="btn btn-ghost btn-sm"
                    disabled={processing}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmAndRestore}
                    className="btn btn-warning btn-sm"
                    disabled={processing}
                  >
                    {processing ? 'Restoring...' : 'Yes, Replace All'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-[var(--text-tertiary)]">
                  {dialogMode === 'backup' 
                    ? 'Enter a password to encrypt your backup file. You will need this password to restore.'
                    : 'Select your encrypted backup file and enter the password used to create it.'}
                </p>

                {dialogMode === 'restore' && (
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                      Backup File
                    </label>
                    <div className="relative">
                      <input
                        id="backup-file-input"
                        type="file"
                        accept=".json.enc,.enc"
                        onChange={handleFileChange}
                        className="sr-only"
                      />
                      <label
                        htmlFor="backup-file-input"
                        className="flex items-center justify-center w-full px-4 py-3 rounded-lg border-2 border-dashed border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text-primary)] cursor-pointer hover:border-[var(--primary)] hover:bg-[var(--bg-tertiary)] transition-colors"
                      >
                        {restoreFile ? restoreFile.name : 'Choose file…'}
                      </label>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setPasswordError('');
                    }}
                    placeholder="Enter password"
                    className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  />
                  {passwordError && (
                    <p className="text-sm text-[var(--error)] mt-1">{passwordError}</p>
                  )}
                </div>

                <div className="flex gap-3 justify-end">
                  <button
                    onClick={handleCloseDialog}
                    className="btn btn-ghost btn-sm"
                    disabled={processing}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={dialogMode === 'backup' ? performBackup : performRestore}
                    className="btn btn-primary btn-sm"
                    disabled={processing}
                  >
                    {processing 
                      ? (dialogMode === 'backup' ? 'Backing up...' : 'Verifying...')
                      : (dialogMode === 'backup' ? 'Download Backup' : 'Continue')}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
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
