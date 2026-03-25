import React, { useState } from 'react';
import { usePhotoLibrary } from '../../hooks/usePhotoLibrary';

const MOODS = [
  { emoji: '😊', label: 'Great' },
  { emoji: '😐', label: 'Okay' },
  { emoji: '😔', label: 'Low' },
  { emoji: '😠', label: 'Angry' },
  { emoji: '😲', label: 'Surprised' }
];

const AddJournalEntryForm = ({ onDismiss, onSubmit, initialDate }) => {
  const { photoLibrary } = usePhotoLibrary();
  const { openPhotoLibrary } = photoLibrary;
  const [text, setText] = useState('');
  const [mood, setMood] = useState('😐');
  const [date, setDate] = useState(initialDate ? new Date(initialDate).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16));
  const [photos, setPhotos] = useState([]);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) {
      alert('Please write something for your entry.');
      return;
    }
    setIsSubmitting(true);
    try {
      await onSubmit({
        text,
        mood,
        date: new Date(date).toISOString(),
        photos: photos.map(p => p.file)
      });
      setText('');
      setPhotos([]);
      setDate(new Date().toISOString().slice(0, 16));
      onDismiss();
    } catch (err) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg overflow-hidden max-w-4xl w-full">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold">New Journal Entry</h2>
          <button type="button" onClick={onDismiss} className="text-2xl leading-none">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="p-4">
          {/* Mood selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Mood</label>
            <div className="flex gap-2">
              {MOODS.map(m => (
                <button
                  key={m.emoji}
                  type="button"
                  onClick={() => setMood(m.emoji)}
                  className={`p-2 border rounded-lg text-2xl ${mood === m.emoji ? 'border-primary-500 bg-primary-50' : 'border-gray-300'}`}
                  title={m.label}
                >
                  {m.emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Text */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Entry</label>
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              rows={4}
              className="w-full border rounded-lg p-2"
              placeholder="What's on your mind?"
              required
            />
          </div>

          {/* Date */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Date & Time</label>
            <input
              type="datetime-local"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full border rounded-lg p-2"
              required
            />
          </div>

          {/* Photos */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium">Photos</label>
              <button type="button" onClick={handleAddPhoto} className="btn-secondary text-sm">
                Add Photo
              </button>
            </div>
            {photos.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {photos.map((photo, idx) => (
                  <div key={idx} className="relative">
                    <img src={photo.preview} alt={`Journal attachment ${idx}`} className="w-16 h-16 object-cover rounded" />
                    <button type="button" onClick={() => removePhoto(idx)} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">×</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-2">
            <button type="button" onClick={onDismiss} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save Entry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddJournalEntryForm;
