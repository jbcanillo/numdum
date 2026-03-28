import { useState, useEffect } from 'react'; // rebuild
import { Clock, BookOpen, ArrowLeft, Sun, Moon } from 'lucide-react';
import { useReminders } from './hooks/useReminders';
import { useFilteredReminders } from './hooks/useReminders';
import { useSortedReminders } from './hooks/useReminders';
import { useJournal } from './hooks/useJournal';
import CalendarView from './components/ui/CalendarView';
import ReminderList from './components/features/ReminderList';
import AddReminderForm from './components/features/AddReminderForm';
import EditReminderFormModal from './components/features/EditReminderFormModal';
import Dashboard from './components/features/Dashboard';
import AddJournalEntryForm from './components/features/AddJournalEntryForm';
import BottomNavigation from './components/layout/BottomNavigation';

function App() {
  const [activeTab, setActiveTab] = useState('calendar');
  const [darkMode, setDarkMode] = useState(() => {
    // Check system preference or localStorage
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('darkMode');
      if (saved) return JSON.parse(saved);
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  const { reminders, loading, error, createReminder, updateReminder, deleteReminder, completeReminder } = useReminders();
  const filteredReminders = useFilteredReminders(reminders);
  const sortedReminders = useSortedReminders(filteredReminders);

  const { entries: journalEntries, addEntry: addJournalEntry, editEntry: editJournalEntry, removeEntry: removeJournalEntry } = useJournal();

  const [activeDate, setActiveDate] = useState(new Date());
  const [editingReminder, setEditingReminder] = useState(null);
  const [editingJournal, setEditingJournal] = useState(null);
  const [currentPage, setCurrentPage] = useState(null); // 'journal', 'reminder', or null

  // Toggle dark mode and update DOM
  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(prev => !prev);
  };

  const handleAddJournal = () => { setEditingJournal(null); setCurrentPage('journal'); };
  const handleAddReminder = () => setCurrentPage('reminder');
  const handleBack = () => setCurrentPage(null);

  // Reminder action handlers
  const handleEditReminder = (reminder) => {
    setEditingReminder(reminder);
  };

  const handleDeleteReminder = async (id) => {
    await deleteReminder(id);
    setEditingReminder(null);
  };

  const handleCompleteReminder = async (id) => {
    await completeReminder(id);
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

  // Journal action handlers
  const handleEditJournal = (entry) => {
    setEditingJournal(entry);
    setCurrentPage('journal');
  };

  const handleDeleteJournal = async (id) => {
    await removeJournalEntry(id);
    setEditingJournal(null);
  };

  return (
    <div className="app-container min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-[var(--bg-elevated)] border-b border-[var(--border)] shadow-sm">
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
              <h1 className="text-2xl font-bold" style={{ color: 'var(--primary)', letterSpacing: '-0.03em' }}>
                Numdum
              </h1>
            </div>
            <div className="flex items-center gap-2">
              {/* Dark Mode Toggle */}
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

      {/* Main Content */}
      <main className="pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto mt-6">
        <div className="animate-fade-in">
          {currentPage === 'journal' ? (
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
            />
          ) : currentPage === 'reminder' ? (
            <AddReminderForm
              onDismiss={handleBack}
              onSubmit={async (data) => {
                await createReminder(data);
                handleBack();
              }}
              asPage={true}
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
                />
              )}
              {activeTab === 'dashboard' && <Dashboard />}
            </>
          )}
        </div>
      </main>

      {/* Bottom Navigation */}
      {!currentPage && (
        <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      )}

      {/* Edit Reminder Modal */}
      {editingReminder && (
        <EditReminderFormModal
          reminder={editingReminder}
          onDismiss={() => setEditingReminder(null)}
          onSubmit={async (data) => {
            await updateReminder({ ...editingReminder, ...data });
            setEditingReminder(null);
          }}
        />
      )}
    </div>
  );
}

export default App;
