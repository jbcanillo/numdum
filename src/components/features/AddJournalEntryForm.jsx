import React, { useState } from 'react';
import { usePhotoLibrary } from '../../hooks/usePhotoLibrary';

const MOODS = [
  { emoji: '😊', label: 'Great' },
  { emoji: '😐', label: 'Okay' },
  { emoji: '😔', label: 'Low' },
  { emoji: '😠', label: 'Angry' },
  { emoji: '😲', label: 'Surprised' }
];

const AddJournalEntryForm = ({ onDismiss, onSubmit, initialDate, asPage = false, entry = null }) => {
  const { photoLibrary } = usePhotoLibrary();
  const { openPhotoLibrary } = photoLibrary;
  const isEditing = !!entry;
  const [text, setText] = useState(entry ? entry.text : '');
  const [mood, setMood] = useState(entry ? entry.mood : '😐');
  const [date, setDate] = useState(entry ? new Date(entry.date).toISOString().slice(0, 16) : (initialDate ? new Date(initialDate).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16)));
  const [photos, setPhotos] = useState([]);
  const [existingPhotos, setExistingPhotos] = useState(entry?.photos || []);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddPhoto = async () => {
    try {
      const result = await openPhotoLibrary();
      if (result && result.file) {
        setPhotos(prev => [...prev, { file: result.file, preview: URL.createObjectURL(result.file) }]);
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const removePhoto = (idx) => {
    setPhotos(prev => prev.filter((_, i) => i !== idx));
  };

  const removeExistingPhoto = (idx) => {
    setExistingPhotos(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) {
      alert('Please write something for your entry.');
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = {
        text,
        mood,
        date: new Date(date).toISOString(),
        photos: [...existingPhotos, ...photos.map(p => p.file)]
      };
      if (isEditing && entry) {
        payload.id = entry.id;
      }
      await onSubmit(payload);
      if (!isEditing) {
        setText('');
        setPhotos([]);
        setDate(new Date().toISOString().slice(0, 16));
      }
      onDismiss();
    } catch (err) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formContent = (
    <form onSubmit={handleSubmit} className="p-4">
      {/* Mood selection */}
      <div className="mb-4">
        <label className="label">
          <span className="label-text font-medium">Mood</span>
        </label>
        <div className="flex gap-2">
          {MOODS.map(m => (
            <button
              key={m.emoji}
              type="button"
              onClick={() => setMood(m.emoji)}
              className={`btn btn-outline btn-sm ${mood === m.emoji ? 'btn-primary' : ''}`}
              title={m.label}
            >
              {m.emoji}
            </button>
          ))}
        </div>
      </div>

      {/* Text */}
      <div className="mb-4">
        <label className="label">
          <span className="label-text font-medium">Entry</span>
        </label>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          rows={4}
          className="textarea textarea-bordered w-full focus:textarea-primary"
          placeholder="What's on your mind?"
          required
        />
      </div>

      {/* Date */}
      <div className="mb-4">
        <label className="label">
          <span className="label-text font-medium">Date & Time</span>
        </label>
        <input
          type="datetime-local"
          value={date}
          onChange={e => setDate(e.target.value)}
          className="input input-bordered w-full focus:input-primary"
          required
        />
      </div>

      {/* Photos */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <label className="label-text font-medium">Photos</label>
          <button type="button" onClick={handleAddPhoto} className="btn btn-outline btn-sm">
            Add Photo
          </button>
        </div>
        {/* Existing photos (edit mode) */}
        {isEditing && existingPhotos.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {existingPhotos.map((photo, idx) => (
              <div key={`existing-${idx}`} className="relative">
                <img src={URL.createObjectURL(photo)} alt={`Existing attachment ${idx}`} className="w-16 h-16 object-cover rounded-box" />
                <button type="button" onClick={() => removeExistingPhoto(idx)} className="absolute -top-1 -right-1 btn btn-circle btn-error btn-xs text-white">×</button>
              </div>
            ))}
          </div>
        )}
        {/* New photos */}
        {photos.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {photos.map((photo, idx) => (
              <div key={idx} className="relative">
                <img src={photo.preview} alt={`Journal attachment ${idx}`} className="w-16 h-16 object-cover rounded-box" />
                <button type="button" onClick={() => removePhoto(idx)} className="absolute -top-1 -right-1 btn btn-circle btn-error btn-xs text-white">×</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2">
        <button type="button" onClick={onDismiss} className="btn btn-outline">
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn btn-primary"
        >
          {isSubmitting ? 'Saving...' : (isEditing ? 'Update Entry' : 'Save Entry')}
        </button>
      </div>
    </form>
  );

  if (asPage) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-[var(--bg-elevated)] rounded-box overflow-hidden shadow-lg mb-6">
          <div className="p-4 border-b border-base-200 flex justify-between items-center">
            <h2 className="text-xl font-bold text-base-content">{isEditing ? 'Edit Journal Entry' : 'New Journal Entry'}</h2>
          </div>
          {formContent}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[var(--bg-elevated)] rounded-box overflow-hidden max-w-4xl w-full shadow-lg">
        <div className="p-4 border-b border-base-200 flex justify-between items-center">
          <h2 className="text-xl font-bold text-base-content">{isEditing ? 'Edit Journal Entry' : 'New Journal Entry'}</h2>
          <button type="button" onClick={onDismiss} className="text-2xl leading-none text-base-content/60 hover:text-base-content">×</button>
        </div>
        {formContent}
      </div>
    </div>
  );
};

export default AddJournalEntryForm;
