import React from 'react';
import { useContacts } from '../../hooks/useContacts';

const ContactPicker = ({ onSelect, onClose }) => {
  const { contacts, loading, error } = useContacts();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[var(--bg-elevated)] rounded-box max-w-md w-full max-h-[80vh] flex flex-col shadow-lg">
        <div className="p-4 border-b border-base-200 flex justify-between items-center">
          <h3 className="text-lg font-medium text-base-content">Select Contact</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-base-content/60 hover:text-base-content text-2xl leading-none"
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="text-center py-8 text-base-content/60">Loading contacts...</div>
          ) : error ? (
            <div className="text-center py-8 text-error">{error}</div>
          ) : contacts.length === 0 ? (
            <div className="text-center py-8 text-base-content/60">No contacts found</div>
          ) : (
            <ul className="space-y-2">
              {contacts.map((contact) => (
                <li
                  key={contact.id}
                  onClick={() => onSelect(contact)}
                  className="p-3 border border-base-200 rounded-box hover:bg-base-200 cursor-pointer flex items-center justify-between"
                >
                  <div>
                    <p className="font-medium text-base-content">{contact.name}</p>
                    <p className="text-sm text-base-content/60">{contact.email || contact.phone}</p>
                  </div>
                  <svg className="w-5 h-5 text-base-content/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContactPicker;
