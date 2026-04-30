// Debug script for notification issues
// Run this in your browser console to diagnose notification problems

console.log('🔍 Notification Debug Script');

// Check if notifications are supported
const supported = 'Notification' in window;
console.log('✅ Notifications supported:', supported);

// Check service worker registration
const checkServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.ready;
      console.log('✅ Service Worker registered:', registration);
      
      // Check service worker controller
      if (navigator.serviceWorker.controller) {
        console.log('✅ Service Worker controller active');
      } else {
        console.log('❌ Service Worker controller not active');
      }
      
      return registration;
    } catch (error) {
      console.error('❌ Service Worker error:', error);
      return null;
    }
  } else {
    console.log('❌ Service Workers not supported');
    return null;
  }
};

// Check notification permission
const checkPermission = () => {
  const permission = Notification.permission;
  console.log('📋 Notification permission:', permission);
  
  switch (permission) {
    case 'granted':
      console.log('✅ Notifications are allowed');
      break;
    case 'denied':
      console.log('❌ Notifications are blocked');
      break;
    case 'default':
      console.log('⚠️  Notification permission not requested yet');
      break;
  }
  
  return permission;
};

// Test service worker communication
const testServiceWorker = async () => {
  const registration = await checkServiceWorker();
  if (registration) {
    try {
      // Send test message to service worker
      registration.active.postMessage({ type: 'TEST_NOTIFICATION' });
      console.log('✅ Test message sent to service worker');
    } catch (error) {
      console.error('❌ Failed to send test message:', error);
    }
  }
};

// Test local notification
const testLocalNotification = () => {
  if (Notification.permission === 'granted') {
    try {
      new Notification('Test Notification', {
        body: 'This is a test notification',
        icon: '/favicon.ico'
      });
      console.log('✅ Local notification created');
    } catch (error) {
      console.error('❌ Failed to create local notification:', error);
    }
  } else {
    console.log('⚠️  Need permission to test local notification');
  }
};

// Check environment variables
const checkEnvironment = () => {
  console.log('🔧 Environment Variables:');
  console.log('REACT_APP_VAPID_PUBLIC_KEY:', process.env.REACT_APP_VAPID_PUBLIC_KEY);
  console.log('REACT_APP_HTTPS:', process.env.REACT_APP_HTTPS);
  console.log('Current URL:', window.location.href);
  console.log('Protocol:', window.location.protocol);
  
  if (window.location.protocol === 'http:') {
    console.log('⚠️  Using HTTP - push notifications may not work');
  }
};

// Run all checks
const runDiagnostics = async () => {
  console.log('🚀 Starting notification diagnostics...');
  
  checkEnvironment();
  checkPermission();
  await checkServiceWorker();
  await testServiceWorker();
  testLocalNotification();
  
  console.log('🎯 Diagnostics complete!');
};

// Auto-run diagnostics
runDiagnostics();

// Export functions for manual testing
window.notificationDebug = {
  checkServiceWorker,
  checkPermission,
  testLocalNotification,
  testServiceWorker,
  runDiagnostics
};