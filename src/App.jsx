import { useState } from 'react';
import { Plus, BookOpen } from 'lucide-react';
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
  const [showAddForm, setShowAddForm] = useState(false);
  const [showAddJournalForm, setShowAddJournalForm] = useState(false);
  const [editingReminder, setEditingReminder] = useState(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200/60 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-accent">
              Numdum
            </h1>
            <div className="flex gap-2">
              {activeTab === 'calendar' && (
                <button
                  onClick={() => setShowAddJournalForm(true)}
                  className="btn-secondary flex items-center gap-2"
                >
                  <BookOpen size={18} />
                  Add Journal
                </button>
              )}
              {activeTab !== 'camera' && (
                <button
                  onClick={() => setShowAddForm(true)}
                  className="btn-primary flex items-center gap-2"
                >
                  <Plus size={18} />
                  New Reminder
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content with bottom padding for nav */}
      <main className="pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto mt-6">
        <div className="animate-fadein">
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
              loading={loading}
              error={error}
              onEdit={setEditingReminder}
            />
          )}
          {activeTab === 'dashboard' && <Dashboard />}
        </div>
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Add Reminder Modal */}
      {showAddForm && (
        <AddReminderForm
          onDismiss={() => setShowAddForm(false)}
          onSubmit={async (data) => {
            await createReminder(data);
            setShowAddForm(false);
          }}
        />
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

      {/* Add Journal Entry Modal */}
      {showAddJournalForm && (
        <AddJournalEntryForm
          onDismiss={() => setShowAddJournalForm(false)}
          onSubmit={async (data) => {
            await addJournalEntry(data);
            setShowAddJournalForm(false);
          }}
          initialDate={activeDate}
        />
      )}
    </div>
  );
}

export default App;
