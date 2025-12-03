import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import './index.css'
import { router } from './routes'
import { initializeApp, logInitializationStatus } from '@/utils/appInitializer'

// Initialize app and check localStorage on startup
const initStatus = initializeApp()
logInitializationStatus(initStatus)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
)
