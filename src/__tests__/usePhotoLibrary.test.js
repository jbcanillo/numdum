import { renderHook } from '@testing-library/react';
import { usePhotoLibrary } from '../hooks/usePhotoLibrary';

describe('usePhotoLibrary', () => {
  beforeEach(() => {
    delete navigator.camera;
    navigator.mediaDevices = undefined;
  });

  it('should return photoLibrary object with methods', () => {
    const { result } = renderHook(() => usePhotoLibrary());
    expect(result.current.photoLibrary).toBeDefined();
    expect(typeof result.current.photoLibrary.checkPhotoLibraryAccess).toBe('function');
    expect(typeof result.current.photoLibrary.openPhotoLibrary).toBe('function');
  });

  it('should checkPhotoLibraryAccess return true', async () => {
    const { result } = renderHook(() => usePhotoLibrary());
    const access = await result.current.photoLibrary.checkPhotoLibraryAccess();
    expect(access).toBe(true);
  });
});
