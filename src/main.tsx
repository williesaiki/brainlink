import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { Toaster } from 'sonner';

// PWA Installation handling
let deferredPrompt: any;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  const installButton = document.getElementById('installButton');
  if (installButton) {
    installButton.style.display = 'block';
  }
});

// Handle the install button click
document.addEventListener('DOMContentLoaded', () => {
  const installButton = document.getElementById('installButton');
  if (installButton) {
    installButton.addEventListener('click', async () => {
      if (!deferredPrompt) {
        return;
      }
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        installButton.style.display = 'none';
      }
      deferredPrompt = null;
    });
  }
});

// Check if running in standalone mode (already installed)
if (window.matchMedia('(display-mode: standalone)').matches) {
  const installButton = document.getElementById('installButton');
  if (installButton) {
    installButton.style.display = 'none';
  }
}

// Store the original setTimeout
const originalSetTimeout = window.setTimeout;

// Create a safe wrapper for setTimeout that doesn't cause recursion
window.setTimeout = function(callback: Function, delay: number, ...args: any[]): number {
  try {
    return originalSetTimeout(function() {
      try {
        callback(...args);
      } catch (error) {
        console.error('Error in setTimeout callback:', error);
      }
    }, delay);
  } catch (error) {
    console.error('Error setting timeout:', error);
    return 0;
  }
} as typeof window.setTimeout;

// Only register service worker if not in StackBlitz and service workers are supported
if ('serviceWorker' in navigator && 
    !window.location.host.includes('stackblitz') && 
    !window.location.host.includes('webcontainer')) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/service-worker.js')
      .then(registration => {
        console.log('Service Worker zarejestrowany pomyślnie:', registration);
      })
      .catch(error => {
        console.error('Błąd rejestracji Service Worker:', error);
      });
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
    <Toaster 
      position="top-center"
      toastOptions={{
        style: {
          background: '#000008',
          color: '#ffffff',
          border: '1px solid rgba(229, 229, 229, 0.1)',
        },
        duration: 3000,
        closeButton: true
      }}
    />
  </React.StrictMode>,
);