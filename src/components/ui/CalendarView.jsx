import React from 'react';
import { Calendar } from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import ReminderIndicator from './ReminderIndicator';
import ReminderItem from '../features/ReminderItem';
import { BookOpen, Clock, Calendar as CalendarIcon } from 'lucide-react';

// rebuild
const CalendarView = ({ reminders, journalEntries, activeDate, onDateChange, onComplete, onToggleChecklist, onEditJournal, onDeleteJournal }) => {
  // Month/year dropdowns will update activeDate directly
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const currentYear = activeDate.getFullYear();
  const currentMonth = activeDate.getMonth();

  const handleMonthChange = (e) => {
    const newMonth = parseInt(e.target.value);
    const newDate = new Date(activeDate);
    newDate.setMonth(newMonth);
    // Keep same day, or clamp to last day of month
    const day = Math.min(activeDate.getDate(), new Date(newDate.getFullYear(), newMonth + 1, 0).getDate());
    newDate.setDate(day);
    onDateChange?.(newDate);
  };

  const handleYearChange = (e) => {
    const newYear = parseInt(e.target.value);
    const newDate = new Date(activeDate);
    newDate.setFullYear(newYear);
    // Keep same day, or clamp
    const day = Math.min(activeDate.getDate(), new Date(newYear, activeDate.getMonth() + 1, 0).getDate());
    newDate.setDate(day);
    onDateChange?.(newDate);
  };

  // Generate year range (current year - 5 to + 5)
  const currentYearNow = new Date().getFullYear();
  const years = Array.from({ length: 11 }, (_, i) => currentYearNow - 5 + i);

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
          <div className="w-2 h-2 rounded-full bg-orange-500" title={`${dayJournal.length} journal entries`} />
        )}
      </div>
    );
  };

  const remindersForDay = getRemindersForDate(activeDate);
  const journalForDay = getJournalForDate(activeDate);

  const calendarClassName = `react-calendar w-full
    bg-[var(--bg-elevated)] border border-[var(--border)] rounded-[var(--radius-lg)]
    shadow-[var(--shadow-sm)] p-4`;

  return (
    <div className="p-4 animate-fade-in h-full">
      <div className="h-full flex flex-col lg:flex-row gap-6">
        {/* Calendar Section */}
        <div className="lg:w-1/2">
          <div className="bg-[var(--bg-elevated)] border border-[var(--border)] rounded-[var(--radius-lg)] p-4 shadow-[var(--shadow-sm)] mb-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
              <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                {activeDate.toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric'
                })}
              </h2>
              <div className="flex items-center gap-2">
                <select
                  value={currentMonth}
                  onChange={handleMonthChange}
                  className="px-3 py-2 rounded-[var(--radius-md)] border border-[var(--border)]
                           bg-[var(--bg-elevated)] text-[var(--text-primary)]
                           focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                >
                  {months.map((month, index) => (
                    <option key={index} value={index}>{month}</option>
                  ))}
                </select>
                <select
                  value={currentYear}
                  onChange={handleYearChange}
                  className="px-3 py-2 rounded-[var(--radius-md)] border border-[var(--border)]
                           bg-[var(--bg-elevated)] text-[var(--text-primary)]
                           focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                >
                  {years.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            </div>
            <Calendar
              value={activeDate}
              onChange={onDateChange}
              tileContent={tileContent}
              className={calendarClassName}
              showNavigation={false}
              showWeekNumbers={false}
              minDetail="month"
            />
          </div>
        </div>

        {/* Selected Date Section */}
        <div className="lg:w-1/2 overflow-y-auto max-h-[70vh]">
          <div className="animate-slide-up">
            <div className="flex gap-2 mb-4">
              <span className="px-3 py-1 text-sm font-medium rounded-full" 
                style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>
                {remindersForDay.length} reminders
              </span>
              {journalForDay.length > 0 && (
                <span 
                  className="px-3 py-1 text-sm font-medium rounded-full" 
                  style={{ backgroundColor: '#ffedd5', color: '#c2410c' }}
                >
                  {journalForDay.length} journal {journalForDay.length === 1 ? 'entry' : 'entries'}
                </span>
              )}
            </div>

            <div className="space-y-4">
              {/* Journal Entries */}
              {journalForDay.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-lg font-semibold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                    <BookOpen size={20} /> Journal Entries
                  </h4>
                  {journalForDay.map(entry => (
                    <div
                      key={entry.id}
                      className="p-4 border border-[var(--border)] rounded-[var(--radius-lg)]
                               bg-[var(--bg-elevated)] shadow-[var(--shadow-sm)]
                               hover:shadow-[var(--shadow-md)] transition-shadow duration-300"
                    >
                      <div className="flex items-start">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <span className="text-2xl" role="img" aria-label="Mood">{entry.mood}</span>
                            <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                              <CalendarIcon size={12} />
                              <span>
                                {new Date(entry.date).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </div>
                          </div>
                          <p className="text-sm whitespace-pre-wrap leading-relaxed" style={{ color: 'var(--text-primary)' }}>{entry.text}</p>
                        </div>

                      </div>
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
                    <Clock size={20} /> Reminders
                  </h4>
                  {remindersForDay.map(reminder => (
                    <ReminderItem
                      key={reminder.id}
                      reminder={reminder}
                      onComplete={onComplete}
                      onToggleChecklist={onToggleChecklist}
                      compact={true}
                    />
                  ))}
                </div>
              )}

              {remindersForDay.length === 0 && journalForDay.length === 0 && (
                <div className="text-center py-12">
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
    </div>
  );
};

export default CalendarView;
