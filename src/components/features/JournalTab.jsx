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
      <h2 className="text-2xl font-bold mb-6">Journal</h2>

      {/* Entry Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-soft p-6 mb-8 border border-gray-100">
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">How are you feeling?</label>
          <div className="flex space-x-3">
            {MOODS.map(m => (
              <button
                key={m.emoji}
                type="button"
                onClick={() => setMood(m.emoji)}
                className={`p-2 text-2xl rounded-full border-2 ${mood === m.emoji ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-primary-300'}`}
                title={m.label}
              >
                {m.emoji}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <label htmlFor="journal-date" className="block text-sm font-medium mb-1">Date & Time</label>
          <input
            id="journal-date"
            type="datetime-local"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="journal-text" className="block text-sm font-medium mb-1">What's on your mind?</label>
          <textarea
            id="journal-text"
            rows={4}
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Write your thoughts..."
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Photos (optional)</label>
          <button type="button" onClick={handleAddPhoto} className="btn-secondary">
            Add Photo
          </button>
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

        <button
          type="submit"
          disabled={isSubmitting || !text.trim()}
          className="w-full py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Saving...' : 'Save Entry'}
        </button>
      </form>

      {/* Entries List */}
      {loading ? (
        <div className="text-center py-8 text-gray-500">Loading journal entries...</div>
      ) : entries.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-dashed border-gray-300">
          <p className="text-gray-600">No journal entries yet. Start writing!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {entries.map(entry => (
            <div key={entry.id} className="bg-white rounded-lg shadow-soft p-6 border border-gray-100">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="text-lg font-semibold">{format(new Date(entry.date), 'PPP p')}</div>
                  <div className="text-2xl">{entry.mood}</div>
                </div>
                <button
                  onClick={() => removeEntry(entry.id)}
                  className="text-red-600 hover:text-red-700 text-sm"
                >
                  Delete
                </button>
              </div>
              <p className="text-gray-800 whitespace-pre-wrap mb-4">{entry.text}</p>
              {entry.photos && entry.photos.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {entry.photos.map((photo, idx) => (
                    <img
                      key={idx}
                      src={URL.createObjectURL(photo)}
                      alt={`Journal attachment ${idx}`}
                      className="w-20 h-20 object-cover rounded"
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
