import React from 'react'
import ReactDOM from 'react-dom/client'
import { AppProviders } from '@/app/providers'
import { AppRouter } from '@/app/router'
import { registerServiceWorker } from '@/app/pwa'
import '@/styles/globals.css'

// Register service worker for offline functionality
registerServiceWorker()

const rootElement = document.getElementById('root')
if (!rootElement) {
  throw new Error('Failed to find root DOM element')
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <AppProviders>
      <AppRouter />
    </AppProviders>
  </React.StrictMode>
)
