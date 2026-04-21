// Notification utility for reminder scheduling
import { scheduleReminderNotification } from '../hooks/useNotifications';

class NotificationScheduler {
  constructor() {
    this.scheduledReminders = new Map();
    this.activeIntervals = new Map();
    this.setupNotificationHandlers();
  }

  // Setup handlers for service worker messages
  setupNotificationHandlers() {
    if (typeof window !== 'undefined') {
      window.addEventListener('complete-reminder', this.handleCompleteReminder.bind(this));
      window.addEventListener('snooze-reminder', this.handleSnoozeReminder.bind(this));
    }
  }

  // Handle complete reminder from notification action
  handleCompleteReminder(event) {
    const { reminderId } = event.detail;
    console.log('Completing reminder from notification:', reminderId);
    
    // Dispatch event to the main app
    window.dispatchEvent(new CustomEvent('complete-reminder-app', {
      detail: { reminderId }
    }));
  }

  // Handle snooze reminder from notification action
  handleSnoozeReminder(event) {
    const { reminderId } = event.detail;
    console.log('Snoozing reminder from notification:', reminderId);
    
    // Dispatch event to the main app
    window.dispatchEvent(new CustomEvent('snooze-reminder-app', {
      detail: { reminderId, snoozeUntil: Date.now() + 5 * 60 * 1000 } // 5 minutes
    }));
  }

  // Schedule notifications for a reminder
  scheduleNotifications(reminder) {
    if (!reminder || reminder.completed) {
      return;
    }

    const reminderId = reminder.id;
    const dueDate = new Date(reminder.dueDate);
    const now = new Date();
    const timeUntilDue = dueDate - now;

    // Clear any existing notifications for this reminder
    this.clearNotifications(reminderId);

    if (timeUntilDue <= 0) {
      // Reminder is already due, show immediate notification
      this.showImmediateNotification(reminder);
      return;
    }

    // Schedule notification 5 minutes before due time
    const notificationTime = timeUntilDue - 5 * 60 * 1000;
    
    if (notificationTime > 0) {
      const timeoutId = setTimeout(() => {
        this.showNotification(reminder);
      }, notificationTime);

      this.scheduledReminders.set(reminderId, timeoutId);

      // Also set up periodic checks for reminders that might be missed
      const intervalId = setInterval(() => {
        this.checkAndNotify(reminder);
      }, 60 * 1000); // Check every minute

      this.activeIntervals.set(reminderId, intervalId);
    }
  }

  // Show a notification for a reminder
  async showNotification(reminder) {
    try {
      const success = await scheduleReminderNotification(reminder);
      if (success) {
        console.log('Notification scheduled for reminder:', reminder.id);
      }
    } catch (error) {
      console.error('Failed to show notification:', error);
    }
  }

  // Show immediate notification
  showImmediateNotification(reminder) {
    this.showNotification(reminder);
  }

  // Check if a reminder needs notification and show it
  checkAndNotify(reminder) {
    if (!reminder) return;

    const dueDate = new Date(reminder.dueDate);
    const now = new Date();
    const timeUntilDue = dueDate - now;

    // If reminder is due within next 5 minutes and not completed/snoozed
    if (timeUntilDue > 0 && timeUntilDue <= 5 * 60 * 1000) {
      this.showNotification(reminder);
    }
  }

  // Clear notifications for a reminder
  clearNotifications(reminderId) {
    // Clear scheduled timeout
    const timeoutId = this.scheduledReminders.get(reminderId);
    if (timeoutId) {
      clearTimeout(timeoutId);
      this.scheduledReminders.delete(reminderId);
    }

    // Clear periodic check interval
    const intervalId = this.activeIntervals.get(reminderId);
    if (intervalId) {
      clearInterval(intervalId);
      this.activeIntervals.delete(reminderId);
    }
  }

  // Clear all notifications
  clearAllNotifications() {
    // Clear all scheduled timeouts
    this.scheduledReminders.forEach((timeoutId, reminderId) => {
      clearTimeout(timeoutId);
    });
    this.scheduledReminders.clear();

    // Clear all intervals
    this.activeIntervals.forEach((intervalId, reminderId) => {
      clearInterval(intervalId);
    });
    this.activeIntervals.clear();
  }

  // Update notification schedule when reminder is updated
  updateReminderSchedule(reminder) {
    if (reminder) {
      this.clearNotifications(reminder.id);
      this.scheduleNotifications(reminder);
    }
  }

  // Get notification status for a reminder
  getNotificationStatus(reminderId) {
    const isScheduled = this.scheduledReminders.has(reminderId);
    const isActivelyChecking = this.activeIntervals.has(reminderId);
    
    return {
      isScheduled,
      isActivelyChecking,
      hasActiveNotifications: isScheduled || isActivelyChecking
    };
  }
}

// Create singleton instance
const notificationScheduler = new NotificationScheduler();

export default notificationScheduler;

// Utility function to initialize notification system
export const initializeNotifications = (reminders) => {
  if (Array.isArray(reminders)) {
    reminders.forEach(reminder => {
      if (!reminder.completed) {
        notificationScheduler.scheduleNotifications(reminder);
      }
    });
  }
};

// Utility function to add a reminder to the notification system
export const addNotificationForReminder = (reminder) => {
  if (reminder && !reminder.completed) {
    notificationScheduler.scheduleNotifications(reminder);
  }
};

// Utility function to remove a reminder from the notification system
export const removeNotificationForReminder = (reminderId) => {
  notificationScheduler.clearNotifications(reminderId);
};

// Utility function to update a reminder in the notification system
export const updateNotificationForReminder = (reminder) => {
  notificationScheduler.updateReminderSchedule(reminder);
};