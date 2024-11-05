import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { TimelineProvider } from './store/TimelineContext';
import './index.css';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Root element not found');

createRoot(rootElement).render(
  <StrictMode>
    <TimelineProvider>
      <App />
    </TimelineProvider>
  </StrictMode>
);