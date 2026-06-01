const express = require('express');
const webpush = require('web-push');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const vapidKeys = {
  publicKey: process.env.REACT_APP_VAPID_PUBLIC_KEY,
  privateKey: process.env.REACT_APP_VAPID_PRIVATE_KEY,
  subject: process.env.REACT_APP_VAPID_SUBJECT
};

webpush.setVapidDetails(
  vapidKeys.subject,
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

// In-memory storage for subscriptions (in production, use a database)
const subscriptions = [];

app.post('/api/subscribe', (req, res) => {
  const subscription = req.body;
  subscriptions.push(subscription);
  console.log('Subscription saved:', subscription.endpoint);
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

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
