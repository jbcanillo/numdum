import { useState, useCallback } from 'react';

export const useMediaDevices = () => {
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getMediaDevices = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
        const deviceInfos = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = deviceInfos.filter(
          (device) => device.kind === 'videoinput'
        );
        setDevices(videoDevices);
        return videoDevices;
      } else {
        // Fallback for older browsers
        const videoDevices = [];
        let index = 0;
        while (true) {
          try {
            const stream = await navigator.mediaDevices.getUserMedia({
              video: { deviceId: { exact: `video${index}` } }
            });
            videoDevices.push({
              deviceId: `video${index}`,
              kind: 'videoinput',
              label: `Camera ${index + 1}`,
              groupId: `group${index}`
            });
            stream.getTracks().forEach(track => track.stop());
            index++;
          } catch (e) {
            if (index === 0) {
              // No devices found
              break;
            } else {
              // No more devices
              break;
            }
          }
        }
        setDevices(videoDevices);
        return videoDevices;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const checkCameraAvailability = useCallback(async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        return false;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  }, []);

  return {
    devices,
    loading,
    error,
    getMediaDevices,
    checkCameraAvailability
  };
};

// Define Camera object for Cordova compatibility
declare global {
  interface Navigator {
    camera?: any;
  }
}