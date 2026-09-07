import { StrictMode } from 'react'

// Polyfills for simple-peer
window.global = window;
window.process = { env: {} };
window.Buffer = window.Buffer || [];

import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
