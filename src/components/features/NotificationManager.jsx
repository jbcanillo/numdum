import React, { useState, useEffect } from 'react';
import { Bell, X, Settings } from 'lucide-react';
import { useNotifications } from '../../hooks/useNotifications';

const NotificationManager = () => {
  const { 
    permission, 
    supported, 
    isSubscribed, 
    requestPermission, 
    unsubscribeFromNotifications
  } = useNotifications();
  
  const [showModal, setShowModal] = useState(false);
  const [showPermissionRequest, setShowPermissionRequest] = useState(false);
  // const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    // Check if we should show permission request
    if (permission === 'default' && supported) {
      setShowPermissionRequest(true);
    }
  }, [permission, supported]);

  const handleRequestPermission = async () => {
    const granted = await requestPermission();
    setShowPermissionRequest(!granted);
    setShowModal(false);
  };

  const handleUnsubscribe = async () => {
    await unsubscribeFromNotifications();
    setShowModal(false);
  };

  const handleDismissPermissionRequest = () => {
    setShowPermissionRequest(false);
  };

  const getPermissionStatusText = () => {
    switch (permission) {
      case 'granted':
        return 'Notifications enabled';
      case 'denied':
        return 'Notifications blocked';
      default:
        return 'Enable notifications';
    }
  };

  const getPermissionStatusIcon = () => {
    switch (permission) {
      case 'granted':
        return <Bell className="w-4 h-4 text-green-500" />;
      case 'denied':
        return <X className="w-4 h-4 text-red-500" />;
      default:
        return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  if (!supported) {
    return null;
  }

  return (
    <>
      {/* Permission Request Banner */}
      {showPermissionRequest && (
        <div className="fixed bottom-4 right-4 z-50 bg-base-100 border border-base-content/20 rounded-lg shadow-lg p-4 max-w-sm">
          <div className="flex items-start gap-3">
            <Bell className="w-5 h-5 text-info flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-sm mb-1">Enable Push Notifications</h4>
              <p className="text-xs text-base-content/60 mb-3">
                Get notified when reminders are due. Never miss an important task!
              </p>
              <div className="flex gap-2">
                <button 
                  type="button"
                  className="btn btn-primary btn-sm flex-1"
                  onClick={handleRequestPermission}
                >
                  Enable
                </button>
                <button 
                  type="button"
                  className="btn btn-ghost btn-sm px-3"
                  onClick={handleDismissPermissionRequest}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notification Status Indicator */}
      <div className="flex items-center gap-2 text-sm">
        <span>{getPermissionStatusIcon()}</span>
        <span>{getPermissionStatusText()}</span>
        {permission === 'granted' && (
          <button 
            type="button"
            className="btn btn-ghost btn-sm ml-2"
            onClick={() => setShowModal(true)}
          >
            <Settings className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Settings Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-base-100 rounded-lg shadow-xl max-w-md w-full m-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Notification Settings</h3>
                <button 
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => setShowModal(false)}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="bg-base-100 rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Push Notifications</h4>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-base-content/70">
                      {isSubscribed ? 'Subscribed to push notifications' : 'Not subscribed to push notifications'}
                    </span>
                    {permission === 'granted' && (
                      <button 
                        type="button"
                        className="btn btn-outline btn-sm"
                        onClick={handleUnsubscribe}
                        disabled={!isSubscribed}
                      >
                        {isSubscribed ? 'Unsubscribe' : 'Subscribe'}
                      </button>
                    )}
                  </div>
                </div>

                <div className="bg-base-100 rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Local Notifications</h4>
                  <p className="text-sm text-base-content/60 mb-3">
                    Notifications that appear directly on your device
                  </p>
                  <button 
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={handleRequestPermission}
                    disabled={permission === 'granted'}
                  >
                    {permission === 'granted' ? 'Enabled' : 'Enable Local Notifications'}
                  </button>
                </div>

                {permission === 'denied' && (
                  <div className="bg-warning/20 border border-warning/30 rounded-lg p-4">
                    <h4 className="font-semibold mb-2 text-warning">Notifications Blocked</h4>
                    <p className="text-sm text-base-content/70">
                      To enable notifications, please allow notifications in your browser settings.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default NotificationManager;