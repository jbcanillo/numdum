import { renderHook, act } from '@testing-library/react';
import { usePhotoLibrary } from '../hooks/usePhotoLibrary';

// Mock document.createElement to avoid recursion issues
const mockClick = jest.fn();
const originalCreateElement = document.createElement.bind(document);
document.createElement = jest.fn((tag) => {
  const element = originalCreateElement(tag);
  if (tag === 'input') {
    element.click = mockClick;
    element.onchange = null;
  }
  return element;
});

describe('usePhotoLibrary', () => {
  beforeEach(() => {
    mockClick.mockClear();
    // Reset navigator.camera and navigator.mediaDevices
    delete (navigator as any).camera;
    (navigator as any).mediaDevices = undefined;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should check photo library access', () => {
    // Without camera or mediaDevices
    const { result } = renderHook(() => usePhotoLibrary());
    expect(result.current.photoLibrary.checkPhotoLibraryAccess()).toBe(true); // fallback file input always available

    // With camera API
    (navigator as any).camera = { getPicture: jest.fn() };
    const { result: result2 } = renderHook(() => usePhotoLibrary());
    expect(result2.current.photoLibrary.checkPhotoLibraryAccess()).toBe(true);

    // With mediaDevices
    delete (navigator as any).camera;
    (navigator as any).mediaDevices = { getDisplayMedia: jest.fn() };
    const { result: result3 } = renderHook(() => usePhotoLibrary());
    expect(result3.current.photoLibrary.checkPhotoLibraryAccess()).toBe(true);
  });

  it('should open photo library via file input fallback', async () => {
    const file = new File(['image content'], 'test.jpg', { type: 'image/jpeg' });
    const input = document.createElement('input');
    input.files = [file];
    mockClick.mockImplementation((cb) => {
      if (input.onchange) {
        const event = { target: { files: [file] } };
        input.onchange(event);
      }
    });

    const { result } = renderHook(() => usePhotoLibrary());

    let openResult;
    await act(async () => {
      openResult = await result.current.photoLibrary.openPhotoLibrary();
    });

    expect(openResult).toHaveProperty('file');
    expect(openResult.file).toBe(file);
    expect(openResult.type).toBe('image/jpeg');
  });

  it('should handle errors in openPhotoLibrary', async () => {
    // Simulate user cancelling file picker (no file selected)
    mockClick.mockImplementation(() => {
      const event = { target: { files: [] } };
      if (document.createElement('input').onchange) {
        document.createElement('input').onchange(event);
      }
    });

    const { result } = renderHook(() => usePhotoLibrary());

    await expect(act(async () => {
      await result.current.photoLibrary.openPhotoLibrary();
    })).rejects.toThrow('No file selected');
  });
});
