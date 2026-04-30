# Push Notification Debugging Guide

## Issue: Push notifications not showing in browser

## Steps to Debug:

### 1. Check Service Worker Registration
- Open browser Dev Tools → Application → Service Workers
- Look for your service worker (should be at `/sw.js`)
- Verify it shows as "activated" and running
- Check for any errors in the service worker console

### 2. Check Notification Permissions
- In Dev Tools → Application → Service Workers → your service worker
- Look for "Notification permission" status (should be "granted")
- If not granted, you need to request permission

### 3. Test Notification from Service Worker
- In the service worker console (Dev Tools → Application → Service Workers → click "Inspect" under your service worker)
- Run this code to test a notification:
```javascript
self.registration.showNotification('Test', {
  body: 'Test notification from service worker',
  icon: '/favicon.ico',
  badge: '/favicon.ico'
}).catch(err => console.error('Notification failed:', err));
```

### 4. Check Manifest
- Verify `/manifest.json` is accessible and valid
- Should contain proper icons and configuration

### 5. Check for Common Issues
- **HTTPS required**: Service workers only work on localhost or HTTPS (not HTTP)
- **Browser support**: Ensure you're using a modern browser that supports service workers and push notifications
- **Notification blocking**: Check if browser is blocking notifications (look for blocked icon in address bar)
- **Service worker scope**: Ensure service worker is registered at the correct scope (root '/')

### 6. Code Review Points
From code review:
- Service worker at `/public/sw.js` looks correct
- Manifest at `/public/manifest.json` exists
- Notification permission handling in `src/hooks/useNotifications.js`
- Service worker registration in `src/index.jsx` looks correct
- The service worker has a `TEST_NOTIFICATION` handler that should work

### 7. If Still Not Working
- Clear site data and hard refresh
- Try incognito/private window to rule out extensions
- Check if any browser flags are disabling service workers
- Verify the site is being served over HTTPS (or localhost)

## Notes from Cora (Manager Agent)
- Investigated at: $(date -u)
- Service worker implementation appears correct
- Focus on permission granting and service worker activation status