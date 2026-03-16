import React from 'react';
import { useReminders } from '../hooks/useReminders';
import ReminderItem from './ReminderItem';

const ReminderList = ({ reminders, loading, error }) => {
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
        {reminders.map((reminder) => (
          <ReminderItem key={reminder.id} reminder={reminder} />
        ))}
      </div>
    </div>
  );
};

export default ReminderList;