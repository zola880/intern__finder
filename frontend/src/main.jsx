import {StrictMode} from 'react';// Main entry point of the React application
import {createRoot} from 'react-dom/client';
import App from './App.jsx';
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
