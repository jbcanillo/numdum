import { useState } from 'react';
import { Plus, BookOpen, ArrowLeft } from 'lucide-react';
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
  const { reminders, loading, error, createReminder, updateReminder } = useReminders();
  const filteredReminders = useFilteredReminders(reminders);
  const sortedReminders = useSortedReminders(filteredReminders);

  const { entries: journalEntries, addEntry: addJournalEntry } = useJournal();

  const [activeDate, setActiveDate] = useState(new Date());
  const [editingReminder, setEditingReminder] = useState(null);
  const [currentPage, setCurrentPage] = useState(null); // 'journal', 'reminder', or null

  const handleAddJournal = () => setCurrentPage('journal');
  const handleAddReminder = () => setCurrentPage('reminder');
  const handleBack = () => setCurrentPage(null);

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
            <div className="flex gap-2">
              <button
                onClick={handleAddJournal}
                className="btn btn-secondary btn-sm flex items-center gap-2 px-4 py-2"
                aria-label="Add journal entry"
              >
                <BookOpen size={18} />
                <span className="hidden sm:inline">Add Journal</span>
              </button>
              <button
                onClick={handleAddReminder}
                className="btn btn-primary btn-sm flex items-center gap-2 px-4 py-2"
                aria-label="Create new reminder"
              >
                <Plus size={18} />
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
              onDismiss={handleBack}
              onSubmit={async (data) => {
                await addJournalEntry(data);
                handleBack();
              }}
              initialDate={activeDate}
            />
          ) : currentPage === 'reminder' ? (
            <AddReminderForm
              onDismiss={handleBack}
              onSubmit={async (data) => {
                await createReminder(data);
                handleBack();
              }}
            />
          ) : (
            <>
              {activeTab === 'calendar' && (
                <CalendarView
                  reminders={sortedReminders}
                  journalEntries={journalEntries}
                  activeDate={activeDate}
                  onDateChange={setActiveDate}
                />
              )}
              {activeTab === 'list' && (
                <ReminderList
                  reminders={sortedReminders}
                  journalEntries={journalEntries}
                  loading={loading}
                  error={error}
                  onEdit={setEditingReminder}
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
