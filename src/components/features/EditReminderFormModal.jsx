import React from 'react';
import EditReminderForm from './EditReminderForm';

const EditReminderFormModal = ({ reminder, onDismiss, onSubmit }) => {
  const [showForm, setShowForm] = React.useState(true);

  const handleDismiss = () => {
    setShowForm(false);
    onDismiss();
  };

  const handleSubmit = async (data) => {
    try {
      await onSubmit(data);
      handleDismiss();
    } catch (error) {
      console.error('Error updating reminder:', error);
    }
  };

  if (!showForm) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Edit Reminder</h2>
        <EditReminderForm
          reminder={reminder}
          onDismiss={handleDismiss}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
};

export default EditReminderFormModal;