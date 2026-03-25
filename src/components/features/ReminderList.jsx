import React from 'react';
import ReminderItem from './ReminderItem';

const ReminderList = ({ reminders, loading, error, onEdit }) => {
  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading reminders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-600">Error loading reminders: {error.message}</p>
      </div>
    );
  }

  if (!reminders || reminders.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-600">No reminders yet. Add one to get started!</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="max-w-4xl mx-auto">
        {combined.map((item) => {
          if (item.__type === 'reminder') {
            return <ReminderItem key={item.id} reminder={item} onEdit={onEdit} />;
          } else {
            // Journal entry card
            return (
              <div key={item.id} className="mb-4 p-3 rounded-lg border-l-4 border-green-500 bg-white shadow-sm">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{item.mood}</span>
                    <span className="font-medium text-gray-900">📝 Journal</span>
                  </div>
                  <span className="text-xs text-gray-500">{new Date(item.date).toLocaleDateString()} {new Date(item.date).toLocaleTimeString()}</span>
                </div>
                <p className="text-gray-800 mt-2 whitespace-pre-wrap">{item.text}</p>
              </div>
            );
          }
        })}
      </div>
    </div>
  );
};

export default ReminderList;
