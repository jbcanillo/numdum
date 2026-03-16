import React, { useState, useEffect } from 'react';
import { useMediaDevices } from '../../hooks/useMediaDevices';
import { usePhotoLibrary } from '../../hooks/usePhotoLibrary';
// import { useLocalStorage } from '../../hooks/useLocalStorage';
import { Reminder } from '../../types';

interface CameraTabProps {
  onPhotoSelected: (photo: File) => void;
  onPhotoFromLibrary: (photo: File) => void;
}

export const CameraTab: React.FC<CameraTabProps> = ({ onPhotoSelected, onPhotoFromLibrary }) => {
  const [isCameraAvailable, setIsCameraAvailable] = useState(false);
  const [isLibraryAvailable, setIsLibraryAvailable] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<File | null>(null);
  const [photos, setPhotos] = useState<File[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);

  const { devices } = useMediaDevices();
  const { photoLibrary } = usePhotoLibrary();

  useEffect(() => {
    checkDeviceAvailability();
  }, []);

  const checkDeviceAvailability = async () => {
    try {
      const hasCamera = await navigator.mediaDevices.getUserMedia({ video: true });
      setIsCameraAvailable(true);
      if (hasCamera) {
        hasCamera.getTracks().forEach(track => track.stop());
      }
    } catch (error) {
      setIsCameraAvailable(false);
    }

    try {
      const hasLibrary = await photoLibrary.checkPhotoLibraryAccess();
      setIsLibraryAvailable(true);
    } catch (error) {
      setIsLibraryAvailable(false);
    }
  };

  const handleCapture = async () => {
    if (!isCameraAvailable) return;

    setIsCapturing(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const video = document.createElement('video');
      video.srcObject = stream;
      video.play();

      setTimeout(() => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0);
          canvas.toBlob((blob) => {
            if (blob) {
              const photoFile = new File([blob], `photo-${Date.now()}.png`, { type: 'image/png' });
              setCapturedPhoto(photoFile);
              onPhotoSelected(photoFile);
            }
          }, 'image/png');
        }
        stream.getTracks().forEach(track => track.stop());
        video.remove();
      }, 1500);
    } catch (error) {
      console.error('Camera capture error:', error);
    } finally {
      setIsCapturing(false);
    }
  };

  const handleLibraryOpen = async () => {
    if (!isLibraryAvailable) return;

    try {
      const result = await photoLibrary.openPhotoLibrary();
      if (result && result.file) {
        const photoFile = new File([result.file], `photo-${Date.now()}.${result.type}`, { type: result.type });
        onPhotoFromLibrary(photoFile);
        setSelectedPhoto(photoFile);
      }
    } catch (error) {
      console.error('Photo library error:', error);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-6">Camera & Photos</h2>

      {/* Camera Section */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">Take Photo</h3>
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          {isCameraAvailable ? (
            <div className="text-center">
              <button
                onClick={handleCapture}
                disabled={isCapturing}
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {isCapturing ? 'Capturing...' : 'Take Photo'}
              </button>
              {isCapturing && (
                <div className="mt-2 text-sm text-gray-600">Photo will be captured in 1.5 seconds...</div>
              )}
              {capturedPhoto && (
                <div className="mt-4">
                  <img
                    src={URL.createObjectURL(capturedPhoto)}
                    alt="Captured photo"
                    className="max-w-full h-32 object-contain mx-auto mb-2"
                  />
                  <div className="text-sm text-gray-600">Photo captured!</div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-4">
              <div className="text-gray-500 mb-2">
                <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h8m-8 6h16" />
                </svg>
                Camera not available
              </div>
              <div className="text-xs text-gray-400">No camera detected or permission denied</div>
            </div>
          )}
        </div>
      </div>

      {/* Photo Library Section */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">Photo Library</h3>
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          {isLibraryAvailable ? (
            <div className="text-center">
              <button
                onClick={handleLibraryOpen}
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                Choose from Library
              </button>
              {selectedPhoto && (
                <div className="mt-4">
                  <img
                    src={URL.createObjectURL(selectedPhoto)}
                    alt="Selected photo"
                    className="max-w-full h-32 object-contain mx-auto mb-2"
                  />
                  <div className="text-sm text-gray-600">Photo selected!</div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-4">
              <div className="text-gray-500 mb-2">
                <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h8m-8 6h16" />
                </svg>
                Photo library not available
              </div>
              <div className="text-xs text-gray-400">No photo library access or permission denied</div>
            </div>
          )}
        </div>
      </div>

      {/* Recent Photos Section */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">Recent Photos</h3>
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="grid grid-cols-3 gap-2">
            {photos.slice(0, 6).map((photo, index) => (
              <div key={index} className="relative">
                <img
                  src={URL.createObjectURL(photo)}
                  alt={`Photo ${index + 1}`}
                  className="w-full h-16 object-cover rounded"
                />
                <button
                  onClick={() => {
                    setSelectedPhoto(photo);
                    onPhotoSelected(photo);
                  }}
                  className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-opacity flex items-center justify-center"
                >
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Status Messages */}
      {(!isCameraAvailable && !isLibraryAvailable) && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>No camera or photo library available. Photo attachments will be disabled.</span>
          </div>
        </div>
      )}
    </div>
  );
};

// Mock hooks for development
const useMediaDevices = () => ({
  devices: [],
});

const usePhotoLibrary = () => ({
  photoLibrary: {
    checkPhotoLibraryAccess: async () => true,
    openPhotoLibrary: async () => {
      // Mock photo selection
      return {
        file: new Blob([''], { type: 'image/jpeg' }),
        type: 'image/jpeg'
      };
    }
  }
});

// const useLocalStorage = () => ({
//   getItem: (key: string) => null,
//   setItem: (key: string, value: string) => {},
//   removeItem: (key: string) => {}
// });