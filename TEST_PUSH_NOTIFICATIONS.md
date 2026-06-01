# Testing Push Notifications

## Prerequisites

1. Generate VAPID keys (already done in `.env` file)
2. Install dependencies: `npm install`
3. Start the backend server: `node server.js`
4. Start the frontend: `npm start`

## Steps to Test

### 1. Start the Backend Server
```bash
node server.js
```
This will start the server on http://localhost:4000

### 2. Start the Frontend
```bash
npm start
```
This will start the frontend on http://localhost:3000

### 3. Grant Notification Permission
- When you first visit the app, you should see a permission request for notifications
- Click "Allow" to grant permission
- If you don't see the prompt, you can manually grant permission in browser settings

### 4. Test Local Notifications (should work immediately)
- Create a reminder due within the next 5 minutes
- You should see a local notification when the reminder is due

### 5. Test Push Notifications
- After granting permission, the app will automatically subscribe to push notifications
- Check the backend server logs - you should see a "Subscription saved" message
- To send a test push notification, you can use curl:
```bash
curl -X POST http://localhost:4000/api/send-notification \
  -H "Content-Type: application/json" \
  -d '{"title": "Test Push", "body": "This is a test push notification"}'
```

## Troubleshooting

### "notification is not enabled" Error
This usually means:
1. VAPID keys are not set correctly - check your `.env` file
2. The service worker is not registered properly - check browser console for errors
3. Notification permission was not granted - check bell icon in browser address bar

### Common Issues

#### Service Worker Not Registered
- Check if the service worker is showing in Application > Service Workers in DevTools
- Try a hard refresh (Ctrl+Shift+R)
- Clear site data and try again

#### Push Subscription Fails
- Check that VAPID keys are correctly set in `.env`
- Make sure you're using HTTPS or localhost (push notifications don't work on HTTP domains other than localhost)
- Check browser console for errors during subscription

#### No Push Notification Received
- Check that the backend server is running and accessible
- Verify the subscription was saved to the backend (check server logs)
- Make sure the service worker has a push event listener (we added this)
- Check that the payload is being parsed correctly in the service worker

## Development Notes

For development, push notifications work on localhost. For production deployment:
1. You must serve the app over HTTPS
2. Set proper VAPID keys in your production environment
3. Ensure the backend server is accessible over HTTPS
4. Consider using a proper database instead of in-memory storage for subscriptions

## Files Modified

- `.env.example` - Example environment variables
- `server.js` - Backend server for handling push subscriptions
- `package.json` - Added express, cors, dotenv dependencies
- `package-lock.json` - Updated dependencies
- `public/sw.js` - Added push event listener to service worker
- `src/hooks/useNotifications.js` - Updated to send subscription to backend
