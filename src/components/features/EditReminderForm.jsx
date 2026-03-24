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
  // Attachment states
  const [photos, setPhotos] = useState([]); // array of { file, preview }
  const [location, setLocation] = useState(null);
  const [contact, setContact] = useState(null);
  const [showContactPicker, setShowContactPicker] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);

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
      const payload = {
        ...reminder,
        ...data,
        photos: photos.map(p => p.file),
        location,
        contact
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
        <label htmlFor="title" className="block text-sm font-medium mb-1">Title *</label>
        <input
          {...register('title')}
          id="title"
          type="text"
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        {errors.title && (
          <p className="text-red-600 text-sm mt-1">{errors.title.message}</p>
        )}
      </div>

      {/* Description */}
      <div className="mb-4">
        <label htmlFor="description" className="block text-sm font-medium mb-1">Description</label>
        <textarea
          {...register('description')}
          id="description"
          rows={3}
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      {/* Due Date */}
      <div className="mb-4">
        <label htmlFor="dueDate" className="block text-sm font-medium mb-1">Due Date *</label>
        <input
          {...register('dueDate')}
          id="dueDate"
          type="datetime-local"
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        {errors.dueDate && (
          <p className="text-red-600 text-sm mt-1">{errors.dueDate.message}</p>
        )}
      </div>

      {/* Priority */}
      <div className="mb-4">
        <label htmlFor="priority" className="block text-sm font-medium mb-1">Priority</label>
        <select
          {...register('priority')}
          id="priority"
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>

      {/* Repeat */}
      <div className="mb-4">
        <label htmlFor="repeat" className="block text-sm font-medium mb-1">Repeat</label>
        <select
          {...register('repeat')}
          id="repeat"
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
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
        <label htmlFor="details" className="block text-sm font-medium mb-1">Additional Details</label>
        <textarea
          {...register('details')}
          id="details"
          rows={3}
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      {/* Photos */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Photos</label>
        <button type="button" onClick={handleAddPhoto} className="btn-secondary">
          Add Photo
        </button>
        {photos.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {photos.map((photo, idx) => (
              <div key={idx} className="relative">
                <img
                  src={photo.preview}
                  alt={`Preview ${idx}`}
                  className="w-16 h-16 object-cover rounded"
                />
                <button
                  type="button"
                  onClick={() => removePhoto(idx)}
                  className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
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
        <label className="block text-sm font-medium mb-1">Contact</label>
        {contact ? (
          <div className="flex items-center justify-between bg-gray-50 p-2 rounded border">
            <div>
              <p className="font-medium">{contact.name}</p>
              <p className="text-sm text-gray-600">{contact.email || contact.phone}</p>
            </div>
            <button
              type="button"
              onClick={() => setContact(null)}
              className="text-red-600 text-sm"
            >
              Remove
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowContactPicker(true)}
            className="btn-secondary"
          >
            Select Contact
          </button>
        )}
      </div>

      {/* Location */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Location</label>
        {location ? (
          <div className="flex items-center justify-between bg-gray-50 p-2 rounded border">
            <div className="text-sm">
              <p>
                Lat: {location.lat.toFixed(5)}, Lng: {location.lng.toFixed(5)}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setLocation(null)}
              className="text-red-600 text-sm"
            >
              Remove
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowLocationPicker(true)}
            className="btn-secondary"
          >
            Pick Location
          </button>
        )}
      </div>

      <div className="flex space-x-4">
        <button
          type="button"
          onClick={onDismiss}
          className="flex-1 px-4 py-2 bg-gray-200 text-gray-600 rounded-lg hover:bg-gray-300 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
