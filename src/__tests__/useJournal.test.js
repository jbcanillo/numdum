import { renderHook, act } from '@testing-library/react';
import { useJournal } from '../hooks/useJournal';

// Mock the db module
const mockAdd = jest.fn();
const mockUpdate = jest.fn();
const mockRemove = jest.fn();
const mockLoad = jest.fn();

jest.mock('../utils/db', () => ({
  getAllJournalEntries: jest.fn(() => mockLoad()),
  createJournalEntry: (...args) => mockAdd(...args),
  updateJournalEntry: (...args) => mockUpdate(...args),
  deleteJournalEntry: (...args) => mockRemove(...args)
}));

describe('useJournal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLoad.mockResolvedValue([
      { id: '1', text: 'Existing entry', mood: '😊', createdAt: new Date() }
    ]);
  });

  it('should load initial entries', async () => {
    const { result } = renderHook(() => useJournal());

    // Wait for initial load
    await act(async () => {
      // wait for useEffect
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(mockLoad).toHaveBeenCalled();
    expect(result.current.entries.length).toBe(1);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should handle load error', async () => {
    mockLoad.mockRejectedValue(new Error('DB error'));
    const { result } = renderHook(() => useJournal());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.error).toBe('DB error');
    expect(result.current.loading).toBe(false);
  });

  it('should add entry', async () => {
    mockAdd.mockResolvedValue({ id: '2', text: 'New', mood: '😐' });
    const { result } = renderHook(() => useJournal());

    await act(async () => {
      result.current.addEntry({ text: 'New', mood: '😐' });
    });

    expect(mockAdd).toHaveBeenCalledWith({ text: 'New', mood: '😐' });
    expect(mockLoad).toHaveBeenCalledTimes(2); // initial + refresh
  });

  it('should remove entry', async () => {
    const { result } = renderHook(() => useJournal());

    await act(async () => {
      result.current.removeEntry('1');
    });

    expect(mockRemove).toHaveBeenCalledWith('1');
    expect(mockLoad).toHaveBeenTimes(2);
  });

  it('should edit entry', async () => {
    const { result } = renderHook(() => useJournal());

    await act(async () => {
      result.current.editEntry('1', { text: 'Edited' });
    });

    expect(mockUpdate).toHaveBeenCalledWith('1', { text: 'Edited' });
    expect(mockLoad).toHaveBeenTimes(2);
  });

  it('should refresh entries', async () => {
    const { result } = renderHook(() => useJournal());

    await act(async () => {
      result.current.refresh();
    });

    expect(mockLoad).toHaveBeenCalledTimes(2); // initial + explicit refresh
  });
});
