import React, { useState, useEffect } from 'react';
import { useContacts } from '../hooks/useContacts';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Reminder } from '../types';

interface ContactsTabProps {
  onContactSelected: (contact: Contact) => void;
  onReminderCreated: (reminder: Reminder) => void;
}

export const ContactsTab: React.FC<ContactsTabProps> = ({ onContactSelected, onReminderCreated }) => {
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [selectedReminder, setSelectedReminder] = useState<Reminder | null>(null);
  const [showCreateReminder, setShowCreateReminder] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { contacts, loading: contactsLoading, error: contactsError } = useContacts();

  const handleContactClick = (contact: Contact) => {
    setSelectedContact(contact);
    onContactSelected(contact);
    setShowCreateReminder(true);
  };

  const handleReminderSubmit = async (data: any) => {
    if (!selectedContact) return;

    setLoading(true);
    setError(null);

    try {
      const reminder: Reminder = {
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
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const getContactInitials = (name: string) => {
    return name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-6">Contacts</h2>

      {/* Status Messages */}
      {contactsError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
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
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading contacts...</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 mb-6">
          {contacts.map((contact) => (
            <div
              key={contact.id}
              onClick={() => handleContactClick(contact)}
              className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-blue-400 hover:bg-white cursor-pointer transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-blue-600 font-semibold text-sm">
                      {getContactInitials(contact.name)}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium">{contact.name}</p>
                    <p className="text-sm text-gray-600">{contact.email || contact.phone || 'No contact info'}</p>
                  </div>
                </div>
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M11 20h2a2 2 0 002-2v-2a3 3 0 00-4.356-1.857M5.5 20h2a2 2 0 002-2v-2a3 3 0 00-4-1.5H5a2 2 0 00-2 2v4a2 2 0 002 2z" />
          </svg>
          <h3 className="text-lg font-semibold mb-2">No Contacts Available</h3>
          <p className="text-gray-600 mb-4">Person-based reminders will be available here when contacts are accessible.</p>
          <div className="text-sm text-gray-400">
            This feature requires contact access permissions
          </div>
        </div>
      )}

      {/* Selected Contact Preview */}
      {selectedContact && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-semibold mb-3">Create Reminder for {selectedContact.name}</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                  <span className="text-blue-600 font-semibold text-sm">
                    {getContactInitials(selectedContact.name)}
                  </span>
                </div>
                <p className="font-medium">{selectedContact.name}</p>
                {selectedContact.email && (
                  <p className="text-sm text-gray-600">{selectedContact.email}</p>
                )}
                {selectedContact.phone && (
                  <p className="text-sm text-gray-600">{selectedContact.phone}</p>
                )}
              </div>
            </div>
            <div>
              <button
                onClick={() => setShowCreateReminder(true)}
                className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Reminder
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contact Summary */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-4">How Person-Based Reminders Work</h3>
        <div className="space-y-3">
          <div className="flex items-start">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-1 mr-3"></div>
            <p className="text-sm text-gray-700">
              Select a contact to create a reminder associated with that person
            </p>
          </div>
          <div className="flex items-start">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-1 mr-3"></div>
            <p className="text-sm text-gray-700">
              Reminders can be linked to meetings, calls, or tasks related to that contact
            </p>
          </div>
          <div className="flex items-start">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-1 mr-3"></div>
            <p className="text-sm text-gray-700">
              View all reminders for a specific contact in one place
            </p>
          </div>
        </div>
      </div>

      {/* Create Reminder Modal */}
      {showCreateReminder && selectedContact && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Create Reminder for {selectedContact.name}</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Meeting with John"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Discuss project timeline and deliverables"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Date & Time</label>
                <input
                  type="datetime-local"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Priority</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="low">Low</option>
                  <option value="medium" selected>Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Repeat</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
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
                className="flex-1 bg-gray-300 text-gray-700 font-bold py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleReminderSubmit}
                disabled={loading}
                className="flex-1 bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Reminder'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Message */}
      {selectedReminder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full border border-green-200">
            <div className="flex items-center mb-4">
              <svg className="w-6 h-6 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <h3 className="text-lg font-semibold">Reminder Created!</h3>
            </div>
            <p className="text-gray-600 mb-4">
              You've created a reminder for {selectedContact.name}
            </p>
            <button
              onClick={() => {
                setSelectedReminder(null);
                setSelectedContact(null);
              }}
              className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Continue
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Mock contact interface
interface Contact {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  avatar?: string;
}