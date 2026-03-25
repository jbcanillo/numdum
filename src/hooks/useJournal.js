import { useState, useEffect, useCallback } from 'react';
import { getAllJournalEntries, createJournalEntry, updateJournalEntry, deleteJournalEntry } from '../utils/db';

export const useJournal = () => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      const all = await getAllJournalEntries();
      all.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setEntries(all);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addEntry = async (entry) => {
    await createJournalEntry(entry);
    await refresh();
  };

  const removeEntry = async (id) => {
    await deleteJournalEntry(id);
    await refresh();
  };

  const editEntry = async (id, changes) => {
    await updateJournalEntry(id, changes);
    await refresh();
  };

  return {
    entries,
    loading,
    error,
    addEntry,
    removeEntry,
    editEntry,
    refresh
  };
};
