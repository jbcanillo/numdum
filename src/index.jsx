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
        }
        // Do NOT auto-reload; wait for user to manually reload or use controllerchange event
        if (!navigator.serviceWorker.controller) {
          console.log('SW not active yet. Reload the page to activate.');
          // Optionally show a non-intrusive banner or toast here if desired
        } else {
          console.log('SW controller active');
        }
      })
      .catch(err => console.error('SW registration failed:', err));
  });

  navigator.serviceWorker.addEventListener('controllerchange', () => {
    console.log('SW controller changed:', navigator.serviceWorker.controller);
  });
}
