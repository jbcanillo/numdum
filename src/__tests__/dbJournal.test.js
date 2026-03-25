import {
  getAllJournalEntries,
  createJournalEntry,
  updateJournalEntry,
  deleteJournalEntry
} from '../utils/db';

const TEST_DB_NAME = 'ReminderAppDB_Test';

// Helper to delete test DB
const deleteTestDB = async () => {
  if (window.indexedDB.deleteDatabase) {
    await window.indexedDB.deleteDatabase(TEST_DB_NAME);
  }
};

describe('Database Journal Functions', () => {
  beforeAll(async () => {
    // Ensure clean state
    await deleteTestDB();
  });

  afterEach(async () => {
    // Clear all entries between tests
    const db = await (await import('../utils/db')).getDB();
    if (db.objectStoreNames.contains('journal-store')) {
      const transaction = db.transaction(['journal-store'], 'readwrite');
      const store = transaction.objectStore('journal-store');
      store.clear();
      await new Promise((resolve) => transaction.oncomplete = resolve);
    }
  });

  afterAll(async () => {
    await deleteTestDB();
  });

  describe('getAllJournalEntries', () => {
    it('should return empty array when no entries', async () => {
      const entries = await getAllJournalEntries();
      expect(entries).toEqual([]);
    });

    it('should return all entries', async () => {
      const entry1 = await createJournalEntry({ text: 'Entry 1', mood: '😊' });
      const entry2 = await createJournalEntry({ text: 'Entry 2', mood: '😐' });

      const entries = await getAllJournalEntries();
      expect(entries.length).toBe(2);
      expect(entries.map(e => e.text)).toContain('Entry 1');
      expect(entries.map(e => e.text)).toContain('Entry 2');
    });
  });

  describe('createJournalEntry', () => {
    it('should create entry with auto-generated ID and timestamp', async () => {
      const entry = await createJournalEntry({ text: 'Test entry', mood: '😊' });

      expect(entry).toHaveProperty('id');
      expect(entry.id).toBeDefined();
      expect(entry.createdAt).toBeInstanceOf(Date);
      expect(entry.text).toBe('Test entry');
      expect(entry.mood).toBe('😊');
    });

    it('should use provided ID if given', async () => {
      const entry = await createJournalEntry({ id: 'custom-id', text: 'Custom' });
      expect(entry.id).toBe('custom-id');
    });
  });

  describe('updateJournalEntry', () => {
    it('should update fields of existing entry', async () => {
      const entry = await createJournalEntry({ text: 'Original', mood: '😐' });
      const updated = await updateJournalEntry(entry.id, { text: 'Updated' });

      expect(updated.text).toBe('Updated');
      expect(updated.mood).toBe('😐'); // unchanged
      expect(updated.id).toBe(entry.id);
    });

    it('should throw error when updating non-existent entry', async () => {
      await expect(updateJournalEntry('nonexistent', { text: 'fail' }))
        .rejects.toThrow('Entry not found');
    });
  });

  describe('deleteJournalEntry', () => {
    it('should delete existing entry', async () => {
      const entry = await createJournalEntry({ text: 'To delete' });
      await deleteJournalEntry(entry.id);

      const all = await getAllJournalEntries();
      expect(all.find(e => e.id === entry.id)).toBeUndefined();
    });

    it('should not throw when deleting non-existent entry', async () => {
      await expect(deleteJournalEntry('nonexistent')).resolves.not.toThrow();
    });
  });
});
