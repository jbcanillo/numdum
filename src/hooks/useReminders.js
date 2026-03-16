import { useState, useEffect } from 'react';
import { db } from '../utils/db';

const useReminders = () => {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReminders = async () => {
      try {
        const reminders = await db.getAllReminders();
        setReminders(reminders);
      } catch (err) {
        setError('Failed to fetch reminders');
      } finally {
        setLoading(false);
      }
    };

    fetchReminders();
  }, []);

  const createReminder = async (reminderData) => {
    try {
      const reminder = await db.createReminder(reminderData);
      setReminders(prev => [...prev, reminder]);
      return reminder;
    } catch (err) {
      throw new Error('Failed to create reminder');
    }
  };

  const updateReminder = async (updatedData) => {
    try {
      const reminder = await db.updateReminder(updatedData);
      setReminders(prev => prev.map(r => r.id === reminder.id ? reminder : r));
      return reminder;
    } catch (err) {
      throw new Error('Failed to update reminder');
    }
  };

  const deleteReminder = async (id) => {
    try {
      await db.deleteReminder(id);
      setReminders(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      throw new Error('Failed to delete reminder');
    }
  };

  const toggleComplete = async (id) => {
    try {
      const reminder = await db.toggleComplete(id);
      setReminders(prev => prev.map(r => r.id === reminder.id ? reminder : r));
      return reminder;
    } catch (err) {
      throw new Error('Failed to toggle reminder');
    }
  };

  return {
    reminders,
    loading,
    error,
    createReminder,
    updateReminder,
    deleteReminder,
    toggleComplete,
  };
};

export function useFilteredReminders(reminders, filter = 'all') {
  switch (filter) {
    case 'completed':
      return reminders?.filter(r => r.completed);
    case 'upcoming':
      return reminders?.filter(r => !r.completed && new Date(r.dueDate) > new Date());
    case 'overdue':
      return reminders?.filter(r => !r.completed && new Date(r.dueDate) < new Date());
    default:
      return reminders;
  }
}

export function useSortedReminders(reminders, sortBy = 'dueDate') {
  const sorted = [...(reminders || [])];

  switch (sortBy) {
    case 'dueDate':
      sorted.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
      break;
    case 'created':
      sorted.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      break;
    case 'completed':
      sorted.sort((a, b) => (a.completed ? 1 : -1));
      break;
    default:
      break;
  }

  return sorted;
}

export { useReminders };