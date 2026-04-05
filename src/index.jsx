import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App';
import './index.css';

// Set DaisyUI luxury theme
document.documentElement.setAttribute('data-theme', 'luxury');

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>
);

// Register service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => {
        console.log('SW registered:', reg);
        if (reg.waiting) {
          console.log('SW waiting, sending skipWaiting');
          reg.waiting.postMessage({ type: 'SKIP_WAITING' });
          // Reload when new controller activates
          navigator.serviceWorker.addEventListener('controllerchange', () => {
            console.log('SW controller activated, reloading');
            window.location.reload();
          }, { once: true });
        } else if (!navigator.serviceWorker.controller) {
          // If no waiting and no controller yet, wait a bit then reload
          setTimeout(() => {
            if (!navigator.serviceWorker.controller) {
              console.log('No controller after wait, reloading to activate');
              window.location.reload();
            }
          }, 1500);
        }
      })
      .catch(err => console.error('SW registration failed:', err));
  });

  navigator.serviceWorker.addEventListener('controllerchange', () => {
    console.log('SW controller changed:', navigator.serviceWorker.controller);
  });
}
