export const upsertAlarm = async (reminder) => {
  if (!reminder.dueDate) return;
  const triggerTime = new Date(reminder.dueDate).getTime();
  const sw = await navigator.serviceWorker.ready;
  sw.postMessage({
    type: 'UPSERT_ALARM',
    payload: {
      alarm: {
        id: reminder.id,
        title: reminder.title,
        description: reminder.description || '',
        triggerTime
      }
    }
  });
};

export const deleteAlarm = async (reminderId) => {
  const sw = await navigator.serviceWorker.ready;
  sw.postMessage({
    type: 'DELETE_ALARM',
    payload: { id: reminderId }
  });
};

export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) return 'unsupported';
  const result = await Notification.requestPermission();
  return result;
};
