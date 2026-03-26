import React from 'react';
import ReminderItem from './ReminderItem';

const ReminderList = ({ reminders, journalEntries, loading, error, onEdit }) => {
  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="loading loading-spinner loading-lg mx-auto mb-4"></div>
        <p className="text-base-content/60">Loading reminders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-error">Error loading reminders: {error.message}</p>
      </div>
    );
  }

  const combined = [
    ...reminders.map(r => ({ ...r, __type: 'reminder', sortDate: r.dueDate })),
    ...(journalEntries || []).map(j => ({ ...j, __type: 'journal', sortDate: j.date }))
  ].sort((a, b) => new Date(b.sortDate) - new Date(a.sortDate));

  if (combined.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-base-content/60">No entries yet. Add a reminder or journal entry to get started!</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="max-w-4xl mx-auto">
        {combined.map((item) => {
          if (item.__type === 'reminder') {
            return <ReminderItem key={item.id} reminder={item} onEdit={onEdit} />;
          } else {
            return (
              <div key={item.id} className="mb-4 p-3 rounded-box border border-base-200 bg-base-100">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{item.mood}</span>
                    <span className="font-medium text-base-content">📝 Journal</span>
                  </div>
                  <span className="text-xs text-base-content/60">{new Date(item.date).toLocaleDateString()} {new Date(item.date).toLocaleTimeString()}</span>
                </div>
                <p className="text-base-content mt-2 whitespace-pre-wrap">{item.text}</p>
              </div>
            );
          }
        })}
      </div>
    </div>
  );
};

export default ReminderList;
