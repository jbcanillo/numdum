// Export utilities for reminder data

/**
 * Convert reminders array to CSV string
 */
export const convertToCSV = (reminders) => {
  if (!reminders || reminders.length === 0) return '';

  const headers = [
    'ID', 'Title', 'Description', 'Due Date', 'Priority', 'Completed',
    'Completed At', 'Snoozed Until', 'Created At', 'Has Photo', 'Has Contact'
  ];

  const rows = reminders.map(r => [
    r.id,
    escapeCSV(r.title),
    escapeCSV(r.description || ''),
    r.dueDate || '',
    r.priority || '',
    r.completed ? 'Yes' : 'No',
    r.completed_at || '',
    r.snoozedUntil || '',
    r.created_at || '',
    r.photo ? 'Yes' : 'No',
    r.contact ? 'Yes' : 'No'
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  return csvContent;
};

/**
 * Escape CSV field for proper formatting
 */
const escapeCSV = (field) => {
  if (field == null) return '';
  const stringField = String(field);
  // Escape quotes and wrap in quotes if contains comma, quote, or newline
  if (stringField.includes(',') || stringField.includes('"') || stringField.includes('\n')) {
    return `"${stringField.replace(/"/g, '""')}"`;
  }
  return stringField;
};

/**
 * Download CSV file
 */
export const exportToCSV = (reminders, filename = 'reminders-export.csv') => {
  const csv = convertToCSV(reminders);
  if (!csv) {
    console.warn('No data to export');
    return;
  }
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Download JSON file
 */
export const exportToJSON = (reminders, filename = 'reminders-export.json') => {
  if (!reminders || reminders.length === 0) {
    console.warn('No data to export');
    return;
  }
  const json = JSON.stringify(reminders, null, 2);
  const blob = new Blob([json], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
