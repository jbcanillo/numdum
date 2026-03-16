import React from 'react';
import { useReminders } from '../hooks/useReminders';

const SNOOZE_OPTIONS = [
  { label: '15 minutes', value: 15 },
  { label: '30 minutes', value: 30 },
  { label: '1 hour', value: 60 },
  { label: '2 hours', value: 120 },
  { label: '4 hours', value: 240 },
  { label: 'Until tomorrow', value: 1440 },
  { label: 'Custom...', value: 'custom' }
];

const SnoozeSelector = ({ reminderId, onDismiss }) => {
  const { snoozeReminder } = useReminders();
  const [showCustom, setShowCustom] = React.useState(false);
  const [customMinutes, setCustomMinutes] = React.useState(60);

  const handleSnooze = async (minutes) => {
    try {
      const snoozeUntil = new Date();
      snoozeUntil.setMinutes(snoozeUntil.getMinutes() + minutes);
      
      await snoozeReminder(reminderId, snoozeUntil.toISOString());
      onDismiss();
    } catch (error) {
      console.error('Error snoozing reminder:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full">
        <h2 className="text-xl font-bold mb-4">Snooze Reminder</h2>
        
        {!showCustom ? (
          <div className="space-y-2">
            {SNOOZE_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  if (option.value === 'custom') {
                    setShowCustom(true);
                  } else {
                    handleSnooze(option.value);
                  }
                }}
                className="w-full px-4 py-3 text-left border rounded-lg hover:bg-gray-50 transition-colors"
              >
                {option.label}
              </button>
            ))}
          </div>
        ) : (
          <div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Snooze for (minutes)
              </label>
              <input
                type="number"
                min="1"
                max="1440"
                value={customMinutes}
                onChange={(e) => setCustomMinutes(parseInt(e.target.value) || 60)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => setShowCustom(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-600 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Back
              </button>
              <button
                onClick={() => handleSnooze(customMinutes)}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Snooze
              </button>
            </div>
          </div>
        )}
        
        <button
          onClick={onDismiss}
          className="w-full mt-4 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default SnoozeSelector;