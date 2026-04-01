const CACHE_NAME = 'numdum-cache-v1';
const STATIC_ASSETS = ['/', '/index.html', '/manifest.json', '/static/js/', '/static/css/'];

let alarmsDB;
const activeTimers = new Map();

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      alarmsDB = await openAlarmsDB();
      const alarms = await getAllAlarms();
      alarms.forEach(scheduleAlarm);
    })()
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request).catch(() => caches.match('/index.html')))
  );
});

self.addEventListener('message', (event) => {
  const { type, payload } = event.data || {};
  if (type === 'UPSERT_ALARM') {
    return handleUpsertAlarm(payload.alarm);
  }
  if (type === 'DELETE_ALARM') {
    return handleDeleteAlarm(payload.id);
  }
  if (type === 'TEST_NOTIFICATION') {
    return handleTestNotification();
  }
});

self.addEventListener('notificationclick', (event) => {
  const { action, reminderId } = event.notification.data || {};
  event.notification.close();

  if (action && action.startsWith('snooze-')) {
    const minutes = parseInt(action.split('-')[1], 10);
    const newTrigger = Date.now() + minutes * 60000;
    getAlarm(reminderId).then(alarm => {
      const updated = { ...alarm, triggerTime: newTrigger };
      upsertAlarmToDB(updated).then(() => {
        scheduleAlarm(updated);
        self.registration.showNotification('Snoozed', {
          body: `Reminder snoozed for ${minutes} minutes`,
          icon: '/favicon.ico'
        });
      });
    });
  } else {
    event.waitUntil(
      self.clients.matchAll().then(clients => {
        if (clients.length > 0) return clients[0].focus();
        return self.clients.openWindow('/');
      })
    );
  }
});

function handleTestNotification() {
  self.registration.showNotification('Test', {
    body: 'Test notification from service worker',
    icon: '/favicon.ico',
    badge: '/favicon.ico'
  });
}

function openAlarmsDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open('numdum-alarms', 1);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains('alarms')) db.createObjectStore('alarms', { keyPath: 'id' });
    };
    req.onsuccess = (e) => resolve(e.target.result);
    req.onerror = (e) => reject(e.target.error);
  });
}

function getAllAlarms() {
  return new Promise((resolve, reject) => {
    const tx = alarmsDB.transaction('alarms', 'readonly');
    const store = tx.objectStore('alarms');
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function getAlarm(id) {
  return new Promise((resolve, reject) => {
    const tx = alarmsDB.transaction('alarms', 'readonly');
    const store = tx.objectStore('alarms');
    const req = store.get(id);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function upsertAlarmToDB(alarm) {
  return new Promise((resolve, reject) => {
    const tx = alarmsDB.transaction('alarms', 'readwrite');
    const store = tx.objectStore('alarms');
    store.put(alarm);
    tx.oncomplete = () => resolve(alarm);
    tx.onerror = () => reject(tx.error);
  });
}

function deleteAlarmFromDB(id) {
  return new Promise((resolve, reject) => {
    const tx = alarmsDB.transaction('alarms', 'readwrite');
    const store = tx.objectStore('alarms');
    store.delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function handleUpsertAlarm(alarm) {
  await upsertAlarmToDB(alarm);
  if (activeTimers.has(alarm.id)) {
    clearTimeout(activeTimers.get(alarm.id));
    activeTimers.delete(alarm.id);
  }
  scheduleAlarm(alarm);
}

async function handleDeleteAlarm(id) {
  await deleteAlarmFromDB(id);
  if (activeTimers.has(id)) {
    clearTimeout(activeTimers.get(id));
    activeTimers.delete(id);
  }
}

function scheduleAlarm(alarm) {
  const now = Date.now();
  const delay = alarm.triggerTime - now;
  if (delay <= 0) {
    triggerNow(alarm);
    return;
  }
  const timerId = setTimeout(() => {
    triggerNow(alarm);
    activeTimers.delete(alarm.id);
    deleteAlarmFromDB(alarm.id);
  }, delay);
  activeTimers.set(alarm.id, timerId);
}

function triggerNow(alarm) {
  self.registration.showNotification(alarm.title || 'Reminder', {
    body: alarm.description || 'Your reminder is due!',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: alarm.id,
    requireInteraction: true,
    actions: [
      { action: 'snooze-10', title: 'Snooze 10 min' },
      { action: 'snooze-60', title: 'Snooze 1 hr' }
    ],
    data: { reminderId: alarm.id }
  });
}
