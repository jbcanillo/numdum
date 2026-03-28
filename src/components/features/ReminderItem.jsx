import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Clock, Calendar as CalendarIcon } from 'lucide-react';
import SnoozeSelector from './SnoozeSelector';

const ReminderItem = ({ reminder, onEdit, onComplete, onDelete, onToggleChecklist, compact = false, showExpandButton = false }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showSnooze, setShowSnooze] = useState(false);

  const handleComplete = () => {
    if (onComplete) {
      onComplete(reminder.id);
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(reminder.id);
    }
  };

  const handleSnooze = () => {
    setShowSnooze(true);
  };

  const handleToggleChecklist = (itemId) => {
    if (onToggleChecklist) {
      onToggleChecklist(reminder.id, itemId);
    }
  };

  const timeUntil = () => {
    if (reminder.completed) return 'Completed';
    if (reminder.snoozedUntil) {
      return `Snoozed until ${new Date(reminder.snoozedUntil).toLocaleString()}`;
    }
    return formatDistanceToNow(new Date(reminder.dueDate), { addSuffix: true });
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#ef4444'; // red-500
      case 'medium': return '#f59e0b'; // amber-500
      case 'low': return '#6366f1'; // indigo-500
      default: return 'var(--text-tertiary)';
    }
  };

  const getStatusStyle = () => {
    if (reminder.completed) {
      return 'border border-[var(--border)] bg-[var(--bg-elevated)] opacity-75';
    }
    if (reminder.snoozedUntil) {
      return 'border-l-4 border-[var(--warning)] bg-[var(--bg-elevated)]';
    }
    return 'border border-[var(--border)] bg-[var(--bg-elevated)] shadow-[var(--shadow-sm)]';
  };

  // Determine completion button icon based on completed state
  const CompletionIcon = reminder.completed ? (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  ) : (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );

  return (
    <div 
      className={`mb-4 p-4 rounded-[var(--radius-lg)] transition-all duration-300 hover:shadow-[var(--shadow-md)] animate-fade-in ${getStatusStyle()}`}
      style={{ animationDelay: `${Math.random() * 0.1}s` }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <Clock size={16} style={{ color: 'var(--text-tertiary)' }} />
            <h3 className="text-lg font-semibold leading-tight" style={{ color: 'var(--text-primary)' }}>
              {reminder.title}
            </h3>
            {reminder.priority === 'high' && (
              <span 
                className="px-2 py-0.5 text-xs font-semibold rounded-full"
                style={{ 
                  backgroundColor: getPriorityColor('high') + '20',
                  color: getPriorityColor('high'),
                  border: '1px solid ' + getPriorityColor('high') + '40'
                }}
              >
                High
              </span>
            )}
            {reminder.priority === 'medium' && (
              <span 
                className="px-2 py-0.5 text-xs font-semibold rounded-full"
                style={{ 
                  backgroundColor: getPriorityColor('medium') + '20',
                  color: getPriorityColor('medium'),
                  border: '1px solid ' + getPriorityColor('medium') + '40'
                }}
              >
                Medium
              </span>
            )}
            {reminder.priority === 'low' && (
              <span 
                className="px-2 py-0.5 text-xs font-semibold rounded-full"
                style={{ 
                  backgroundColor: getPriorityColor('low') + '20',
                  color: getPriorityColor('low'),
                  border: '1px solid ' + getPriorityColor('low') + '40'
                }}
              >
                Low
              </span>
            )}
          </div>
          {reminder.dueDate && (
            <div className="flex items-center gap-2 text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              <CalendarIcon size={12} />
              <span>
                {new Date(reminder.dueDate).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
          )}
          {reminder.description && (
            <p className="text-sm mb-3 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              {reminder.description}
            </p>
          )}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="text-xs font-medium px-2 py-1 rounded" 
              style={{ 
                backgroundColor: 'var(--bg-tertiary)', 
                color: reminder.completed ? 'var(--success)' : 'var(--text-muted)' 
              }}>
              {reminder.completed ? '✓ Completed' : timeUntil()}
            </span>
            {(!compact || showExpandButton) && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-sm font-medium transition-colors px-2 py-1 rounded"
                style={{ 
                  color: 'var(--primary)',
                  backgroundColor: 'var(--primary-light)'
                }}
                aria-expanded={isExpanded}
              >
                {isExpanded ? 'Hide Details' : 'Show Details'}
              </button>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={handleComplete}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300
                     border-2 hover:scale-110
                     ${reminder.completed 
                       ? 'bg-[var(--success)] border-[var(--success)] text-white' 
                       : 'bg-[var(--bg-elevated)] border-[var(--success)] text-[var(--success)] hover:bg-[var(--success)]/10'}`}
            title={reminder.completed ? 'Mark as incomplete' : 'Mark as complete'}
            aria-label={reminder.completed ? 'Mark reminder as incomplete' : 'Mark reminder as complete'}
          >
            {CompletionIcon}
          </button>
          
          {!compact && onEdit && (
            <button
              onClick={() => onEdit(reminder)}
              className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300
                       border-2 hover:scale-110
                       bg-[var(--primary)]/10 border-[var(--primary)] text-[var(--primary)]"
              title="Edit reminder"
              aria-label="Edit reminder"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          )}

          {!compact && (
            <button
              onClick={handleDelete}
              className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300
                       border-2 hover:scale-110
                       border-[var(--error)] text-[var(--error)] bg-[var(--error)]/10 hover:bg-[var(--error)]/20"
              title="Delete reminder"
              aria-label="Delete reminder"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v6M4 7h16" />
              </svg>
            </button>
          )}

          {!compact && reminder.dueDate && !reminder.completed && (
            <button
              onClick={handleSnooze}
              className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300
                       border-2 hover:scale-110
                       bg-[#8b5cf6]/10 border-[#8b5cf6] text-[#8b5cf6] hover:bg-[#8b5cf6]/20"
              title="Snooze reminder"
              aria-label="Snooze reminder"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="mt-4 p-4 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg-tertiary)] animate-slide-up">
          <h4 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <span>📋</span> Details
          </h4>
          <div className="space-y-4">
            {reminder.details && (
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{reminder.details}</p>
            )}

            {reminder.photos && reminder.photos.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2" style={{ color: 'var(--text-tertiary)' }}>Photos</p>
                <div className="flex flex-wrap gap-2">
                  {reminder.photos.map((photo, idx) => (
                    <img
                      key={idx}
                      src={URL.createObjectURL(photo)}
                      alt={`Attachment ${idx + 1}`}
                      className="w-20 h-20 object-cover rounded-[var(--radius-md)] border border-[var(--border)]"
                    />
                  ))}
                </div>
              </div>
            )}

            {reminder.location && (
              <div className="text-sm">
                <p className="font-medium mb-1" style={{ color: 'var(--text-tertiary)' }}>Location</p>
                <a
                  href={`https://www.google.com/maps?q=${reminder.location.lat},${reminder.location.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm font-medium"
                  style={{ color: 'var(--primary)' }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  View on Map
                </a>
                <span className="ml-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                  ({reminder.location.lat.toFixed(5)}, {reminder.location.lng.toFixed(5)})
                </span>
              </div>
            )}

            {reminder.contact && (
              <div className="text-sm">
                <p className="font-medium mb-1" style={{ color: 'var(--text-tertiary)' }}>Contact</p>
                <p style={{ color: 'var(--text-primary)' }}>{reminder.contact.name}</p>
                {reminder.contact.email && <p style={{ color: 'var(--text-secondary)' }}>{reminder.contact.email}</p>}
                {reminder.contact.phone && <p style={{ color: 'var(--text-secondary)' }}>{reminder.contact.phone}</p>}
              </div>
            )}

            {reminder.checklist && reminder.checklist.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2" style={{ color: 'var(--text-tertiary)' }}>Checklist</p>
                <ul className="space-y-2">
                  {reminder.checklist.map((item) => (
                    <li key={item.id} className="flex items-start gap-2">
                      <input
                        type="checkbox"
                        checked={item.completed}
                        onChange={() => handleToggleChecklist(item.id)}
                        className="mt-1 rounded border-gray-300 text-[var(--primary)] focus:ring-[var(--primary)] cursor-pointer"
                      />
                      <span className={`text-sm ${item.completed ? 'line-through text-[var(--text-muted)]' : 'text-[var(--text-primary)]'}`}>
                        {item.text}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {(!reminder.details && !reminder.photos?.length && !reminder.location && !reminder.contact && !reminder.checklist?.length) && (
              <p className="text-sm italic" style={{ color: 'var(--text-muted)' }}>No additional details.</p>
            )}
          </div>
        </div>
      )}

      {/* Snooze Modal */}
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
