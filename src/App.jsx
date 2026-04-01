import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Clock, BookOpen, ArrowLeft, Sun, Moon, Bell, Download } from 'lucide-react';
import { ToastProvider, useToast } from './components/ui/Toast';
import { useReminders } from './hooks/useReminders';
import { useFilteredReminders } from './hooks/useReminders';
import { useSortedReminders } from './hooks/useReminders';
import { useJournal } from './hooks/useJournal';
import CalendarView from './components/ui/CalendarView';
import ReminderList from './components/features/ReminderList';
import AddReminderForm from './components/features/AddReminderForm';
import EditReminderFormModal from './components/features/EditReminderFormModal';
import Stat from './components/features/Stat';
import AddJournalEntryForm from './components/features/AddJournalEntryForm';
import BottomNavigation from './components/layout/BottomNavigation';
import BackupRestorePage from './components/features/BackupRestorePage';
import { upsertAlarm, deleteAlarm, requestNotificationPermission } from './utils/notificationSync';

function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();

  // PWA install
  const [deferInstall, setDeferInstall] = useState(null);
  const [showInstallButton, setShowInstallButton] = useState(false);
  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferInstall(e);
      setShowInstallButton(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);
  const handleInstallClick = async () => {
    if (!deferInstall) return;
    deferInstall.prompt();
    const { outcome } = await deferInstall.userChoice;
    console.log('Install outcome:', outcome);
    setDeferInstall(null);
    setShowInstallButton(false);
  };

  // Derive activeTab from route path
  const getTabFromPath = (path) => {
    if (path === '/' || path === '') return 'calendar';
    const tab = path.replace(/^\//, '');
    return ['calendar', 'list', 'stat'].includes(tab) ? tab : 'calendar';
  };

  const activeTab = getTabFromPath(location.pathname);
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('darkMode');
      if (saved) return JSON.parse(saved);
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  const { reminders, loading, error, createReminder, updateReminder, deleteReminder, completeReminder, snoozeReminder } = useReminders();
  const filteredReminders = useFilteredReminders(reminders);
  const sortedReminders = useSortedReminders(filteredReminders);

  const { entries: journalEntries, addEntry: addJournalEntry, editEntry: editJournalEntry, removeEntry: removeJournalEntry } = useJournal();

  const [activeDate, setActiveDate] = useState(new Date());
  const [editingReminder, setEditingReminder] = useState(null);
  const [editingJournal, setEditingJournal] = useState(null);
  const [currentPage, setCurrentPage] = useState(null);

  const handleTabChange = (tabId) => {
    setCurrentPage(null);
    navigate(`/${tabId}`);
  };

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  // Sync alarms when reminders change
  useEffect(() => {
    const sync = async () => {
      if (!reminders || reminders.length === 0) return;
      for (const r of reminders) {
        if (r.completed) {
          await deleteAlarm(r.id);
        } else {
          await upsertAlarm(r);
        }
      }
    };
    sync();
  }, [reminders]);

  const toggleDarkMode = () => {
    setDarkMode(prev => !prev);
  };

  const handleAddJournal = () => { setEditingJournal(null); setCurrentPage('journal'); };
  const handleAddReminder = () => setCurrentPage('reminder');
  const handleOpenBackup = () => setCurrentPage({ type: 'backup-restore', mode: 'backup' });
  const handleOpenRestore = () => setCurrentPage({ type: 'backup-restore', mode: 'restore' });
  const handleBack = () => setCurrentPage(null);

  const handleEditReminder = (reminder) => {
    setEditingReminder(reminder);
  };

  const handleDeleteReminder = async (id) => {
    await deleteReminder(id);
    await deleteAlarm(id);
    setEditingReminder(null);
    toast.addToast('Reminder deleted', 'success');
  };

  const enableNotifications = async () => {
    const result = await requestNotificationPermission();
    if (result === 'granted') {
      toast.addToast('Notifications enabled', 'success');
      setTimeout(() => {
        if (Notification.permission === 'granted') {
          try {
            new Notification('Test', { body: 'Permission works!', icon: '/favicon.ico' });
          } catch (e) {
            console.error('Test notification failed:', e);
          }
        }
      }, 500);
    } else {
      toast.addToast('Notifications not enabled', 'error');
    }
  };

  useEffect(() => {
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferInstall(e);
      setShowInstallButton(true);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const testNotification = () => {
    console.log('testNotification clicked, permission:', Notification.permission, 'SW controller:', !!navigator.serviceWorker.controller);
    if (Notification.permission === 'granted') {
      try {
        new Notification('Test Notification', {
          body: 'This is a test from Numdum',
          icon: '/favicon.ico'
        });
        toast.addToast('Test notification sent', 'success');
      } catch (err) {
        console.error('Notification error:', err);
        toast.addToast('Failed to show notification: ' + err.message, 'error');
      }
    } else {
      toast.addToast('Notifications not granted', 'error');
    }
  };

  const handleCompleteReminder = async (id) => {
    const reminder = reminders.find(r => r.id === id);
    const wasCompleted = reminder?.completed;
    await completeReminder(id);
    toast.addToast(wasCompleted ? 'Reminder marked undone' : 'Reminder completed', 'success');
  };

  const handleToggleChecklist = async (reminderId, itemId) => {
    const reminder = reminders.find(r => r.id === reminderId);
    if (reminder && reminder.checklist) {
      const updatedChecklist = reminder.checklist.map(item =>
        item.id === itemId ? { ...item, completed: !item.completed } : item
      );
      await updateReminder({ ...reminder, checklist: updatedChecklist });
    }
  };

  const handleSnooze = async (id, snoozedUntil) => {
    await snoozeReminder(id, snoozedUntil);
  };

  const handleEditJournal = (entry) => {
    setEditingJournal(entry);
    setCurrentPage('journal');
  };

  const handleDeleteJournal = async (id) => {
    await removeJournalEntry(id);
    setEditingJournal(null);
    toast.addToast('Journal entry deleted', 'success');
  };

  return (
    <div className="app-container min-h-screen">
      <header className="sticky top-0 z-30 glass border-b border-[var(--border)] shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              {currentPage && (
                <button
                  onClick={handleBack}
                  className="btn btn-ghost btn-sm flex items-center gap-2"
                  aria-label="Go back"
                >
                  <ArrowLeft size={18} />
                  <span className="hidden sm:inline">Back</span>
                </button>
              )}
              <h1 className="text-2xl font-bold" style={{
                background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                color: 'transparent',
                letterSpacing: '-0.03em'
              }}>Numdum</h1>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={toggleDarkMode}
                className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300
                         border-2 border-[var(--border)] hover:scale-110
                         bg-[var(--bg-elevated)] text-[var(--text-primary)]"
                title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {darkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              {'Notification' in window && Notification.permission !== 'granted' && (
                <button
                  onClick={enableNotifications}
                  className="btn btn-outline btn-sm flex items-center gap-2 px-4 py-2"
                  aria-label="Enable notifications"
                >
                  <Bell size={18} />
                  <span className="hidden sm:inline">Enable Notifications</span>
                </button>
              )}
              {'Notification' in window && Notification.permission === 'granted' && (
                <button
                  onClick={testNotification}
                  className="btn btn-outline btn-sm flex items-center gap-2 px-4 py-2"
                  aria-label="Test notification"
                >
                  Test Notif
                </button>
              )}
              {showInstallButton && (
                <button
                  onClick={handleInstallClick}
                  className="btn btn-primary btn-sm flex items-center gap-2 px-4 py-2"
                  aria-label="Install app"
                >
                  <Download size={18} />
                  <span className="hidden sm:inline">Install</span>
                </button>
              )}
              <button
                onClick={handleAddJournal}
                className="btn btn-secondary btn-sm flex items-center gap-2 px-4 py-2"
                aria-label="New journal entry"
              >
                <BookOpen size={18} />
                <span className="hidden sm:inline">New Journal</span>
              </button>
              <button
                onClick={handleAddReminder}
                className="btn btn-primary btn-sm flex items-center gap-2 px-4 py-2"
                aria-label="Create new reminder"
              >
                <Clock size={18} />
                <span className="hidden sm:inline">New Reminder</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto mt-6">
        <div className="animate-fade-in">
          {currentPage && typeof currentPage === 'object' && currentPage.type === 'backup-restore' ? (
            <BackupRestorePage
              mode={currentPage.mode}
              onBack={handleBack}
              onToast={toast.addToast}
            />
          ) : currentPage === 'journal' ? (
            <AddJournalEntryForm
              entry={editingJournal}
              onDismiss={handleBack}
              onSubmit={async (data) => {
                if (editingJournal) {
                  await editJournalEntry(editingJournal.id, data);
                } else {
                  await addJournalEntry(data);
                }
                handleBack();
              }}
              initialDate={activeDate}
              asPage={true}
              onToast={toast.addToast}
            />
          ) : currentPage === 'reminder' ? (
            <AddReminderForm
              onDismiss={handleBack}
              onSubmit={async (data) => {
                await createReminder(data);
                handleBack();
              }}
              asPage={true}
              onToast={toast.addToast}
            />
          ) : (
            <>
              {activeTab === 'calendar' && (
                <CalendarView
                  reminders={sortedReminders}
                  journalEntries={journalEntries}
                  activeDate={activeDate}
                  onDateChange={setActiveDate}
                  onComplete={handleCompleteReminder}
                  onToggleChecklist={handleToggleChecklist}
                  onEditJournal={handleEditJournal}
                  onDeleteJournal={handleDeleteJournal}
                />
              )}
              {activeTab === 'list' && (
                <ReminderList
                  reminders={sortedReminders}
                  journalEntries={journalEntries}
                  loading={loading}
                  error={error}
                  onEdit={handleEditReminder}
                  onComplete={handleCompleteReminder}
                  onDelete={handleDeleteReminder}
                  onToggleChecklist={handleToggleChecklist}
                  onEditJournal={handleEditJournal}
                  onDeleteJournal={handleDeleteJournal}
                  onSnooze={handleSnooze}
                />
              )}
              {activeTab === 'stat' && <Stat onOpenBackup={handleOpenBackup} onOpenRestore={handleOpenRestore} />}
            </>
          )}
        </div>
      </main>

      {!currentPage && (
        <BottomNavigation activeTab={activeTab} onTabChange={handleTabChange} />
      )}

      {editingReminder && (
        <EditReminderFormModal
          reminder={editingReminder}
          onDismiss={() => setEditingReminder(null)}
          onSubmit={async (data) => {
            await updateReminder({ ...editingReminder, ...data });
            setEditingReminder(null);
          }}
          onToast={toast.addToast}
        />
      )}
    </div>
  );
}

function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}

export default App;
