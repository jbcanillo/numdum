import { useState } from 'react';
import { useReminders } from './hooks/useReminders';
import { useFilteredReminders } from './hooks/useReminders';
import { useSortedReminders } from './hooks/useReminders';
import { useReminderForm } from './hooks/useReminderForm';
import CalendarView from './components/ui/CalendarView';
import ReminderList from './components/features/ReminderList';
import AddReminderForm from './components/features/AddReminderForm';
import CameraTab from './components/features/CameraTab';
import ContactsTab from './components/features/ContactsTab';
import BottomNavigation from './components/layout/BottomNavigation';

function App() {
  const [activeTab, setActiveTab] = useState('calendar');
  const { reminders, loading, error } = useReminders();
  const filteredReminders = useFilteredReminders(reminders);
  const sortedReminders = useSortedReminders(filteredReminders);

  const [showAddForm, setShowAddForm] = useState(false);
const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
const [selectedContact, setSelectedContact] = useState<any>(null);

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
          />
        )}
        {activeTab === 'camera' && (
          <CameraTab
            onPhotoSelected={(photo) => setSelectedPhoto(photo)}
            onPhotoFromLibrary={(photo) => setSelectedPhoto(photo)}
          />
        )}
        {activeTab === 'dashboard' && (
          <div className="p-4">
            <h2 className="text-xl font-semibold mb-4">Dashboard - Coming Soon</h2>
            <p className="text-gray-600">Analytics and metrics will be available here.</p>
          </div>
        )}
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
    </div>
  );
}

export default App;