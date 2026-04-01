import React from 'react';

const SNOOZE_OPTIONS = [
  { label: '15 minutes', value: 15 },
  { label: '30 minutes', value: 30 },
  { label: '1 hour', value: 60 },
  { label: '2 hours', value: 120 },
  { label: '4 hours', value: 240 },
  { label: 'Until tomorrow', value: 1440 },
  { label: 'Custom minutes...', value: 'custom' },
  { label: 'Pick date/time...', value: 'datetime' }
];

const SnoozeSelector = ({ reminderId, onDismiss, onSnooze }) => {
  const [showCustom, setShowCustom] = React.useState(false);
  const [customMinutes, setCustomMinutes] = React.useState(60);
  const [showDateTime, setShowDateTime] = React.useState(false);
  const [customDateTime, setCustomDateTime] = React.useState('');

  const handleSnooze = async (minutes) => {
    try {
      const snoozeUntil = new Date();
      snoozeUntil.setMinutes(snoozeUntil.getMinutes() + minutes);
      await onSnooze(reminderId, snoozeUntil.toISOString());
      onDismiss();
    } catch (error) {
      console.error('Error snoozing reminder:', error);
    }
  };

  const handleDateTimeSnooze = async (dateTimeStr) => {
    try {
      await onSnooze(reminderId, dateTimeStr);
      onDismiss();
    } catch (error) {
      console.error('Error snoozing reminder:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-[var(--bg-elevated)] rounded-box p-6 max-w-sm w-full shadow-lg">
        <h2 className="text-2xl font-bold mb-6 text-base-content">Snooze Reminder</h2>
        
        {!showCustom && !showDateTime ? (
          <div className="space-y-2">
            {SNOOZE_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  if (option.value === 'custom') {
                    setShowCustom(true);
                  } else if (option.value === 'datetime') {
                    setShowDateTime(true);
                  } else {
                    handleSnooze(option.value);
                  }
                }}
                className="w-full px-4 py-3 text-left border border-base-200 rounded-lg hover:bg-base-200 transition-colors text-base-content"
              >
                {option.label}
              </button>
            ))}
          </div>
        ) : null}
        {showCustom && (
          <div>
            <div className="mb-4">
              <label htmlFor="custom-minutes" className="label">
                <span className="label-text font-medium">Snooze for (minutes)</span>
              </label>
              <input
                id="custom-minutes"
                type="number"
                min="1"
                max="1440"
                value={customMinutes}
                onChange={(e) => setCustomMinutes(parseInt(e.target.value) || 60)}
                className="input input-bordered w-full focus:input-primary"
              />
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setShowCustom(false)}
                className="flex-1 btn btn-outline"
              >
                Back
              </button>
              <button
                onClick={() => handleSnooze(customMinutes)}
                className="flex-1 btn btn-primary"
              >
                Snooze
              </button>
            </div>
          </div>
        )}
        {showDateTime && (
          <div>
            <div className="mb-4">
              <label htmlFor="snooze-datetime" className="label">
                <span className="label-text font-medium">Snooze until</span>
              </label>
              <input
                id="snooze-datetime"
                type="datetime-local"
                value={customDateTime}
                onChange={(e) => setCustomDateTime(e.target.value)}
                className="input input-bordered w-full focus:input-primary"
              />
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => {
                  setShowDateTime(false);
                  setCustomDateTime('');
                }}
                className="flex-1 btn btn-outline"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDateTimeSnooze(customDateTime)}
                className="flex-1 btn btn-primary"
              >
                Set
              </button>
            </div>
          </div>
        )}
        
        <button
          onClick={onDismiss}
          className="w-full mt-4 px-4 py-2 text-base-content/60 hover:text-base-content transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default SnoozeSelector;