import React from 'react';
import ReminderItem from './ReminderItem';

const ReminderList = ({ reminders, journalEntries, loading, error, onEdit }) => {
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

  const combined = [
    ...reminders.map(r => ({ ...r, __type: 'reminder', sortDate: r.dueDate })),
    ...(journalEntries || []).map(j => ({ ...j, __type: 'journal', sortDate: j.date }))
  ].sort((a, b) => new Date(b.sortDate) - new Date(a.sortDate));

  if (combined.length === 0) {
    return (
      <div className="p-16 text-center animate-fade-in">
        <div className="text-6xl mb-4">📭</div>
        <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>No entries yet</h3>
        <p className="max-w-md mx-auto" style={{ color: 'var(--text-tertiary)' }}>
          Add a reminder or journal entry to get started with your productivity journey.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 animate-fade-in">
      <div className="max-w-4xl mx-auto space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
            All Items ({combined.length})
          </h2>
        </div>

        {combined.map((item) => {
          if (item.__type === 'reminder') {
            return <ReminderItem key={item.id} reminder={item} onEdit={onEdit} />;
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
