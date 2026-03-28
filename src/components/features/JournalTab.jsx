import React, { useState } from 'react';
import { useJournal } from '../../hooks/useJournal';
import { usePhotoLibrary } from '../../hooks/usePhotoLibrary';
import { format } from 'date-fns';

const MOODS = [
  { emoji: '😊', label: 'Great' },
  { emoji: '😐', label: 'Okay' },
  { emoji: '😔', label: 'Low' },
  { emoji: '😠', label: 'Angry' },
  { emoji: '😲', label: 'Surprised' }
];

const JournalTab = () => {
  const { entries, loading, addEntry, removeEntry } = useJournal();
  const { openPhotoLibrary } = usePhotoLibrary();

  const [text, setText] = useState('');
  const [mood, setMood] = useState('😐');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 16));
  const [photos, setPhotos] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddPhoto = async () => {
    try {
      const result = await openPhotoLibrary();
      if (result && result.file) {
        setPhotos(prev => [...prev, { file: result.file, preview: URL.createObjectURL(result.file) }]);
      }
    } catch (err) {
      console.error('Failed to pick photo:', err);
    }
  };

  const removePhoto = (index) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setIsSubmitting(true);
    try {
      await addEntry({
        text: text.trim(),
        mood,
        date,
        photos: photos.map(p => p.file),
        createdAt: new Date(date)
      });
      setText('');
      setMood('😐');
      setDate(new Date().toISOString().slice(0, 16));
      setPhotos([]);
    } catch (error) {
      console.error('Error adding journal entry:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4 pb-24">
      <h2 className="text-2xl font-bold mb-6 text-base-content">Journal</h2>

      {/* Entry Form */}
      <form onSubmit={handleSubmit} className="bg-base-100 rounded-box p-6 mb-8 border border-base-200 shadow">
        <div className="mb-4">
          <label className="label">
            <span className="label-text font-medium">How are you feeling?</span>
          </label>
          <div className="flex gap-3">
            {MOODS.map(m => (
              <button
                key={m.emoji}
                type="button"
                onClick={() => setMood(m.emoji)}
                className={`p-2 text-2xl rounded-full border-2 ${mood === m.emoji ? 'border-primary bg-primary/10' : 'border-base-300 hover:border-primary'}`}
                title={m.label}
              >
                {m.emoji}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <label htmlFor="journal-date" className="label">
            <span className="label-text font-medium">Date & Time</span>
          </label>
          <input
            id="journal-date"
            type="datetime-local"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="input input-bordered w-full focus:input-primary"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="journal-text" className="label">
            <span className="label-text font-medium">What's on your mind?</span>
          </label>
          <textarea
            id="journal-text"
            rows={4}
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="textarea textarea-bordered w-full focus:textarea-primary"
            placeholder="Write your thoughts..."
          />
        </div>

        <div className="mb-4">
          <label className="label">
            <span className="label-text font-medium">Photos (optional)</span>
          </label>
          <button type="button" onClick={handleAddPhoto} className="btn btn-secondary btn-sm">
            Add Photo
          </button>
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

        <button
          type="submit"
          disabled={isSubmitting || !text.trim()}
          className="w-full btn btn-primary disabled:btn-disabled disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Saving...' : 'Save Entry'}
        </button>
      </form>

      {/* Entries List */}
      {loading ? (
        <div className="text-center py-8 text-base-content/60">Loading journal entries...</div>
      ) : entries.length === 0 ? (
        <div className="text-center py-12 bg-base-100 rounded-box border border-base-300 border-dashed">
          <p className="text-base-content/60">No journal entries yet. Start writing!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {entries.map(entry => (
            <div key={entry.id} className="bg-base-100 rounded-box p-6 border border-base-200 shadow">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="text-lg font-semibold text-base-content">{format(new Date(entry.date), 'PPP p')}</div>
                  <div className="text-2xl">{entry.mood}</div>
                </div>
                <button
                  onClick={() => {
                    if (window.confirm('Are you sure you want to delete this journal entry?')) {
                      removeEntry(entry.id);
                    }
                  }}
                  className="btn btn-ghost btn-xs text-error"
                >
                  Delete
                </button>
              </div>
              <p className="text-base-content whitespace-pre-wrap mb-4">{entry.text}</p>
              {entry.photos && entry.photos.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {entry.photos.map((photo, idx) => (
                    <img
                      key={idx}
                      src={URL.createObjectURL(photo)}
                      alt={`Journal attachment ${idx}`}
                      className="w-20 h-20 object-cover rounded-box"
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default JournalTab;
