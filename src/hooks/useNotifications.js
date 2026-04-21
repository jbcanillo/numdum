import { useState, useEffect } from 'react';

export const useNotifications = () => {
  const [permission, setPermission] = useState('default');
  const [supported, setSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    // Check if service workers and notifications are supported
    if ('serviceWorker' in navigator && 'Notification' in window) {
      setSupported(true);
      
      // Check existing permission
      if (Notification.permission === 'granted') {
        setPermission('granted');
        checkSubscription();
      } else if (Notification.permission === 'denied') {
        setPermission('denied');
      }
    }
  }, []);

  const requestPermission = async () => {
    if (!supported) {
      console.log('Notifications not supported');
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      
      if (result === 'granted') {
        await subscribeToNotifications();
      }
      
      return result === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  };

  const checkSubscription = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      setIsSubscribed(!!subscription);
    } catch (error) {
      console.error('Error checking subscription:', error);
    }
  };

  const subscribeToNotifications = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      
      if (!registration.pushManager) {
        console.log('Push manager not available');
        return false;
      }

      // Check if already subscribed
      const existingSubscription = await registration.pushManager.getSubscription();
      if (existingSubscription) {
        setIsSubscribed(true);
        return true;
      }

      // Subscribe to push notifications
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.REACT_APP_VAPID_PUBLIC_KEY || ''
      });

      setIsSubscribed(true);
      
      // Here you would typically send the subscription to your backend
      console.log('Notification subscription:', subscription);
      
      return true;
    } catch (error) {
      console.error('Error subscribing to notifications:', error);
      return false;
    }
  };

  const unsubscribeFromNotifications = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        await subscription.unsubscribe();
        setIsSubscribed(false);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error unsubscribing from notifications:', error);
      return false;
    }
  };

  const scheduleLocalNotification = (title, options = {}) => {
    if (!supported || permission !== 'granted') {
      console.log('Cannot schedule local notification - permission not granted');
      return false;
    }

    try {
      const notification = new Notification(title, {
        body: options.body || '',
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: options.tag || 'reminder',
        data: options.data || {},
        actions: options.actions || [],
        requireInteraction: options.requireInteraction || false,
        timeout: options.timeout || 5000
      });

      if (options.onClose) {
        notification.onclose = options.onClose;
      }

      if (options.onClick) {
        notification.onclick = options.onClick;
      }

      if (options.onError) {
        notification.onerror = options.onError;
      }

      return true;
    } catch (error) {
      console.error('Error scheduling local notification:', error);
      return false;
    }
  };

  const requestNotificationPermissionIfNeeded = async () => {
    if (permission === 'default' && supported) {
      return await requestPermission();
    }
    return permission === 'granted';
  };

  return {
    permission,
    supported,
    isSubscribed,
    requestPermission,
    subscribeToNotifications,
    unsubscribeFromNotifications,
    scheduleLocalNotification,
    requestNotificationPermissionIfNeeded
  };
};

export const scheduleReminderNotification = (reminder) => {
  if (!reminder) return false;

  const dueDate = new Date(reminder.dueDate);
  const now = new Date();
  const timeUntilDue = dueDate - now;

  // Only schedule if reminder is due within next 5 minutes
  if (timeUntilDue > 0 && timeUntilDue <= 5 * 60 * 1000) {
    // Check if notifications are supported and permission is granted
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        const notification = new Notification(`Reminder: ${reminder.title}`, {
          body: reminder.description || 'Time to complete your reminder',
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          tag: `reminder-${reminder.id}`,
          data: {
            reminderId: reminder.id,
            url: '/'
          },
          actions: [
            {
              action: 'complete',
              title: 'Complete',
              icon: '/favicon.ico'
            },
            {
              action: 'snooze',
              title: 'Snooze',
              icon: '/favicon.ico'
            }
          ],
          requireInteraction: true
        });

        return true;
      } catch (error) {
        console.error('Error creating notification:', error);
        return false;
      }
    }
  }

  return false;
};