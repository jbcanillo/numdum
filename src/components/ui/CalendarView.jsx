import React from 'react';
import { Calendar } from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import ReminderIndicator from './ReminderIndicator';

const CalendarView = ({ reminders, journalEntries, activeDate, onDateChange, onComplete, onEdit, onDelete }) => {
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
                    className={`p-4 border rounded-[var(--radius-lg)] 
                             bg-[var(--bg-elevated)] shadow-[var(--shadow-sm)] 
                             hover:shadow-[var(--shadow-md)] transition-shadow duration-300
                             ${reminder.completed ? 'border-[var(--success)]/30 bg-[var(--success)]/5' : 'border-[var(--border)]'}`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h5 className="font-semibold text-base" style={{ color: 'var(--text-primary)' }}>
                            {reminder.title}
                          </h5>
                          {reminder.priority === 'high' && (
                            <span 
                              className="px-2 py-0.5 text-xs font-semibold rounded-full"
                              style={{ 
                                backgroundColor: 'var(--error) + 15',
                                color: 'var(--error)'
                              }}
                            >
                              High
                            </span>
                          )}
                        </div>
                        <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
                          {reminder.description || 'No description'}
                        </p>
                        <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                          <span>🕐</span>
                          <span>{new Date(reminder.dueDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          {reminder.completed && (
                            <span className="px-2 py-0.5 rounded" style={{ backgroundColor: 'var(--success) + 15', color: 'var(--success)' }}>
                              ✓ Completed
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          onClick={() => onComplete?.(reminder.id)}
                          className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300
                                   border-2 hover:scale-110
                                   bg-[var(--success)]/10 border-[var(--success)] text-[var(--success)]"
                          title={reminder.completed ? 'Mark as incomplete' : 'Mark as complete'}
                          aria-label={reminder.completed ? 'Mark reminder as incomplete' : 'Mark reminder as complete'}
                        >
                          {reminder.completed ? (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          )}
                        </button>
                        {onEdit && (
                          <button
                            onClick={() => onEdit(reminder)}
                            className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300
                                     border-2 hover:scale-110
                                     bg-[var(--primary)]/10 border-[var(--primary)] text-[var(--primary)]"
                            title="Edit reminder"
                            aria-label="Edit reminder"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                        )}
                        {onDelete && (
                          <button
                            onClick={() => onDelete(reminder.id)}
                            className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300
                                     border-2 hover:scale-110 hover:bg-[var(--error)]/10
                                     border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--error)] hover:text-[var(--error)]"
                            title="Delete reminder"
                            aria-label="Delete reminder"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v6M4 7h16" />
                            </svg>
                          </button>
                        )}
                        {!reminder.completed && (
                          <button
                            onClick={() => {/* Snooze handled in ReminderItem; maybe not here */}}
                            className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300
                                     border-2 hover:scale-110
                                     bg-[var(--warning)]/10 border-[var(--warning)] text-[var(--warning)]"
                            title="Snooze not available in calendar view"
                            aria-label="Snooze not available"
                            disabled
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </button>
                        )}
                      </div>
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