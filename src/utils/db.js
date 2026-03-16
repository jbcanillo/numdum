// Database utility for reminder app using IndexedDB
// This is a simplified implementation for demo purposes

let db = null;

const DB_NAME = 'ReminderAppDB';
const DB_VERSION = 1;
const STORE_NAME = 'reminders';

const openDatabase = () => {
  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(request.error);
    };

    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = () => {
      db = request.result;
      // Create object store for reminders
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
      }
    };
  });
};

const getDatabase = async () => {
  if (!db) {
    await openDatabase();
  }
  return db;
};

// CRUD operations
const getAllReminders = async () => {
  const database = await getDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

const createReminder = async (reminderData) => {
  const database = await getDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    
    const reminder = {
      ...reminderData,
      id: Date.now(), // Simple ID generation
      created_at: new Date().toISOString(),
      completed: false
    };

    const request = store.add(reminder);

    request.onsuccess = () => resolve(reminder);
    request.onerror = () => reject(request.error);
  });
};

const updateReminder = async (reminderData) => {
  const database = await getDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    
    const request = store.put(reminderData);

    request.onsuccess = () => resolve(reminderData);
    request.onerror = () => reject(request.error);
  });
};

const deleteReminder = async (id) => {
  const database = await getDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

const toggleComplete = async (id) => {
  const database = await getDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    
    // First get the reminder
    const getRequest = store.get(id);
    
    getRequest.onsuccess = () => {
      const reminder = getRequest.result;
      if (reminder) {
        reminder.completed = !reminder.completed;
        const updateRequest = store.put(reminder);
        
        updateRequest.onsuccess = () => resolve(reminder);
        updateRequest.onerror = () => reject(updateRequest.error);
      } else {
        reject(new Error('Reminder not found'));
      }
    };
    
    getRequest.onerror = () => reject(getRequest.error);
  });
};

export default {
  getAllReminders,
  createReminder,
  updateReminder,
  deleteReminder,
  toggleComplete
};