import { Outlet } from 'react-router-dom'
import { Suspense } from 'react'
import { ErrorBoundary } from '@/components/error-boundary'
import { VibeStackBadge } from '@/components/vibestack-badge'
import { TaskProvider } from '@/context/TaskContext'

/**
 * Main App component with routing
 * Uses React Router for SPA navigation
 * Wraps entire app with TaskProvider for global state management
 */
function App() {
  return (
    <ErrorBoundary>
      <TaskProvider>
        <Suspense
          fallback={
            <div className="flex min-h-screen items-center justify-center">
              <p className="text-muted-foreground">Loading...</p>
            </div>
          }
        >
          <Outlet />
        </Suspense>
      </TaskProvider>
      <VibeStackBadge />
    </ErrorBoundary>
  )
}

export default App
