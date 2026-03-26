import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { usePhotoLibrary } from '../../hooks/usePhotoLibrary';
import ContactPicker from './ContactPicker';
import LocationPicker from './LocationPicker';

const reminderSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  dueDate: z.coerce.date().min(new Date(), 'Due date must be in the future'),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  repeat: z.enum(['never', 'daily', 'weekly', 'monthly', 'yearly']).default('never'),
  details: z.string().optional()
});

const AddReminderForm = ({ onDismiss, onSubmit }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Attachment states
  const [photos, setPhotos] = useState([]); // array of { file, preview }
  const [location, setLocation] = useState(null); // { lat, lng }
  const [contact, setContact] = useState(null); // contact object
  const [showContactPicker, setShowContactPicker] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);

  const { photoLibrary: { openPhotoLibrary } } = usePhotoLibrary();

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(reminderSchema),
    defaultValues: {
      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      priority: 'medium',
      repeat: 'never'
    }
  });

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

  const onSubmitForm = async (data) => {
    setIsSubmitting(true);
    try {
      const payload = {
        ...data,
        photos: photos.map(p => p.file),
        location,
        contact
      };
      await onSubmit(payload);
    } catch (error) {
      console.error('Error creating reminder:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-base-100 rounded-box p-6 max-w-md w-full max-h-[90vh] overflow-y-auto shadow-lg">
        <h2 className="text-2xl font-bold mb-6 text-base-content">Add New Reminder</h2>
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
              {isSubmitting ? 'Creating...' : 'Create Reminder'}
            </button>
          </div>
        </form>

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
      </div>
    </div>
  );
};

export default AddReminderForm;
