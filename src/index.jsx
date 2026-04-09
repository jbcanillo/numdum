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
        
        // If there's a waiting SW, activate it and reload once
        if (reg.waiting) {
          console.log('SW waiting, sending skipWaiting');
          reg.waiting.postMessage({ type: 'SKIP_WAITING' });
          
          // Listen for controller change and reload ONCE
          navigator.serviceWorker.addEventListener('controllerchange', () => {
            console.log('SW controller changed, reloading');
            window.location.reload();
          }, { once: true });
        }
      })
      .catch(err => console.error('SW registration failed:', err));
  });
}