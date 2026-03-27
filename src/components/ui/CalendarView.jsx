import React from 'react';
import { Calendar } from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import ReminderIndicator from './ReminderIndicator';

const CalendarView = ({ reminders, journalEntries, activeDate, onDateChange }) => {
  const getRemindersForDate = (date) => {
    return reminders.filter(reminder => {
      const reminderDate = new Date(reminder.dueDate);
      return reminderDate.toDateString() === date.toDateString();
    });
  };

  const getJournalForDate = (date) => {
    return journalEntries.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate.toDateString() === date.toDateString();
    }).sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  const tileContent = ({ date, view }) => {
    if (view !== 'month') return null;

    const dayReminders = getRemindersForDate(date);
    const dayJournal = getJournalForDate(date);

    if (dayReminders.length === 0 && dayJournal.length === 0) return null;

    return (
      <div className="flex flex-col items-center justify-center gap-0.5 mt-1">
        {dayReminders.length > 0 && <ReminderIndicator count={dayReminders.length} />}
        {dayJournal.length > 0 && (
          <span className="text-[10px] font-semibold" style={{ color: 'var(--success)' }}>{dayJournal.length}</span>
        )}
      </div>
    );
  };

  const remindersForDay = getRemindersForDate(activeDate);
  const journalForDay = getJournalForDate(activeDate);

  // Custom styling for react-calendar
  const calendarClassName = `react-calendar w-full 
    bg-[var(--bg-elevated)] border border-[var(--border)] rounded-[var(--radius-lg)] 
    shadow-[var(--shadow-sm)] p-4`;

  return (
    <div className="p-4 animate-fade-in">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Calendar */}
        <Calendar
          value={activeDate}
          onChange={onDateChange}
          tileContent={tileContent}
          className={calendarClassName}
          showNavigation={true}
          showWeekNumbers={false}
          minDetail="month"
        />

        {/* Selected Date Section */}
        <div className="animate-slide-up">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>
              {activeDate.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </h3>
            <div className="flex gap-2">
              <span className="px-3 py-1 text-sm font-medium rounded-full" 
                style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>
                {remindersForDay.length} reminders
              </span>
              {journalForDay.length > 0 && (
                <span className="px-3 py-1 text-sm font-medium rounded-full" 
                  style={{ backgroundColor: 'var(--success) + 20', color: 'var(--success)' }}>
                  {journalForDay.length} journal entries
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Journal Entries */}
            {journalForDay.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-lg font-semibold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                  <span>📝</span> Journal Entries
                </h4>
                {journalForDay.map(entry => (
                  <div 
                    key={entry.id} 
                    className="p-4 border border-[var(--border)] rounded-[var(--radius-lg)] 
                             bg-[var(--bg-elevated)] shadow-[var(--shadow-sm)] 
                             hover:shadow-[var(--shadow-md)] transition-shadow duration-300"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-3xl" role="img" aria-label="Mood">{entry.mood}</span>
                      <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
                        {new Date(entry.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-base whitespace-pre-wrap" style={{ color: 'var(--text-primary)' }}>{entry.text}</p>
                    {entry.photos && entry.photos.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {entry.photos.map((photo, idx) => (
                          <img 
                            key={idx} 
                            src={URL.createObjectURL(photo)} 
                            alt={`Journal attachment ${idx + 1}`} 
                            className="w-20 h-20 object-cover rounded-[var(--radius-md)] border border-[var(--border)]"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Reminders */}
            {remindersForDay.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-lg font-semibold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                  <span>⏰</span> Reminders
                </h4>
                {remindersForDay.map(reminder => (
                  <div 
                    key={reminder.id}
                    className="p-4 border border-[var(--border)] rounded-[var(--radius-lg)] 
                             bg-[var(--bg-elevated)] shadow-[var(--shadow-sm)] 
                             hover:shadow-[var(--shadow-md)] transition-shadow duration-300"
                  >
                    <h5 className="font-semibold text-base mb-1" style={{ color: 'var(--text-primary)' }}>
                      {reminder.title}
                    </h5>
                    <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
                      {reminder.description || 'No description'}
                    </p>
                    <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                      <span>🕐</span>
                      <span>{new Date(reminder.dueDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {remindersForDay.length === 0 && journalForDay.length === 0 && (
              <div className="col-span-1 lg:col-span-2 text-center py-12">
                <div className="text-6xl mb-4">📭</div>
                <p className="text-lg" style={{ color: 'var(--text-tertiary)' }}>
                  No entries for this date
                </p>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  Add a reminder or journal entry to get started
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarView;