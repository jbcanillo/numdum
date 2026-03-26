// Database utility for reminder app using IndexedDB
// This is a simplified implementation for demo purposes

let db = null;

const DB_NAME = 'ReminderAppDB';
const DB_VERSION = 3;
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
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
        // Create index for completed status and completed_at for analytics queries
        store.createIndex('by_completed', 'completed', { unique: false });
        store.createIndex('by_completed_at', 'completed_at', { unique: false });
        store.createIndex('by_due_date', 'dueDate', { unique: false });
      } else {
        // Migration: add indexes if missing
        const store = db.objectStore(STORE_NAME);
        if (!store.indexNames.contains('by_completed')) {
          store.createIndex('by_completed', 'completed', { unique: false });
        }
        if (!store.indexNames.contains('by_completed_at')) {
          store.createIndex('by_completed_at', 'completed_at', { unique: false });
        }
        if (!store.indexNames.contains('by_due_date')) {
          store.createIndex('by_due_date', 'dueDate', { unique: false });
        }
      }
      // Create object store for journal entries if it doesn't exist
      const JOURNAL_STORE = 'journal-store';
      if (!db.objectStoreNames.contains(JOURNAL_STORE)) {
        db.createObjectStore(JOURNAL_STORE, { keyPath: 'id' });
      }
    };
  });
};

const getDB = async () => {
  if (!db) {
    await openDatabase();
  }
  return db;
};

// CRUD operations
const getAllReminders = async () => {
  const database = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

const createReminder = async (reminderData) => {
  const database = await getDB();
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
  const database = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    
    const request = store.put(reminderData);

    request.onsuccess = () => resolve(reminderData);
    request.onerror = () => reject(request.error);
  });
};

const deleteReminder = async (id) => {
  const database = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

const toggleComplete = async (id) => {
  const database = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    
    // First get the reminder
    const getRequest = store.get(id);
    
    getRequest.onsuccess = () => {
      const reminder = getRequest.result;
      if (reminder) {
        reminder.completed = !reminder.completed;
        // Set or clear completed_at based on new completed state
        if (reminder.completed) {
          reminder.completed_at = new Date().toISOString();
        } else {
          reminder.completed_at = null;
        }
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

const remindersDB = {
  getAllReminders,
  createReminder,
  updateReminder,
  deleteReminder,
  toggleComplete
};

// Journal entries
export const getAllJournalEntries = async () => {
  const database = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(['journal-store'], 'readonly');
    const store = transaction.objectStore('journal-store');
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const createJournalEntry = async (entry) => {
  const database = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(['journal-store'], 'readwrite');
    const store = transaction.objectStore('journal-store');
    const entryToAdd = {
      ...entry,
      id: entry.id || Date.now().toString(),
      createdAt: new Date(entry.createdAt || Date.now())
    };
    const request = store.add(entryToAdd);
    request.onsuccess = () => resolve(entryToAdd);
    request.onerror = () => reject(request.error);
  });
};

export const updateJournalEntry = async (id, changes) => {
  const database = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(['journal-store'], 'readwrite');
    const store = transaction.objectStore('journal-store');
    const getRequest = store.get(id);
    getRequest.onsuccess = () => {
      const entry = getRequest.result;
      if (!entry) {
        reject(new Error('Entry not found'));
        return;
      }
      const updated = { ...entry, ...changes };
      store.put(updated);
      resolve(updated);
    };
    getRequest.onerror = () => {
      console.error('Update journal entry error:', getRequest.error);
      reject(getRequest.error);
    };
  });
};

export const deleteJournalEntry = async (id) => {
  const database = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(['journal-store'], 'readwrite');
    const store = transaction.objectStore('journal-store');
    const request = store.delete(id);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export default remindersDB;error);
  });
};

export default remindersDB;request.error);
  });
};

export default remindersDB;