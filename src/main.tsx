import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerServiceWorker } from './lib/pwa.ts'




createRoot(document.getElementById('root')!).render(
  <StrictMode>
      <App />
  </StrictMode>,
);

// Register AFTER render — import dynamically to avoid module graph issues
//if ('serviceWorker' in navigator) {
  //import('./lib/pwa').then(({ registerServiceWorker }) => {
    registerServiceWorker();
  //});
//}
