import React from 'react';
import { Calendar } from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import ReminderIndicator from './ReminderIndicator';

const CalendarView = ({ reminders }) => {
  const [activeDate, setActiveDate] = React.useState(new Date());

  const getRemindersForDate = (date) => {
    return reminders.filter(reminder => {
      const reminderDate = new Date(reminder.dueDate);
      return reminderDate.toDateString() === date.toDateString();
    });
  };

  const tileContent = ({ date, view }) => {
    if (view !== 'month') return null;
    
    const remindersForDay = getRemindersForDate(date);
    if (remindersForDay.length === 0) return null;
    
    return (
      <div className="flex flex-col items-center justify-center">
        <ReminderIndicator count={remindersForDay.length} />
      </div>
    );
  };

  return (
    <div className="p-4">
      <div className="max-w-4xl mx-auto">
        <Calendar
          value={activeDate}
          onChange={setActiveDate}
          tileContent={tileContent}
          className="react-calendar"
          showNavigation={true}
          showWeekNumbers={false}
          minDetail="month"
        />
        
        <div className="mt-6">
          <h3 className="text-xl font-semibold mb-4">Reminders for {activeDate.toLocaleDateString()}</h3>
          {getRemindersForDate(activeDate).map((reminder) => (
            <div key={reminder.id} className="mb-4 p-3 rounded-lg border border-gray-200">
              <h4 className="font-medium">{reminder.title}</h4>
              <p className="text-sm text-gray-600">{reminder.description || 'No description'}</p>
              <p className="text-xs text-gray-500 mt-1">
                {new Date(reminder.dueDate).toLocaleTimeString()}
              </p>
            </div>
          ))}
          {getRemindersForDate(activeDate).length === 0 && (
            <p className="text-gray-500 text-center py-4">No reminders for this date</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CalendarView;