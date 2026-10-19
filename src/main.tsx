import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initGA } from './utils/analytics';

// Initialize Google Analytics if Measurement ID is provided
initGA();

// Register service worker for PWA support and offline capabilities
if ('serviceWorker' in navigator && process.env.NODE_ENV !== 'development') {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => {
        reg.update().catch(() => {});
      })
      .catch((err) => {
        console.warn('Service worker registration failed:', err);
      });
  });
}

createRoot(document.getElementById('root')!).render(<App />);
