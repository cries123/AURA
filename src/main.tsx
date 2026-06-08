import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { firebaseReady } from './lib/firebase';
import App from './App';
import './index.css';

void firebaseReady;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
