import { renderHook, act } from '@testing-library/react';
import { useJournal } from '../hooks/useJournal';

// Mock the db module with correct function signatures
const mockAdd = jest.fn();
const mockUpdate = jest.fn();
const mockRemove = jest.fn();
const mockGetAll = jest.fn();

jest.mock('../utils/db', () => ({
  getAllJournalEntries: () => mockGetAll(),
  createJournalEntry: (...args) => mockAdd(...args),
  updateJournalEntry: (...args) => mockUpdate(...args),
  deleteJournalEntry: (...args) => mockRemove(...args)
}));

describe('useJournal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetAll.mockResolvedValue([
      { id: '1', text: 'Existing entry', mood: '😊', createdAt: new Date() }
    ]);
  });

  it('should load initial entries', async () => {
    const { result } = renderHook(() => useJournal());

    // Wait for useEffect to complete
    await act(async () => {
      await Promise.resolve();
    });

    expect(mockGetAll).toHaveBeenCalled();
    expect(result.current.entries.length).toBe(1);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should handle load error', async () => {
    mockGetAll.mockRejectedValue(new Error('DB error'));
    const { result } = renderHook(() => useJournal());

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.error).toBe('DB error');
    expect(result.current.loading).toBe(false);
  });

  it('should add entry', async () => {
    mockAdd.mockResolvedValue({ id: '2', text: 'New', mood: '😐' });
    const { result } = renderHook(() => useJournal());

    await act(async () => {
      await result.current.addEntry({ text: 'New', mood: '😐' });
    });

    expect(mockAdd).toHaveBeenCalledWith({ text: 'New', mood: '😐' });
    expect(mockGetAll).toHaveBeenCalledTimes(2);
  });

  it('should remove entry', async () => {
    const { result } = renderHook(() => useJournal());

    await act(async () => {
      await result.current.removeEntry('1');
    });

    expect(mockRemove).toHaveBeenCalledWith('1');
    expect(mockGetAll).toHaveBeenCalledTimes(2);
  });

  it('should edit entry', async () => {
    const { result } = renderHook(() => useJournal());

    await act(async () => {
      await result.current.editEntry('1', { text: 'Edited' });
    });

    expect(mockUpdate).toHaveBeenCalledWith('1', { text: 'Edited' });
    expect(mockGetAll).toHaveBeenCalledTimes(2);
  });

  it('should refresh entries', async () => {
    const { result } = renderHook(() => useJournal());

    await act(async () => {
      await result.current.refresh();
    });

    expect(mockGetAll).toHaveBeenCalledTimes(2);
  });
});
