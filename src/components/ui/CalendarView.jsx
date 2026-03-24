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
      <div className="flex flex-col items-center justify-center gap-0.5">
        {dayReminders.length > 0 && <ReminderIndicator count={dayReminders.length} />}
        {dayJournal.length > 0 && <span className="text-[10px] text-green-600 font-bold">{dayJournal.length}</span>}
      </div>
    );
  };

  const remindersForDay = getRemindersForDate(activeDate);
  const journalForDay = getJournalForDate(activeDate);

  return (
    <div className="p-4">
      <div className="max-w-4xl mx-auto">
        <Calendar
          value={activeDate}
          onChange={onDateChange}
          tileContent={tileContent}
          className="react-calendar"
          showNavigation={true}
          showWeekNumbers={false}
          minDetail="month"
        />

        <div className="mt-6">
          <h3 className="text-xl font-semibold mb-4">{activeDate.toLocaleDateString()}</h3>

          {/* Journal Entries */}
          {journalForDay.length > 0 && (
            <div className="mb-6">
              <h4 className="text-lg font-medium mb-2">Journal Entries</h4>
              {journalForDay.map(entry => (
                <div key={entry.id} className="mb-3 p-3 rounded-lg border border-gray-200 bg-gray-50">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-2xl">{entry.mood}</span>
                    <span className="text-sm text-gray-500">{new Date(entry.date).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-gray-800 whitespace-pre-wrap">{entry.text}</p>
                  {entry.photos && entry.photos.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {entry.photos.map((photo, idx) => (
                        <img key={idx} src={URL.createObjectURL(photo)} alt={`Journal attachment ${idx + 1}`} className="w-20 h-20 object-cover rounded" />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Reminders */}
          {remindersForDay.length > 0 && (
            <div>
              <h4 className="text-lg font-medium mb-2">Reminders</h4>
              {remindersForDay.map(reminder => (
                <div key={reminder.id} className="mb-4 p-3 rounded-lg border border-gray-200">
                  <h4 className="font-medium">{reminder.title}</h4>
                  <p className="text-sm text-gray-600">{reminder.description || 'No description'}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(reminder.dueDate).toLocaleTimeString()}
                  </p>
                </div>
              ))}
            </div>
          )}

          {remindersForDay.length === 0 && journalForDay.length === 0 && (
            <p className="text-gray-500 text-center py-4">No entries for this date</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CalendarView;