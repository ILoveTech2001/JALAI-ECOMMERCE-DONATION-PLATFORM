import React from 'react'
import { BrowserRouter } from 'react-router-dom'
import ReactDOM from 'react-dom/client'
import App from './App'
import './assets/globals.css'
import { initializePerformanceOptimizations, registerServiceWorker } from './utils/performance'

// Initialize performance optimizations
initializePerformanceOptimizations();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)

// Register service worker for caching
registerServiceWorker();
