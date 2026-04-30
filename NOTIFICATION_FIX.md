# Push Notification Troubleshooting Guide

## 🔧 **Quick Fix Checklist**

### 1. **Generate and Add VAPID Keys** (Most Important)
```bash
# Generate VAPID keys
npm install -g web-push
web-push generate-vapid-keys
```

**OR use the online tool:** https://tools.reactpwa.com/vapid

**Update your `.env` file:**
```env
# VAPID Keys for Push Notifications
REACT_APP_VAPID_PUBLIC_KEY=BMI... (your actual public key)
REACT_APP_VAPID_PRIVATE_KEY=... (your actual private key)
REACT_APP_VAPID_SUBJECT=mailto:your-email@example.com
```

### 2. **Add Backend for Push Subscriptions** (Required for Push)
Create a simple Node.js server to handle push subscriptions:

```javascript
// server.js
const webpush = require('web-push');
require('dotenv').config();

const vapidKeys = {
  publicKey: process.env.REACT_APP_VAPID_PUBLIC_KEY,
  privateKey: process.env.REACT_APP_VAPID_PRIVATE_KEY,
  subject: process.env.REACT_APP_VAPID_SUBJECT,
};

webpush.setVapidDetails(
  vapidKeys.subject,
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

const subscriptions = [];

app.post('/api/subscribe', (req, res) => {
  const subscription = req.body;
  subscriptions.push(subscription);
  res.status(201).json({});
});

app.post('/api/send-notification', (req, res) => {
  const { title, body } = req.body;
  
  Promise.all(subscriptions.map(subscription => 
    webpush.sendNotification(subscription, JSON.stringify({
      title,
      body,
      icon: '/favicon.ico'
    }))
  )).then(() => res.status(200).json({}))
    .catch(error => res.status(500).json({ error: error.message }));
});
```

### 3. **Update Notification Hook** to Send Subscriptions to Backend
Modify `src/hooks/useNotifications.js` to send subscription to your backend:

```javascript
const subscribeToNotifications = async () => {
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: process.env.REACT_APP_VAPID_PUBLIC_KEY
    });

    // Send subscription to your backend
    await fetch('/api/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(subscription)
    });

    setIsSubscribed(true);
    return true;
  } catch (error) {
    console.error('Subscription error:', error);
    return false;
  }
};
```

## 🧪 **Testing Steps**

### 1. **Browser Console Debug**
1. Open your app in the browser
2. Open Developer Tools (F12)
3. Go to Console tab
4. Copy and paste this script: `fetch('/debug-notifications.js').then(r => r.text()).then(eval)`
5. Run the diagnostics

### 2. **Manual Testing**
```javascript
// In browser console
// Test 1: Check service worker
navigator.serviceWorker.ready.then(reg => console.log('SW Ready:', reg));

// Test 2: Request permission
Notification.requestPermission().then(console.log);

// Test 3: Test local notification
if (Notification.permission === 'granted') {
  new Notification('Test', { body: 'Test message' });
}
```

### 3. **Test Service Worker Communication**
```javascript
// In browser console
if (navigator.serviceWorker.controller) {
  navigator.serviceWorker.controller.postMessage({ type: 'TEST_NOTIFICATION' });
}
```

## 🚨 **Common Issues & Solutions**

### **Issue 1: VAPID Key Missing**
**Problem:** `REACT_APP_VAPID_PUBLIC_KEY` is undefined
**Solution:** Generate keys and add to `.env` file

### **Issue 2: HTTPS Required**
**Problem:** Push notifications don't work on HTTP
**Solution:** Use HTTPS in production. For local testing, use localhost or tunneling service

### **Issue 3: Service Worker Not Registered**
**Problem:** Service worker doesn't show up in console
**Solution:**
1. Clear browser cache
2. Hard refresh (Ctrl+Shift+R)
3. Check if service worker file exists at `/sw.js`

### **Issue 4: Permission Denied**
**Problem:** User denied notification permission
**Solution:**
1. Clear site data in browser settings
2. Revisit the site and enable permissions
3. Use the debug script to check status

### **Issue 5: Backend Server Missing**
**Problem:** No server to handle push subscriptions
**Solution:** Set up a simple Node.js server as shown above

## 📱 **Browser-Specific Issues**

### **Chrome:**
- Requires HTTPS for push notifications
- Check `chrome://flags` for service worker settings

### **Firefox:**
- More lenient with HTTP, but still recommended to use HTTPS
- Check `about:config` for service worker settings

### **Safari:**
- Requires specific service worker setup
- May require additional manifest settings

## 🔍 **Debug Tools**

### **Use the Debug Script:**
```bash
# Add to your public/index.html
<script src="/debug-notifications.js"></script>
```

### **Manual Checks:**
```javascript
// Check all notification capabilities
console.log('Notification supported:', 'Notification' in window);
console.log('Service Worker supported:', 'serviceWorker' in navigator);
console.log('Push Manager supported:', 'PushManager' in window);
```

## 🚀 **Production Deployment**

### **For HTTPS Only:**
1. Deploy to HTTPS domain
2. Ensure VAPID keys are set in production environment
3. Verify backend server is running and accessible

### **For Local Development:**
1. Use `npm start` for local development
2. Push notifications won't work, but local notifications will
3. Use tunneling service like ngrok for HTTPS testing

## 📞 **Still Not Working?**

If you've tried all the above and notifications still don't work:

1. Check browser console for errors
2. Try in different browsers
3. Test on different devices
4. Check if your app is served over HTTPS
5. Verify the service worker file is being served correctly

## 🔄 **Local Notifications vs Push Notifications**

| Feature | Local Notifications | Push Notifications |
|---------|-------------------|-------------------|
| Works on HTTP | ✅ | ❌ |
| Requires Service Worker | ✅ | ✅ |
| Requires Backend | ❌ | ✅ |
| Requires VAPID Keys | ❌ | ✅ |
| Always Delivered | ✅ | ⚠️ (may be throttled) |

**Local notifications** will work immediately once you fix the VAPID keys issue.
**Push notifications** require a backend server and HTTPS.