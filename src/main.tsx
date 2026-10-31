import React from 'react'
import ReactDOM from 'react-dom/client'
import { ShelfPage } from '@/features/shelf'
import '@/styles/globals.css'

const rootElement = document.getElementById('root')
if (!rootElement) {
  throw new Error('Failed to find root element')
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <ShelfPage />
  </React.StrictMode>
)
