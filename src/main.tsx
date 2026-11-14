import {createRoot} from 'react-dom/client';
import {registerSW} from 'virtual:pwa-register';
import App from './App.tsx';
import './index.css';

if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  registerSW({
    immediate: true,
    onRegisteredSW(_swUrl, registration) {
      if (!registration) return;

      // Check for new Vercel deployments automatically whenever internet reconnects
      window.addEventListener('online', () => {
        registration.update().catch(() => {});
      });

      // Periodic background update check while online
      window.setInterval(() => {
        if (navigator.onLine) {
          registration.update().catch(() => {});
        }
      }, 60 * 60 * 1000);
    },
  });
}

createRoot(document.getElementById('root')!).render(<App />);
