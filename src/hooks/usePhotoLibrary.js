import { useState, useCallback } from 'react';

export const usePhotoLibrary = () => {
  const [photoLibrary, setPhotoLibrary] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkPhotoLibraryAccess = useCallback(async () => {
    try {
      if (navigator.camera && navigator.camera.getPicture) {
        return true;
      }
      if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
        return true;
      }
      return false;
    } catch (err) {
      return false;
    }
  }, []);

  const openPhotoLibrary = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (navigator.camera && navigator.camera.getPicture) {
        // Cordova/PhoneGap camera
        return new Promise((resolve, reject) => {
          navigator.camera.getPicture(
            (imageData) => {
              const blob = new Blob([imageData], { type: 'image/jpeg' });
              resolve({ file: blob, type: 'image/jpeg' });
            },
            (error) => reject(error),
            {
              quality: 50,
              destinationType: Camera.DestinationType.DATA_URL,
              sourceType: Camera.PictureSourceType.PHOTOLIBRARY
            }
          );
        });
      } else if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
        // Web API for screen capture
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: true
        });
        const videoTracks = stream.getVideoTracks();
        const video = document.createElement('video');
        video.srcObject = stream;
        video.play();

        return new Promise((resolve, reject) => {
          setTimeout(() => {
            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(video, 0, 0);
              canvas.toBlob((blob) => {
                videoTracks.forEach(track => track.stop());
                video.remove();
                if (blob) {
                  resolve({ file: blob, type: 'image/png' });
                } else {
                  reject(new Error('Failed to capture photo'));
                }
              }, 'image/png');
            } else {
              reject(new Error('Canvas context not available'));
            }
          }, 1500);
        });
      } else {
        // Fallback for web - open file picker
        return new Promise((resolve, reject) => {
          const input = document.createElement('input');
          input.type = 'file';
          input.accept = 'image/*';
          input.onchange = (event) => {
            const file = (event.target as HTMLInputElement).files?.[0];
            if (file) {
              resolve({ file, type: file.type });
            } else {
              reject(new Error('No file selected'));
            }
          };
          input.click();
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    photoLibrary: {
      checkPhotoLibraryAccess,
      openPhotoLibrary
    },
    loading,
    error
  };
};

// Define Camera object for Cordova compatibility
declare global {
  interface Navigator {
    camera?: {
      getPicture: (
        successCallback: (imageData: string) => void,
        errorCallback: (error: any) => void,
        options: any
      ) => void;
    };
  }
}