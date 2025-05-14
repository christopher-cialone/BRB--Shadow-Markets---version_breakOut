import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Font imports
import '@fontsource/montserrat';
import '@fontsource/share-tech-mono';
import '@fontsource/roboto';

ReactDOM.createRoot(document.getElementById('react-root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);