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
      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div 
        className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-[var(--radius-lg)] 
                   border border-[var(--border)] shadow-[var(--shadow-lg)] 
                   bg-[var(--bg-elevated)] animate-scale-in"
      >
        <div className="p-6 border-b border-[var(--border)]">
          <h2 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Add New Reminder
          </h2>
        </div>
        
        <form onSubmit={handleSubmit(onSubmitForm)} className="p-6 space-y-5">
          {/* Title */}
          <div className="mb-5">
            <label htmlFor="title" className="block mb-2">
              <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}">Title *</span>
            </label>
            <input
              {...register('title')}
              id="title"
              type="text"
              className="w-full px-4 py-2.5 rounded-[var(--radius-md)] border border-[var(--border)] 
                       bg-[var(--bg-elevated)] text-[var(--text-primary)] 
                       focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent
                       transition-all duration-200 placeholder-[var(--text-muted)]"
              placeholder="What do you need to remember?"
              style={{ boxShadow: 'var(--inner)' }}
            />
            {errors.title && (
              <p className="text-sm mt-1.5" style={{ color: 'var(--error)' }}>{errors.title.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="mb-5">
            <label htmlFor="description" className="block mb-2">
              <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}">Description</span>
            </label>
            <textarea
              {...register('description')}
              id="description"
              rows={3}
              className="w-full px-4 py-2.5 rounded-[var(--radius-md)] border border-[var(--border)] 
                       bg-[var(--bg-elevated)] text-[var(--text-primary)] 
                       focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent
                       transition-all duration-200 resize-none"
              placeholder="Add a brief description (optional)"
              style={{ boxShadow: 'var(--inner)' }}
            />
          </div>

          {/* Due Date */}
          <div className="mb-5">
            <label htmlFor="dueDate" className="block mb-2">
              <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}">Due Date & Time *</span>
            </label>
            <input
              {...register('dueDate')}
              id="dueDate"
              type="datetime-local"
              className="w-full px-4 py-2.5 rounded-[var(--radius-md)] border border-[var(--border)] 
                       bg-[var(--bg-elevated)] text-[var(--text-primary)] 
                       focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent
                       transition-all duration-200"
              style={{ boxShadow: 'var(--inner)' }}
            />
            {errors.dueDate && (
              <p className="text-sm mt-1.5" style={{ color: 'var(--error)' }}">{errors.dueDate.message}</p>
            )}
          </div>

          {/* Priority */}
          <div className="mb-5">
            <label htmlFor="priority" className="block mb-2">
              <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}">Priority</span>
            </label>
            <div className="relative">
              <select
                {...register('priority')}
                id="priority"
                className="w-full px-4 py-2.5 rounded-[var(--radius-md)] border border-[var(--border)] 
                         bg-[var(--bg-elevated)] text-[var(--text-primary)] 
                         focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent
                         transition-all duration-200 appearance-none cursor-pointer"
                style={{ boxShadow: 'var(--inner)' }}
              >
                <option value="low" style={{ color: 'var(--primary)' }}>Low</option>
                <option value="medium" style={{ color: 'var(--warning)' }}>Medium</option>
                <option value="high" style={{ color: 'var(--error)' }}>High</option>
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" style={{ color: 'var(--text-muted)' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Repeat */}
          <div className="mb-5">
            <label htmlFor="repeat" className="block mb-2">
              <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}">Repeat</span>
            </label>
            <div className="relative">
              <select
                {...register('repeat')}
                id="repeat"
                className="w-full px-4 py-2.5 rounded-[var(--radius-md)] border border-[var(--border)] 
                         bg-[var(--bg-elevated)] text-[var(--text-primary)] 
                         focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent
                         transition-all duration-200 appearance-none cursor-pointer"
                style={{ boxShadow: 'var(--inner)' }}
              >
                <option value="never">Never</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" style={{ color: 'var(--text-muted)' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="mb-5">
            <label htmlFor="details" className="block mb-2">
              <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}">Additional Details</span>
            </label>
            <textarea
              {...register('details')}
              id="details"
              rows={3}
              className="w-full px-4 py-2.5 rounded-[var(--radius-md)] border border-[var(--border)] 
                       bg-[var(--bg-elevated)] text-[var(--text-primary)] 
                       focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent
                       transition-all duration-200 resize-none"
              placeholder="Any extra notes, links, or instructions..."
              style={{ boxShadow: 'var(--inner)' }}
            />
          </div>

          {/* Photos */}
          <div className="mb-5">
            <label className="block mb-2">
              <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}">Photos</span>
            </label>
            <button
              type="button"
              onClick={handleAddPhoto}
              className="mb-3 px-4 py-2 rounded-[var(--radius-md)] text-sm font-medium
                       border border-[var(--border)] transition-all duration-200
                       hover:bg-[var(--primary-light)] hover:border-[var(--primary)]
                       text-[var(--text-primary)]"
            >
              + Add Photo
            </button>
            {photos.length > 0 && (
              <div className="flex flex-wrap gap-3">
                {photos.map((photo, idx) => (
                  <div key={idx} className="relative group">
                    <img
                      src={photo.preview}
                      alt={`Preview ${idx}`}
                      className="w-20 h-20 object-cover rounded-[var(--radius-md)] border border-[var(--border)]"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(idx)}
                      className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center
                               bg-[var(--error)] text-white opacity-90 hover:opacity-100
                               transition-opacity duration-200 text-sm font-bold"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Contact */}
          <div className="mb-5">
            <label className="block mb-2">
              <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}">Contact</span>
            </label>
            {contact ? (
              <div className="p-3 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg-tertiary)] animate-fade-in">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium" style={{ color: 'var(--text-primary)' }}">{contact.name}</p>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{contact.email || contact.phone}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setContact(null)}
                    className="px-3 py-1 rounded text-sm font-medium
                             border border-[var(--error)] text-[var(--error)] 
                             hover:bg-[var(--error)] hover:text-white transition-colors duration-200"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowContactPicker(true)}
                className="w-full px-4 py-2.5 rounded-[var(--radius-md)] text-sm font-medium
                         border border-[var(--border)] transition-all duration-200
                         hover:bg-[var(--bg-tertiary)] hover:border-[var(--primary)]
                         text-[var(--text-primary)]"
              >
                Select Contact
              </button>
            )}
          </div>

          {/* Location */}
          <div className="mb-6">
            <label className="block mb-2">
              <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}">Location</span>
            </label>
            {location ? (
              <div className="p-3 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg-tertiary)] animate-fade-in">
                <div className="flex items-center justify-between">
                  <div className="text-sm">
                    <p style={{ color: 'var(--text-primary)' }}>
                      📍 Lat: {location.lat.toFixed(5)}, Lng: {location.lng.toFixed(5)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setLocation(null)}
                    className="px-3 py-1 rounded text-sm font-medium
                             border border-[var(--error)] text-[var(--error)] 
                             hover:bg-[var(--error)] hover:text-white transition-colors duration-200"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowLocationPicker(true)}
                className="w-full px-4 py-2.5 rounded-[var(--radius-md)] text-sm font-medium
                         border border-[var(--border)] transition-all duration-200
                         hover:bg-[var(--bg-tertiary)] hover:border-[var(--primary)]
                         text-[var(--text-primary)] flex items-center justify-center gap-2"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Pick Location
              </button>
            )}
          </div>

          <div className="flex gap-4 pt-2">
            <button
              type="button"
              onClick={onDismiss}
              className="flex-1 py-3 px-4 rounded-[var(--radius-md)] text-sm font-medium
                       border-2 border-[var(--border)] text-[var(--text-secondary)] 
                       hover:bg-[var(--bg-tertiary)] hover:border-[var(--text-muted)] 
                       transition-all duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3 px-4 rounded-[var(--radius-md)] text-sm font-medium
                       bg-[var(--primary)] text-white border-2 border-transparent
                       hover:bg-[var(--primary-hover)] hover:shadow-[var(--glow)]
                       disabled:opacity-50 disabled:cursor-not-allowed
                       transition-all duration-200 transform active:scale-95"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating...
                </span>
              ) : 'Create Reminder'}
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
