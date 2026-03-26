import React, { useState, useEffect } from 'react';
import { usePhotoLibrary } from '../../hooks/usePhotoLibrary';

const CameraTab = ({ onPhotoSelected, onPhotoFromLibrary }) => {
  const [isCameraAvailable, setIsCameraAvailable] = useState(false);
  const [isLibraryAvailable, setIsLibraryAvailable] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [photos] = useState([]);
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  const { photoLibrary } = usePhotoLibrary();

  useEffect(() => {
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
        await photoLibrary.checkPhotoLibraryAccess();
        setIsLibraryAvailable(true);
      } catch (error) {
        setIsLibraryAvailable(false);
      }
    };

    checkDeviceAvailability();
  }, [photoLibrary]);

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
      <h2 className="text-2xl font-bold mb-6 text-base-content">Camera & Photos</h2>

      {/* Camera Section */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3 text-base-content">Take Photo</h3>
        <div className="bg-base-200 rounded-box p-4 border border-base-300">
          {isCameraAvailable ? (
            <div className="text-center">
              <button
                onClick={handleCapture}
                disabled={isCapturing}
                className="btn btn-primary"
              >
                {isCapturing ? 'Capturing...' : 'Take Photo'}
              </button>
              {isCapturing && (
                <div className="mt-2 text-sm text-base-content/60">Photo will be captured in 1.5 seconds...</div>
              )}
              {capturedPhoto && (
                <div className="mt-4">
                  <img
                    src={URL.createObjectURL(capturedPhoto)}
                    alt="Capture preview"
                    className="max-w-full h-32 object-contain mx-auto mb-2 rounded-box"
                  />
                  <div className="text-sm text-base-content/60">Photo captured!</div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-4">
              <div className="text-base-content/60 mb-2 flex justify-center">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h8m-8 6h16" />
                </svg>
              </div>
              <div className="text-xs text-base-content/40">No camera detected or permission denied</div>
            </div>
          )}
        </div>
      </div>

      {/* Photo Library Section */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3 text-base-content">Photo Library</h3>
        <div className="bg-base-200 rounded-box p-4 border border-base-300">
          {isLibraryAvailable ? (
            <div className="text-center">
              <button
                onClick={handleLibraryOpen}
                className="btn btn-success"
              >
                Choose from Library
              </button>
              {selectedPhoto && (
                <div className="mt-4">
                  <img
                    src={URL.createObjectURL(selectedPhoto)}
                    alt="Library selection"
                    className="max-w-full h-32 object-contain mx-auto mb-2 rounded-box"
                  />
                  <div className="text-sm text-base-content/60">Photo selected!</div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-4">
              <div className="text-base-content/60 mb-2 flex justify-center">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h8m-8 6h16" />
                </svg>
              </div>
              <div className="text-xs text-base-content/40">No photo library access or permission denied</div>
            </div>
          )}
        </div>
      </div>

      {/* Recent Photos Section */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3 text-base-content">Recent Photos</h3>
        <div className="bg-base-200 rounded-box p-4 border border-base-300">
          <div className="grid grid-cols-3 gap-2">
            {photos.slice(0, 6).map((photo, index) => (
              <div key={index} className="relative">
                <img
                  src={URL.createObjectURL(photo)}
                  alt={`Thumbnail ${index + 1}`}
                  className="w-full h-16 object-cover rounded-box"
                />
                <button
                  onClick={() => {
                    setSelectedPhoto(photo);
                    onPhotoSelected(photo);
                  }}
                  className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-opacity flex items-center justify-center"
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
        <div className="bg-yellow-100 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-box">
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
export default CameraTab;
