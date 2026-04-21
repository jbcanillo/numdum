// Service Worker for Push Notifications
const CACHE_NAME = 'numdum-v1';
const urlsToCache = [
  '/',
  '/manifest.json',
  '/favicon.ico'
];

// Install event - cache assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event - serve cached assets
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});

// Background Sync for reminder notifications
self.addEventListener('sync', event => {
  if (event.tag === 'send-notification') {
    event.waitUntil(syncNotifications());
  }
});

// Push notification handler
self.addEventListener('push', event => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: 'reminder',
      data: {
        url: data.url || '/',
        reminderId: data.reminderId
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
      ]
    };

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
  event.notification.close();

  const action = event.action;
  const notificationData = event.notification.data;

  if (action === 'complete') {
    // Send a message to the main thread to complete the reminder
    self.clients.matchAll().then(clientList => {
      if (clientList.length > 0) {
        clientList[0].postMessage({
          type: 'COMPLETE_REMINDER',
          reminderId: notificationData.reminderId
        });
      }
    });
  } else if (action === 'snooze') {
    // Send a message to the main thread to snooze the reminder
    self.clients.matchAll().then(clientList => {
      if (clientList.length > 0) {
        clientList[0].postMessage({
          type: 'SNOOZE_REMINDER',
          reminderId: notificationData.reminderId
        });
      }
    });
  } else if (notificationData && notificationData.url) {
    // Open the app when notification is clicked
    event.waitUntil(
      clients.openWindow(notificationData.url)
    );
  }
});

// Sync notifications function
async function syncNotifications() {
  try {
    // Get reminders that need notifications
    const reminders = await getRemindersNeedingNotification();
    
    for (const reminder of reminders) {
      await scheduleNotification(reminder);
    }
  } catch (error) {
    console.error('Failed to sync notifications:', error);
  }
}

// Mock function to get reminders that need notifications
async function getRemindersNeedingNotification() {
  // This would normally fetch from IndexedDB
  // For now, we'll return an empty array
  // In a real implementation, you'd query for reminders that are:
  // 1. Not completed
  // 2. Not snoozed
  // 3. Due within the next 5 minutes
  // 4. Haven't been notified recently
  return [];
}

// Function to schedule a notification
async function scheduleNotification(reminder) {
  const now = new Date();
  const dueDate = new Date(reminder.dueDate);
  const timeUntilDue = dueDate - now;

  // Only schedule if reminder is due within next 5 minutes
  if (timeUntilDue > 0 && timeUntilDue <= 5 * 60 * 1000) {
    try {
      await self.registration.showNotification('Reminder: ' + reminder.title, {
        body: reminder.description || 'Time to complete your reminder',
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'reminder-' + reminder.id,
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
        ]
      });

      // Mark reminder as notified
      // This would update the reminder in IndexedDB
      console.log('Notification sent for reminder:', reminder.id);
    } catch (error) {
      console.error('Failed to send notification:', error);
    }
  }
}