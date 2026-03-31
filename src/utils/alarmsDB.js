import { openDB } from 'idb';

const DB_NAME = 'numdum-alarms';
const STORE_NAME = 'alarms';

export const getAlarmsDB = async () => {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('triggerTime', 'triggerTime');
      }
    }
  });
};

export const addAlarm = async (alarm) => {
  const db = await getAlarmsDB();
  await db.add(STORE_NAME, alarm);
};

export const updateAlarm = async (id, changes) => {
  const db = await getAlarmsDB();
  const alarm = await db.get(STORE_NAME, id);
  if (alarm) {
    await db.put(STORE_NAME, { ...alarm, ...changes });
  }
};

export const deleteAlarm = async (id) => {
  const db = await getAlarmsDB();
  await db.delete(STORE_NAME, id);
};

export const getAllAlarms = async () => {
  const db = await getAlarmsDB();
  return db.getAll(STORE_NAME);
};

export const clearAlarms = async () => {
  const db = await getAlarmsDB();
  await db.clear(STORE_NAME);
};
