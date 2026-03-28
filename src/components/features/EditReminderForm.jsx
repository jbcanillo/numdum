import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { usePhotoLibrary } from '../../hooks/usePhotoLibrary';
import ContactPicker from './ContactPicker';
import LocationPicker from './LocationPicker';

const editReminderSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  dueDate: z.coerce.date().min(new Date(), 'Due date must be in the future'),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  repeat: z.enum(['never', 'daily', 'weekly', 'monthly', 'yearly']).default('never'),
  details: z.string().optional(),
});

const EditReminderForm = ({ reminder, onDismiss, onSubmit }) => {
  const formatDateTimeLocal = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString().slice(0, 16);
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photos, setPhotos] = useState([]);
  const [location, setLocation] = useState(null);
  const [contact, setContact] = useState(null);
  const [showContactPicker, setShowContactPicker] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [checklist, setChecklist] = useState(reminder.checklist || [{ id: Date.now(), text: '', completed: false }]);

  const { photoLibrary: { openPhotoLibrary } } = usePhotoLibrary();

  // Initialize attachment states from reminder
  useEffect(() => {
    if (reminder) {
      // Photos: if stored as Blob, create preview URLs
      if (reminder.photos && Array.isArray(reminder.photos)) {
        const initialPhotos = reminder.photos.map(photo => ({
          file: photo,
          preview: URL.createObjectURL(photo)
        }));
        setPhotos(initialPhotos);
      } else {
        setPhotos([]);
      }
      setLocation(reminder.location || null);
      setContact(reminder.contact || null);
    }
  }, [reminder]);

  const handleAddPhoto = async () => {
    try {
      const result = await openPhotoLibrary();
      if (result && result.file) {
        const preview = URL.createObjectURL(result.file);
        setPhotos(prev => [...prev, { file: result.file, preview }]);
      }
    } catch (err) {
      console.error('Failed to pick photo:', err);
    }
  };

  const removePhoto = (index) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  // Checklist handlers
  const addChecklistItem = () => {
    setChecklist(prev => [...prev, { id: Date.now(), text: '', completed: false }]);
  };

  const removeChecklistItem = (id) => {
    setChecklist(prev => prev.filter(item => item.id !== id));
  };

  const toggleChecklistItem = (id) => {
    setChecklist(prev => prev.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  const updateChecklistItemText = (id, text) => {
    setChecklist(prev => prev.map(item => 
      item.id === id ? { ...item, text } : item
    ));
  };

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(editReminderSchema),
    defaultValues: {
      title: reminder.title,
      description: reminder.description || '',
      dueDate: formatDateTimeLocal(reminder.dueDate),
      priority: reminder.priority || 'medium',
      repeat: reminder.repeat || 'never',
      details: reminder.details || '',
    },
  });

  const onSubmitForm = async (data) => {
    setIsSubmitting(true);
    try {
      const validChecklist = checklist.filter(item => item.text.trim() !== '');
      const payload = {
        ...reminder,
        ...data,
        photos: photos.map(p => p.file),
        location,
        contact,
        checklist: validChecklist
      };
      await onSubmit(payload);
    } catch (error) {
      console.error('Error updating reminder:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmitForm)}>
      {/* Title */}
      <div className="mb-4">
        <label htmlFor="title" className="label">
          <span className="label-text font-medium">Title *</span>
        </label>
        <input
          {...register('title')}
          id="title"
          type="text"
          className="input input-bordered w-full focus:input-primary"
        />
        {errors.title && (
          <p className="text-error text-sm mt-1">{errors.title.message}</p>
        )}
      </div>

      {/* Description */}
      <div className="mb-4">
        <label htmlFor="description" className="label">
          <span className="label-text font-medium">Description</span>
        </label>
        <textarea
          {...register('description')}
          id="description"
          rows={3}
          className="textarea textarea-bordered w-full focus:textarea-primary"
        />
      </div>

      {/* Due Date */}
      <div className="mb-4">
        <label htmlFor="dueDate" className="label">
          <span className="label-text font-medium">Due Date *</span>
        </label>
        <input
          {...register('dueDate')}
          id="dueDate"
          type="datetime-local"
          className="input input-bordered w-full focus:input-primary"
        />
        {errors.dueDate && (
          <p className="text-error text-sm mt-1">{errors.dueDate.message}</p>
        )}
      </div>

      {/* Priority */}
      <div className="mb-4">
        <label htmlFor="priority" className="label">
          <span className="label-text font-medium">Priority</span>
        </label>
        <select
          {...register('priority')}
          id="priority"
          className="select select-bordered w-full focus:select-primary"
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>

      {/* Repeat */}
      <div className="mb-4">
        <label htmlFor="repeat" className="label">
          <span className="label-text font-medium">Repeat</span>
        </label>
        <select
          {...register('repeat')}
          id="repeat"
          className="select select-bordered w-full focus:select-primary"
        >
          <option value="never">Never</option>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
          <option value="yearly">Yearly</option>
        </select>
      </div>

      {/* Details */}
      <div className="mb-4">
        <label htmlFor="details" className="label">
          <span className="label-text font-medium">Additional Details</span>
        </label>
        <textarea
          {...register('details')}
          id="details"
          rows={3}
          className="textarea textarea-bordered w-full focus:textarea-primary"
        />
      </div>

      {/* Checklist */}
      <div className="mb-4">
        <label className="label">
          <span className="label-text font-medium">Checklist</span>
        </label>
        <div className="space-y-2">
          {checklist.map((item) => (
            <div key={item.id} className="flex items-center gap-2 p-2 rounded-box border border-base-300 bg-base-200">
              <input
                type="checkbox"
                checked={item.completed}
                onChange={() => toggleChecklistItem(item.id)}
                className="rounded border-gray-300 text-[var(--primary)] focus:ring-[var(--primary)]"
              />
              <input
                type="text"
                value={item.text}
                onChange={(e) => updateChecklistItemText(item.id, e.target.value)}
                placeholder="Checklist item..."
                className="flex-1 px-2 py-1 bg-transparent border-none focus:outline-none text-[var(--text-primary)]"
              />
              <button
                type="button"
                onClick={() => removeChecklistItem(item.id)}
                className="text-[var(--error)] hover:text-[var(--error)] px-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
        <button type="button" onClick={addChecklistItem} className="btn btn-secondary btn-sm mt-2">
          Add Item
        </button>
      </div>

      {/* Photos */}
      <div className="mb-4">
        <label className="label">
          <span className="label-text font-medium">Photos</span>
        </label>
        <button type="button" onClick={handleAddPhoto} className="btn btn-secondary btn-sm">
          Add Photo
        </button>
        {photos.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {photos.map((photo, idx) => (
              <div key={idx} className="relative">
                <img
                  src={photo.preview}
                  alt={`Preview ${idx}`}
                  className="w-16 h-16 object-cover rounded-box"
                />
                <button
                  type="button"
                  onClick={() => removePhoto(idx)}
                  className="absolute -top-1 -right-1 btn btn-circle btn-error btn-xs text-white"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Contact */}
      <div className="mb-4">
        <label className="label">
          <span className="label-text font-medium">Contact</span>
        </label>
        {contact ? (
          <div className="flex items-center justify-between bg-base-200 p-3 rounded-box border border-base-300">
            <div>
              <p className="font-medium text-base-content">{contact.name}</p>
              <p className="text-sm text-base-content/60">{contact.email || contact.phone}</p>
            </div>
            <button
              type="button"
              onClick={() => setContact(null)}
              className="btn btn-ghost btn-xs text-error"
            >
              Remove
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowContactPicker(true)}
            className="btn btn-secondary btn-sm"
          >
            Select Contact
          </button>
        )}
      </div>

      {/* Location */}
      <div className="mb-4">
        <label className="label">
          <span className="label-text font-medium">Location</span>
        </label>
        {location ? (
          <div className="flex items-center justify-between bg-base-200 p-3 rounded-box border border-base-300">
            <div className="text-sm text-base-content">
              <p>
                Lat: {location.lat.toFixed(5)}, Lng: {location.lng.toFixed(5)}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setLocation(null)}
              className="btn btn-ghost btn-xs text-error"
            >
              Remove
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowLocationPicker(true)}
            className="btn btn-secondary btn-sm"
          >
            Pick Location
          </button>
        )}
      </div>

      <div className="flex gap-4">
        <button
          type="button"
          onClick={onDismiss}
          className="flex-1 btn btn-outline"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 btn btn-primary disabled:btn-disabled disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Updating...' : 'Update Reminder'}
        </button>
      </div>

      {/* Modals */}
      {showContactPicker && (
        <ContactPicker
          onSelect={(c) => {
            setContact(c);
            setShowContactPicker(false);
          }}
          onClose={() => setShowContactPicker(false)}
        />
      )}

      {showLocationPicker && (
        <LocationPicker
          onConfirm={(loc) => {
            if (loc) setLocation({ lat: loc.lat, lng: loc.lng });
            setShowLocationPicker(false);
          }}
          onCancel={() => setShowLocationPicker(false)}
        />
      )}
    </form>
  );
};

export default EditReminderForm;
