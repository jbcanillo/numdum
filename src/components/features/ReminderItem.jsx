import React from 'react';
import { useReminders } from '../../hooks/useReminders';
import { formatDistanceToNow } from 'date-fns';
import SnoozeSelector from './SnoozeSelector';

const ReminderItem = ({ reminder, onEdit }) => {
  const { deleteReminder, completeReminder, snoozeReminder } = useReminders();
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [showSnooze, setShowSnooze] = React.useState(false);

  const handleComplete = () => {
    completeReminder(reminder.id);
  };

  const handleDelete = () => {
    deleteReminder(reminder.id);
  };

  const handleSnooze = () => {
    setShowSnooze(true);
  };

  const timeUntil = () => {
    if (reminder.completed) return 'Completed';
    if (reminder.snoozedUntil) {
      return `Snoozed until ${new Date(reminder.snoozedUntil).toLocaleString()}`;
    }
    return formatDistanceToNow(new Date(reminder.dueDate), { addSuffix: true });
  };

  return (
    <div className={`mb-4 p-4 rounded-lg ${
      reminder.completed
        ? 'bg-green-50 border-green-200'
        : reminder.snoozedUntil
        ? 'bg-yellow-50 border-yellow-200'
        : 'bg-white border-gray-200'
    }`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center mb-2">
            <h3 className="text-lg font-semibold mr-2">{reminder.title}</h3>
            {reminder.priority === 'high' && (
              <span className="px-2 py-1 bg-red-100 text-red-600 text-xs rounded">
                High
              </span>
            )}
          </div>
          <p className="text-gray-600 text-sm mb-2">{reminder.description}</p>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">{timeUntil()}</span>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-gray-400 hover:text-gray-600 text-sm"
              >
                {isExpanded ? 'Hide' : 'Show'} Details
              </button>
              {reminder.completed && (
                <span className="px-2 py-1 bg-green-100 text-green-600 text-xs rounded">
                  Completed
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleComplete}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            title="Complete"
          >
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
          {onEdit && (
            <button
              onClick={() => onEdit(reminder)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              title="Edit"
            >
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          )}
          <button
            onClick={handleDelete}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            title="Delete"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v6M4 7h16" />
            </svg>
          </button>
          {reminder.dueDate && !reminder.completed && (
            <button
              onClick={handleSnooze}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              title="Snooze"
            >
              <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          )}
        </div>
      </div>
      {isExpanded && reminder.details && (
        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-semibold mb-2">Details:</h4>
          <p className="text-sm text-gray-700">{reminder.details}</p>
        </div>
      )}
      {showSnooze && (
        <SnoozeSelector
          reminderId={reminder.id}
          onDismiss={() => setShowSnooze(false)}
        />
      )}
    </div>
  );
};

export default ReminderItem;
