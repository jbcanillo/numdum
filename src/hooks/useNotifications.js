import { useEffect, useCallback, useState } from 'react';

export const useNotifications = () => {
  const [permission, setPermission] = useState('default');

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async () => {
    if (!('Notification' in window)) {
      return 'unsupported';
    }
    const result = await Notification.requestPermission();
    setPermission(result);
    return result;
  };

  const showNotification = useCallback((title, options = {}) => {
    if (Notification.permission === 'granted') {
      return new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        ...options
      });
    }
    return null;
  }, []);

  const scheduleNotification = useCallback((reminder) => {
    if (!reminder.dueDate || !('serviceWorker' in navigator)) return;
    const due = new Date(reminder.dueDate);
    const now = new Date();
    const delay = due - now;
    if (delay <= 0) return; // overdue or past, skip

    setTimeout(() => {
      showNotification(reminder.title, {
        body: reminder.description || 'Reminder is due',
        requireInteraction: true,
        tag: reminder.id,
        data: { reminderId: reminder.id }
      });
    }, delay);
  }, [showNotification]);

  return { permission, requestPermission, showNotification, scheduleNotification };
};

export default useNotifications;
