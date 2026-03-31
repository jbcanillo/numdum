import React, { useState } from 'react';
import remindersDB from '../../utils/db';
import { createJournalEntry, deleteAllJournalEntries } from '../../utils/db';
import { downloadBackup, restoreFromFile } from '../../utils/backupRestore';
import { useReminders } from '../../hooks/useReminders';
import { useJournal } from '../../hooks/useJournal';

const BackupRestorePage = ({ mode = 'backup', onBack, onToast }) => {
  const { reminders } = useReminders();
  const { entries: journalEntries } = useJournal();

  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [restoreFile, setRestoreFile] = useState(null);
  const [confirmRestore, setConfirmRestore] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [backupSuccess, setBackupSuccess] = useState(false);
  const [restoreSuccess, setRestoreSuccess] = useState(false);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setRestoreFile(e.target.files[0]);
    }
  };

  const performBackup = async () => {
    if (!password) {
      setPasswordError('Password is required');
      return;
    }
    if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return;
    }
    setProcessing(true);
    try {
      const backupData = {
        version: 1,
        exportedAt: new Date().toISOString(),
        reminders,
        journal: journalEntries || []
      };
      downloadBackup(backupData, password);
      setBackupSuccess(true);
      setPassword('');
      if (onToast) onToast('Backup created successfully', 'success');
    } catch (error) {
      setPasswordError('Backup failed: ' + error.message);
      if (onToast) onToast('Backup failed: ' + error.message, 'error');
    } finally {
      setProcessing(false);
    }
  };

  const performRestore = async () => {
    if (!password) {
      setPasswordError('Password is required');
      return;
    }
    if (!restoreFile) {
      setPasswordError('Please select a backup file');
      return;
    }
    setProcessing(true);
    try {
      const data = await restoreFromFile(restoreFile, password);
      if (!data.reminders || !Array.isArray(data.reminders)) {
        throw new Error('Invalid backup format');
      }
      setConfirmRestore(true);
    } catch (error) {
      setPasswordError('Restore failed: ' + error.message);
      if (onToast) onToast('Restore failed: ' + error.message, 'error');
    } finally {
      setProcessing(false);
    }
  };

  const confirmAndRestore = async () => {
    if (!restoreFile) return;
    setProcessing(true);
    try {
      const data = await restoreFromFile(restoreFile, password);

      await Promise.all([
        remindersDB.deleteAllReminders(),
        deleteAllJournalEntries()
      ]);

      for (const r of data.reminders) {
        await remindersDB.createReminder(r);
      }

      for (const j of (data.journal || [])) {
        await createJournalEntry(j);
      }

      setRestoreSuccess(true);
      setConfirmRestore(false);
      if (onToast) onToast('Restore completed successfully', 'success');
      setTimeout(() => {
        if (onBack) onBack();
        else window.location.reload();
      }, 1500);
    } catch (error) {
      setPasswordError('Restore failed: ' + error.message);
      if (onToast) onToast('Restore failed: ' + error.message, 'error');
      setConfirmRestore(false);
    } finally {
      setProcessing(false);
    }
  };

  const title = mode === 'backup' ? 'Backup Your Data' : 'Restore from Backup';
  const description = mode === 'backup'
    ? 'Enter a password to encrypt your backup file. You will need this password to restore.'
    : 'Select your encrypted backup file and enter the password used to create it.';

  return (
    <div className="min-h-screen p-4 sm:p-6 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>{title}</h1>
      <p className="text-sm text-[var(--text-tertiary)] mb-6">{description}</p>

      {confirmRestore ? (
        <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--bg-elevated)] p-6 space-y-4">
          <p className="text-[var(--text-secondary)]">
            This will <strong>replace all existing reminders and journal entries</strong> with the data from the backup file. This action cannot be undone.
          </p>
          <div className="flex gap-3 justify-end">
            <button
              onClick={() => setConfirmRestore(false)}
              className="btn btn-ghost btn-sm"
              disabled={processing}
            >
              Cancel
            </button>
            <button
              onClick={confirmAndRestore}
              className="btn btn-warning btn-sm"
              disabled={processing}
            >
              {processing ? 'Restoring...' : 'Yes, Replace All'}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {mode === 'restore' && (
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                Backup File
              </label>
              <div className="relative">
                <input
                  id="backup-file-input"
                  type="file"
                  accept=".json.enc,.enc"
                  onChange={handleFileChange}
                  className="sr-only"
                />
                <label
                  htmlFor="backup-file-input"
                  className="flex items-center justify-center w-full px-4 py-3 rounded-lg border-2 border-dashed border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text-primary)] cursor-pointer hover:border-[var(--primary)] hover:bg-[var(--bg-tertiary)] transition-colors"
                >
                  {restoreFile ? restoreFile.name : 'Choose file…'}
                </label>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setPasswordError('');
              }}
              placeholder="Enter password"
              className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            />
            {passwordError && (
              <p className="text-sm text-[var(--error)] mt-1">{passwordError}</p>
            )}
          </div>

          <div className="flex gap-3 justify-end">
            <button
              onClick={onBack}
              className="btn btn-ghost btn-sm"
              disabled={processing}
            >
              Cancel
            </button>
            <button
              onClick={mode === 'backup' ? performBackup : performRestore}
              className="btn btn-primary btn-sm"
              disabled={processing}
            >
              {processing
                ? (mode === 'backup' ? 'Backing up...' : 'Verifying...')
                : (mode === 'backup' ? 'Download Backup' : 'Continue')}
            </button>
          </div>
        </div>
      )}

      {(backupSuccess || restoreSuccess) && (
        <div className="mt-6 p-4 rounded-lg bg-[var(--success)]/20 border border-[var(--success)] text-[var(--success)] text-center">
          {backupSuccess ? 'Backup downloaded!' : 'Restore complete!'}
        </div>
      )}
    </div>
  );
};

export default BackupRestorePage;
