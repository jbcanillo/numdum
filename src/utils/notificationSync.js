export const upsertAlarm = async (reminder) => {
  if (!reminder.dueDate) return;
  const triggerTime = new Date(reminder.dueDate).getTime();
  try {
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
  } catch (err) {
    console.warn('Failed to schedule alarm via SW', err);
  }
};

export const deleteAlarm = async (reminderId) => {
  try {
    const sw = await navigator.serviceWorker.ready;
    sw.postMessage({
      type: 'DELETE_ALARM',
      payload: { id: reminderId }
    });
  } catch (err) {
    console.warn('Failed to delete alarm via SW', err);
  }
};

export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) return 'unsupported';
  const result = await Notification.requestPermission();
  return result;
};
