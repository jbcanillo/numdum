import React from 'react';
import { useReminders } from '../../hooks/useReminders';
import { formatDistanceToNow } from 'date-fns';
import SnoozeSelector from './SnoozeSelector';
import EditReminderFormModal from './EditReminderFormModal';

const ReminderItem = ({ reminder, onEdit }) => {
  const { deleteReminder, completeReminder } = useReminders();
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [showSnooze, setShowSnooze] = React.useState(false);
  const [showEdit, setShowEdit] = React.useState(false);

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

  const cardClass = reminder.completed
    ? 'bg-success/10 border border-success/30'
    : reminder.snoozedUntil
    ? 'bg-warning/10 border border-warning/30'
    : 'bg-base-100 border border-base-200 shadow-sm';

  return (
    <div className={`mb-4 p-4 rounded-box ${cardClass}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center mb-2">
            <h3 className="text-lg font-semibold mr-2 text-base-content">{reminder.title}</h3>
            {reminder.priority === 'high' && (
              <span className="px-2 py-1 bg-error/20 text-error text-xs rounded">
                High
              </span>
            )}
          </div>
          <p className="text-base-content/70 text-sm mb-2">{reminder.description}</p>
          <div className="flex items-center justify-between">
            <span className="text-xs text-base-content/50">{timeUntil()}</span>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-primary hover:text-primary-focus text-sm font-medium"
              >
                {isExpanded ? 'Hide' : 'Show'} Details
              </button>
              {reminder.completed && (
                <span className="px-2 py-1 bg-success/20 text-success text-xs rounded">
                  Completed
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2 ml-4">
          <button
            onClick={handleComplete}
            className="btn btn-circle btn-ghost btn-xs text-success"
            title="Complete"
            aria-label="Complete"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </button>
          {onEdit && (
            <button
              onClick={() => setShowEdit(true)}
              className="btn btn-circle btn-ghost btn-xs text-primary"
              title="Edit"
              aria-label="Edit"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          )}
          <button
            onClick={handleDelete}
            className="btn btn-circle btn-ghost btn-xs text-base-content/50"
            title="Delete"
            aria-label="Delete"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v6M4 7h16" />
            </svg>
          </button>
          {reminder.dueDate && !reminder.completed && (
            <button
              onClick={handleSnooze}
              className="btn btn-circle btn-ghost btn-xs text-warning"
              title="Snooze"
              aria-label="Snooze"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="mt-4 p-4 rounded-box bg-base-200 border border-base-300">
          <h4 className="text-sm font-semibold mb-3 text-base-content">Details</h4>
          <div className="space-y-4">
            {reminder.details && (
              <p className="text-sm text-base-content">{reminder.details}</p>
            )}

            {reminder.photos && reminder.photos.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">Photos</p>
                <div className="flex flex-wrap gap-2">
                  {reminder.photos.map((photo, idx) => (
                    <img
                      key={idx}
                      src={URL.createObjectURL(photo)}
                      alt={`Attachment ${idx + 1}`}
                      className="w-20 h-20 object-cover rounded"
                    />
                  ))}
                </div>
              </div>
            )}

            {reminder.location && (
              <div className="text-sm">
                <p className="font-medium">Location</p>
                <a
                  href={`https://www.google.com/maps?q=${reminder.location.lat},${reminder.location.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link link-primary"
                >
                  View Map
                </a>
                <span className="ml-2 text-base-content/70">
                  ({reminder.location.lat.toFixed(5)}, {reminder.location.lng.toFixed(5)})
                </span>
              </div>
            )}

            {reminder.contact && (
              <div className="text-sm">
                <p className="font-medium">Contact</p>
                <p className="text-base-content">{reminder.contact.name}</p>
                {reminder.contact.email && <p className="text-base-content/70">{reminder.contact.email}</p>}
                {reminder.contact.phone && <p className="text-base-content/70">{reminder.contact.phone}</p>}
              </div>
            )}

            {(!reminder.details && !reminder.photos?.length && !reminder.location && !reminder.contact) && (
              <p className="text-sm text-base-content/50 italic">No additional details.</p>
            )}
          </div>
        </div>
      )}

      {showSnooze && (
        <SnoozeSelector
          reminderId={reminder.id}
          onDismiss={() => setShowSnooze(false)}
        />
      )}
      {showEdit && (
        <EditReminderFormModal
          reminder={reminder}
          onDismiss={() => {
            setShowEdit(false);
            if (onEdit) onEdit(null);
          }}
          onSubmit={(data) => {
            if (onEdit) {
              onEdit({ ...reminder, ...data });
            }
          }}
        />
      )}
    </div>
  );
};

export default ReminderItem;
