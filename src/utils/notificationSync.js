export const upsertAlarm = async (reminder) => {
  if (!reminder.dueDate && !reminder.snoozedUntil) return;
  let triggerTime;
  if (reminder.snoozedUntil && new Date(reminder.snoozedUntil) > new Date()) {
    triggerTime = new Date(reminder.snoozedUntil).getTime();
  } else if (reminder.dueDate) {
    triggerTime = new Date(reminder.dueDate).getTime();
  } else {
    return;
  }
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
    console.log('Alarm upsert message sent to SW for', reminder.id, 'trigger', new Date(triggerTime).toISOString());
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
