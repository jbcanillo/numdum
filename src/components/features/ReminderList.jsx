import React, { useState, useMemo } from 'react';
import { BookOpen, Search, Filter, Calendar as CalendarIcon } from 'lucide-react';
import ReminderItem from './ReminderItem';

const ReminderList = ({ reminders, journalEntries, loading, error, onEdit, onComplete, onDelete, onToggleChecklist }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all', 'reminders', 'journal'
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  // Filter logic
  const filteredReminders = useMemo(() => {
    let filtered = reminders;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(r => 
        r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.description && r.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Date range filter
    if (dateRange.start) {
      filtered = filtered.filter(r => new Date(r.dueDate) >= new Date(dateRange.start));
    }
    if (dateRange.end) {
      filtered = filtered.filter(r => new Date(r.dueDate) <= new Date(dateRange.end + 'T23:59:59'));
    }

    return filtered;
  }, [reminders, searchTerm, dateRange]);

  const filteredJournal = useMemo(() => {
    if (filterType === 'reminders') return [];
    let filtered = journalEntries || [];

    if (searchTerm) {
      filtered = filtered.filter(j => j.text.toLowerCase().includes(searchTerm.toLowerCase()));
    }

    if (dateRange.start) {
      filtered = filtered.filter(j => new Date(j.date) >= new Date(dateRange.start));
    }
    if (dateRange.end) {
      filtered = filtered.filter(j => new Date(j.date) <= new Date(dateRange.end + 'T23:59:59'));
    }

    return filtered;
  }, [journalEntries, searchTerm, dateRange, filterType]);

  const combined = [
    ...filteredReminders.map(r => ({ ...r, __type: 'reminder', sortDate: r.dueDate })),
    ...filteredJournal.map(j => ({ ...j, __type: 'journal', sortDate: j.date }))
  ].sort((a, b) => new Date(b.sortDate) - new Date(a.sortDate));

  if (loading) {
    return (
      <div className="p-12 text-center animate-fade-in">
        <div className="inline-block w-8 h-8 border-3 border-[var(--primary)] border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-lg font-medium" style={{ color: 'var(--text-tertiary)' }}>Loading reminders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-12 text-center animate-fade-in">
        <div className="text-4xl mb-4">⚠️</div>
        <p className="text-lg font-medium" style={{ color: 'var(--error)' }}>Error loading reminders</p>
        <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>{error.message}</p>
      </div>
    );
  }

  if (combined.length === 0) {
    return (
      <div className="p-16 text-center animate-fade-in">
        <div className="text-6xl mb-4">📭</div>
        <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>No entries found</h3>
        <p className="max-w-md mx-auto" style={{ color: 'var(--text-tertiary)' }}>
          Try adjusting your search or filters to find what you're looking for.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 animate-fade-in">
      <div className="max-w-4xl mx-auto space-y-4">
        {/* Search and Filters */}
        <div className="bg-[var(--bg-elevated)] border border-[var(--border)] rounded-[var(--radius-lg)] p-4 shadow-[var(--shadow-sm)]">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search reminders and journal..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-[var(--radius-md)] border border-[var(--border)] 
                         bg-[var(--bg-elevated)] text-[var(--text-primary)] 
                         focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
              />
            </div>

            {/* Type Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-2 rounded-[var(--radius-md)] border border-[var(--border)] 
                         bg-[var(--bg-elevated)] text-[var(--text-primary)] 
                         focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="reminders">Reminders Only</option>
                <option value="journal">Journal Only</option>
              </select>
            </div>

            {/* Date Range */}
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
              <input
                type="date"
                placeholder="Start date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                className="px-3 py-2 rounded-[var(--radius-md)] border border-[var(--border)] 
                         bg-[var(--bg-elevated)] text-[var(--text-primary)] 
                         focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
              />
              <span style={{ color: 'var(--text-muted)' }}>to</span>
              <input
                type="date"
                placeholder="End date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                className="px-3 py-2 rounded-[var(--radius-md)] border border-[var(--border)] 
                         bg-[var(--bg-elevated)] text-[var(--text-primary)] 
                         focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
              />
            </div>
          </div>
          {(searchTerm || dateRange.start || dateRange.end || filterType !== 'all') && (
            <div className="mt-3 flex items-center justify-between">
              <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
                Showing {combined.length} items
              </span>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterType('all');
                  setDateRange({ start: '', end: '' });
                }}
                className="text-sm" style={{ color: 'var(--primary)' }}
              >
                Clear filters
              </button>
            </div>
          )}
        </div>

        {/* Items List */}
        {combined.map((item) => {
          if (item.__type === 'reminder') {
            return (
              <ReminderItem 
                key={item.id} 
                reminder={item} 
                onEdit={onEdit} 
                onComplete={onComplete} 
                onDelete={onDelete}
                onToggleChecklist={onToggleChecklist}
              />
            );
          } else {
            return (
              <div 
                key={item.id} 
                className="p-4 border border-[var(--border)] rounded-[var(--radius-lg)] 
                         bg-[var(--bg-elevated)] shadow-[var(--shadow-sm)] 
                         hover:shadow-[var(--shadow-md)] transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl" role="img" aria-label="Mood">{item.mood}</span>
                    <span className="font-semibold text-sm flex items-center gap-1" style={{ color: 'var(--text-primary)' }}>
                      <BookOpen size={14} />
                      Journal
                    </span>
                  </div>
                  <span className="text-xs font-medium px-2 py-1 rounded-full" 
                    style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-muted)' }}>
                    {new Date(item.date).toLocaleDateString()} {new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="whitespace-pre-wrap leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  {item.text}
                </p>
              </div>
            );
          }
        })}
      </div>
    </div>
  );
};

export default ReminderList;
