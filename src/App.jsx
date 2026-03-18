import { useState } from 'react';
import { useReminders } from './hooks/useReminders';
import { useFilteredReminders } from './hooks/useReminders';
import { useSortedReminders } from './hooks/useReminders';
import CalendarView from './components/ui/CalendarView';
import ReminderList from './components/features/ReminderList';
import AddReminderForm from './components/features/AddReminderForm';
import EditReminderFormModal from './components/features/EditReminderFormModal';
import CameraTab from './components/features/CameraTab';
import ContactsTab from './components/features/ContactsTab';
import Dashboard from './components/features/Dashboard';
import BottomNavigation from './components/layout/BottomNavigation';

function App() {
  const [activeTab, setActiveTab] = useState('calendar');
  const { reminders, loading, error, createReminder, updateReminder } = useReminders();
  const filteredReminders = useFilteredReminders(reminders);
  const sortedReminders = useSortedReminders(filteredReminders);

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingReminder, setEditingReminder] = useState(null);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [selectedContact, setSelectedContact] = useState(null);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-gray-900">Reminders</h1>
            {activeTab !== 'camera' && (
              <button
                onClick={() => setShowAddForm(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                + New Reminder
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {activeTab === 'calendar' && (
          <CalendarView reminders={sortedReminders} />
        )}
        {activeTab === 'list' && (
          <ReminderList
            reminders={sortedReminders}
            loading={loading}
            error={error}
            onEdit={setEditingReminder}
          />
        )}
        {activeTab === 'camera' && (
          <CameraTab
            onPhotoSelected={(photo) => setSelectedPhoto(photo)}
            onPhotoFromLibrary={(photo) => setSelectedPhoto(photo)}
          />
        )}
        {activeTab === 'dashboard' && <Dashboard />}
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
    </div>
  );
}

export default App;
