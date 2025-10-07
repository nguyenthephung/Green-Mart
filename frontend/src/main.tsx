import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import './styles/custom-status-select.css';
import App from './App.tsx';
import { registerServiceWorker } from './utils/serviceWorker';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);

// Register Service Worker for PWA and caching
registerServiceWorker();
