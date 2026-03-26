import React, { useState } from 'react';
import { useContacts } from '../../hooks/useContacts';

const ContactsTab = ({ onContactSelected, onReminderCreated }) => {
  const [selectedContact, setSelectedContact] = useState(null);
  const [selectedReminder, setSelectedReminder] = useState(null);
  const [showCreateReminder, setShowCreateReminder] = useState(false);
  const [loading, setLoading] = useState(false);

  const { contacts, loading: contactsLoading, error: contactsError } = useContacts();

  const handleContactClick = (contact) => {
    setSelectedContact(contact);
    onContactSelected(contact);
    setShowCreateReminder(true);
  };

  const handleReminderSubmit = async (data) => {
    if (!selectedContact) return;

    setLoading(true);
    try {
      const reminder = {
        id: Date.now().toString(),
        title: data.title,
        description: data.description,
        dateTime: new Date(data.dateTime),
        priority: data.priority,
        repeat: data.repeat,
        contact: selectedContact.name,
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      onReminderCreated(reminder);
      setSelectedReminder(reminder);
      setShowCreateReminder(false);
    } catch (err) {
      console.error('Failed to create reminder:', err);
    } finally {
      setLoading(false);
    }
  };

  const getContactInitials = (name) => {
    return name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-6 text-base-content">Contacts</h2>

      {/* Status Messages */}
      {contactsError && (
        <div className="bg-error/10 border border-error/20 text-error px-4 py-3 rounded-box mb-4">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{contactsError}</span>
          </div>
        </div>
      )}

      {/* Contact List */}
      {contactsLoading ? (
        <div className="text-center py-8">
          <div className="loading loading-spinner loading-lg mx-auto mb-4"></div>
          <p className="text-base-content/60">Loading contacts...</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 mb-6">
          {contacts.map((contact) => (
            <div
              key={contact.id}
              onClick={() => handleContactClick(contact)}
              className="bg-base-200 rounded-box p-4 border border-base-300 hover:border-primary hover:bg-base-100 cursor-pointer transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center mr-3">
                    <span className="text-primary font-semibold text-sm">
                      {getContactInitials(contact.name)}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-base-content">{contact.name}</p>
                    <p className="text-sm text-base-content/60">{contact.email || contact.phone || 'No contact info'}</p>
                  </div>
                </div>
                <svg className="w-5 h-5 text-base-content/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No Contacts Message */}
      {!contactsLoading && contacts.length === 0 && (
        <div className="text-center py-8">
          <svg className="w-16 h-16 text-base-content/30 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M11 20h2a2 2 0 002-2v-2a3 3 0 00-4.356-1.857M5.5 20h2a2 2 0 002-2v-2a3 3 0 00-4-1.5H5a2 2 0 00-2 2v4a2 2 0 002 2z" />
          </svg>
          <h3 className="text-lg font-semibold mb-2 text-base-content">No Contacts Available</h3>
          <p className="text-base-content/60 mb-4">Person-based reminders will be available here when contacts are accessible.</p>
          <div className="text-sm text-base-content/40">
            This feature requires contact access permissions
          </div>
        </div>
      )}

      {/* Selected Contact Preview */}
      {selectedContact && (
        <div className="bg-primary/10 border border-primary/20 rounded-box p-4 mb-6">
          <h3 className="text-lg font-semibold mb-3 text-base-content">Create Reminder for {selectedContact.name}</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="bg-base-100 rounded-box p-4 border border-base-300">
                <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center mb-3">
                  <span className="text-primary font-semibold text-sm">
                    {getContactInitials(selectedContact.name)}
                  </span>
                </div>
                <p className="font-medium text-base-content">{selectedContact.name}</p>
                {selectedContact.email && (
                  <p className="text-sm text-base-content/60">{selectedContact.email}</p>
                )}
                {selectedContact.phone && (
                  <p className="text-sm text-base-content/60">{selectedContact.phone}</p>
                )}
              </div>
            </div>
            <div>
              <button
                onClick={() => setShowCreateReminder(true)}
                className="w-full btn btn-primary"
              >
                Create Reminder
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contact Summary */}
      <div className="bg-base-200 rounded-box p-4 border border-base-300">
        <h3 className="text-lg font-semibold mb-4 text-base-content">How Person-Based Reminders Work</h3>
        <div className="space-y-3">
          <div className="flex items-start">
            <div className="w-2 h-2 bg-primary rounded-full mt-1.5 mr-3"></div>
            <p className="text-sm text-base-content">
              Select a contact to create a reminder associated with that person
            </p>
          </div>
          <div className="flex items-start">
            <div className="w-2 h-2 bg-primary rounded-full mt-1.5 mr-3"></div>
            <p className="text-sm text-base-content">
              Reminders can be linked to meetings, calls, or tasks related to that contact
            </p>
          </div>
          <div className="flex items-start">
            <div className="w-2 h-2 bg-primary rounded-full mt-1.5 mr-3"></div>
            <p className="text-sm text-base-content">
              View all reminders for a specific contact in one place
            </p>
          </div>
        </div>
      </div>

      {/* Create Reminder Modal */}
      {showCreateReminder && selectedContact && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-base-100 rounded-box p-6 max-w-md w-full max-h-[90vh] overflow-y-auto shadow-lg">
            <h3 className="text-lg font-semibold mb-4 text-base-content">Create Reminder for {selectedContact.name}</h3>
            
            <div className="space-y-4">
              <div>
                <label className="label">
                  <span className="label-text font-medium">Title</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered w-full focus:input-primary"
                  placeholder="Meeting with John"
                />
              </div>
              <div>
                <label className="label">
                  <span className="label-text font-medium">Description</span>
                </label>
                <textarea
                  className="textarea textarea-bordered w-full focus:textarea-primary"
                  rows={3}
                  placeholder="Discuss project timeline and deliverables"
                />
              </div>
              <div>
                <label className="label">
                  <span className="label-text font-medium">Date & Time</span>
                </label>
                <input
                  type="datetime-local"
                  className="input input-bordered w-full focus:input-primary"
                />
              </div>
              <div>
                <label className="label">
                  <span className="label-text font-medium">Priority</span>
                </label>
                <select className="select select-bordered w-full focus:select-primary">
                  <option value="low">Low</option>
                  <option value="medium" selected>Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div>
                <label className="label">
                  <span className="label-text font-medium">Repeat</span>
                </label>
                <select className="select select-bordered w-full focus:select-primary">
                  <option value="never" selected>Never</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCreateReminder(false)}
                className="flex-1 btn btn-outline"
              >
                Cancel
              </button>
              <button
                onClick={handleReminderSubmit}
                disabled={loading}
                className="flex-1 btn btn-primary disabled:btn-disabled"
              >
                {loading ? 'Creating...' : 'Create Reminder'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Message */}
      {selectedReminder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-base-100 rounded-box p-6 max-w-md w-full border border-success/30 shadow-lg">
            <div className="flex items-center mb-4">
              <svg className="w-6 h-6 text-success mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <h3 className="text-lg font-semibold text-base-content">Reminder Created!</h3>
            </div>
            <p className="text-base-content/70 mb-4">
              You've created a reminder for {selectedContact.name}
            </p>
            <button
              onClick={() => {
                setSelectedReminder(null);
                setSelectedContact(null);
              }}
              className="w-full btn btn-primary"
            >
              Continue
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
export default ContactsTab;
