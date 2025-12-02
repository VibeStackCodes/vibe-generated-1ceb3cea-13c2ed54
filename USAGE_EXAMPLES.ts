/**
 * localStorage Integration - Usage Examples
 * ==========================================
 *
 * This file demonstrates practical usage patterns for the localStorage
 * integration in the QuietTask application.
 */

/**
 * EXAMPLE 1: Basic Automatic Persistence
 * ========================================
 * The app automatically saves/loads tasks without any special code
 */

import { TaskProvider } from '@/context/TaskContext'
import { useTask } from '@/hooks/useTask'

function ExampleBasicUsage() {
  // All state is automatically persisted
  const { state, actions, isLoading } = useTask()

  if (isLoading) {
    return <div>Loading tasks from storage...</div>
  }

  return (
    <div>
      <p>Total tasks: {state.tasks.length}</p>

      <button
        onClick={() => {
          // This automatically saves to localStorage after 500ms
          actions.addTask({
            title: 'New task',
            completed: false,
            priority: 'medium',
            listId: 'default',
            tags: [],
          })
        }}
      >
        Add Task
      </button>
    </div>
  )
}

// Usage in App.tsx
// <TaskProvider>
//   <ExampleBasicUsage />
// </TaskProvider>

/**
 * EXAMPLE 2: Manual Save for Critical Operations
 * ===============================================
 * Force an immediate save for important operations
 */

import { useLocalStorage, useLoadLocalStorage } from '@/hooks/useLocalStorage'

function ExampleCriticalSave() {
  const { forceSave, isAvailable, stats } = useLocalStorage(
    [],
    [],
    () => {}
  )

  const handleImportTasks = async (file: File) => {
    try {
      const json = await file.text()
      // Import logic here...

      // Force save immediately
      const success = forceSave()
      if (success) {
        alert('Tasks imported and saved!')
      } else {
        alert('Failed to save. Please try again.')
      }
    } catch (error) {
      console.error('Import failed:', error)
    }
  }

  return (
    <div>
      <p>Storage available: {isAvailable ? '✅' : '❌'}</p>
      <p>Tasks stored: {stats.tasksCount}</p>
      <input
        type="file"
        accept=".json"
        onChange={(e) => {
          if (e.target.files?.[0]) {
            handleImportTasks(e.target.files[0])
          }
        }}
      />
    </div>
  )
}

/**
 * EXAMPLE 3: Backup and Recovery
 * ===============================
 * Allow users to manually backup and restore their data
 */

import {
  exportTasksAsJSON,
  importTasksFromJSON,
  getStorageStats,
} from '@/utils/taskStorage'

function ExampleBackupRestore() {
  const { state, actions } = useTask()
  const { restore, clearStorage } = useLocalStorage(
    state.tasks,
    state.lists,
    () => {}
  )

  // Export tasks as JSON file
  const handleExport = () => {
    const json = exportTasksAsJSON({
      tasks: state.tasks,
      lists: state.lists,
    })

    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `tasks-backup-${new Date().toISOString().split('T')[0]}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  // Import tasks from JSON file
  const handleImport = (file: File) => {
    file.text().then((json) => {
      try {
        const imported = importTasksFromJSON(json)
        // Merge or replace logic...
        imported.tasks.forEach((task) => {
          // Add each task
        })
        alert('Tasks imported successfully!')
      } catch (error) {
        alert(`Import failed: ${error.message}`)
      }
    })
  }

  // Clear all data
  const handleClear = () => {
    if (confirm('Delete all tasks? Keep backup for recovery?')) {
      clearStorage(true) // Keep backup
      window.location.reload()
    }
  }

  // Restore from backup
  const handleRestore = () => {
    if (confirm('Restore from backup? This will replace current data.')) {
      const success = restore()
      if (success) {
        window.location.reload()
      } else {
        alert('No backup available')
      }
    }
  }

  return (
    <div className="p-4 space-y-2">
      <button onClick={handleExport} className="bg-blue-500 text-white p-2">
        📥 Export Tasks
      </button>
      <label className="block bg-green-500 text-white p-2 cursor-pointer">
        📤 Import Tasks
        <input
          type="file"
          accept=".json"
          onChange={(e) => {
            if (e.target.files?.[0]) {
              handleImport(e.target.files[0])
            }
          }}
          className="hidden"
        />
      </label>
      <button
        onClick={handleRestore}
        className="bg-yellow-500 text-white p-2"
      >
        ↩️ Restore from Backup
      </button>
      <button onClick={handleClear} className="bg-red-500 text-white p-2">
        🗑️ Clear All Data
      </button>
    </div>
  )
}

/**
 * EXAMPLE 4: Storage Diagnostics
 * ===============================
 * Display storage usage information
 */

import { useStorageDiagnostics } from '@/hooks/useLocalStorage'

function ExampleDiagnostics() {
  const { getStats } = useStorageDiagnostics()

  const stats = getStats()
  if (!stats.available) {
    return <div>Storage not available</div>
  }

  const storagePercent = (
    (stats.stats.totalSize / (5 * 1024 * 1024)) * 100
  ).toFixed(1)

  return (
    <div className="p-4 space-y-2">
      <h3 className="font-bold">Storage Info</h3>
      <div>Tasks: {stats.stats.tasksCount}</div>
      <div>Lists: {stats.stats.listsCount}</div>
      <div>Data Size: {(stats.stats.storageSize / 1024).toFixed(1)} KB</div>
      <div>Backup Size: {(stats.stats.backupSize / 1024).toFixed(1)} KB</div>
      <div>Usage: {storagePercent}% (5MB limit)</div>
      <div className="w-full bg-gray-200 h-4 rounded">
        <div
          className="bg-blue-500 h-4 rounded"
          style={{ width: `${Math.min(parseFloat(storagePercent), 100)}%` }}
        />
      </div>
    </div>
  )
}

/**
 * EXAMPLE 5: Checking Storage Availability
 * ==========================================
 * Handle cases where localStorage isn't available
 */

import { isLocalStorageAvailable } from '@/utils/taskStorage'

function ExampleAvailabilityCheck() {
  const available = isLocalStorageAvailable()

  if (!available) {
    return (
      <div className="bg-yellow-100 p-4 border border-yellow-400">
        <p>⚠️ Data persistence is not available</p>
        <p className="text-sm">
          Your data will only be saved in memory. Try disabling private browsing
          mode.
        </p>
      </div>
    )
  }

  return <div>✅ Data will be saved locally</div>
}

/**
 * EXAMPLE 6: Error Handling
 * ==========================
 * Gracefully handle storage errors
 */

import {
  loadTaskState,
  restoreFromBackup,
  clearTaskState,
} from '@/utils/taskStorage'

function ExampleErrorHandling() {
  const handleRecovery = () => {
    try {
      const state = loadTaskState()
      console.log('Loaded state:', state)
    } catch (error) {
      console.error('Failed to load:', error)

      // Try recovery from backup
      const restored = restoreFromBackup()
      if (restored) {
        alert('Data recovered from backup!')
        window.location.reload()
      } else {
        // Last resort: start fresh
        if (
          confirm(
            'Data is corrupted and no backup available. Start fresh?'
          )
        ) {
          clearTaskState(false)
          window.location.reload()
        }
      }
    }
  }

  return (
    <button onClick={handleRecovery} className="bg-red-500 text-white p-2">
      🔧 Recover Data
    </button>
  )
}

/**
 * EXAMPLE 7: Running Tests
 * ==========================
 * Verify storage functionality
 */

import { storageTests } from '@/utils/taskStorage.test'

function ExampleRunTests() {
  const handleRunTests = () => {
    console.log('Starting storage tests...')
    storageTests.runAll()
  }

  return (
    <button onClick={handleRunTests} className="bg-purple-500 text-white p-2">
      🧪 Run Storage Tests
    </button>
  )
}

/**
 * EXAMPLE 8: Complete Feature Component
 * ======================================
 * A complete component with all storage features
 */

function ExampleCompleteFeature() {
  const { state, actions } = useTask()
  const { forceSave, clearStorage, restore, isAvailable, stats } =
    useLocalStorage(state.tasks, state.lists, () => {})
  const { getStats } = useStorageDiagnostics()

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-4">
      {/* Status */}
      <div className="bg-blue-50 p-4 rounded">
        <h2 className="font-bold mb-2">📊 Storage Status</h2>
        <div className="text-sm space-y-1">
          <div>
            Available: {isAvailable ? '✅ Yes' : '❌ No'}
          </div>
          <div>Tasks: {stats.tasksCount}</div>
          <div>Size: {(stats.storageSize / 1024).toFixed(1)} KB</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="space-y-2">
        <h2 className="font-bold">⚙️ Quick Actions</h2>
        <div className="space-y-2">
          <button
            onClick={() => forceSave()}
            className="w-full bg-green-500 text-white p-2 rounded"
          >
            💾 Save Now
          </button>
          <button
            onClick={() => {
              const json = exportTasksAsJSON({
                tasks: state.tasks,
                lists: state.lists,
              })
              console.log('Tasks exported:', json)
            }}
            className="w-full bg-blue-500 text-white p-2 rounded"
          >
            📥 Export Tasks
          </button>
          <button
            onClick={() => {
              const success = restore()
              if (success) alert('Restored from backup')
              else alert('No backup available')
            }}
            className="w-full bg-yellow-500 text-white p-2 rounded"
          >
            ↩️ Restore
          </button>
          <button
            onClick={() => {
              if (confirm('Clear all data?')) {
                clearStorage(true)
                window.location.reload()
              }
            }}
            className="w-full bg-red-500 text-white p-2 rounded"
          >
            🗑️ Clear
          </button>
        </div>
      </div>

      {/* Diagnostics */}
      <div className="bg-gray-50 p-4 rounded">
        <h2 className="font-bold mb-2">🔍 Diagnostics</h2>
        <button
          onClick={() => storageTests.runAll()}
          className="w-full bg-purple-500 text-white p-2 rounded"
        >
          🧪 Run Tests
        </button>
      </div>
    </div>
  )
}

/**
 * EXAMPLE 9: Advanced - Custom Hook
 * ==================================
 * Create a custom hook for your specific needs
 */

function useTaskBackup() {
  const { state } = useTask()
  const { forceSave } = useLocalStorage(state.tasks, state.lists, () => {})

  const backup = () => {
    const json = exportTasksAsJSON({
      tasks: state.tasks,
      lists: state.lists,
    })
    return json
  }

  const downloadBackup = () => {
    const json = backup()
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `tasks-${Date.now()}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  const uploadBackup = (file: File) => {
    return file.text().then((json) => {
      const imported = importTasksFromJSON(json)
      return imported
    })
  }

  return {
    backup,
    downloadBackup,
    uploadBackup,
    forceSave,
  }
}

/**
 * EXAMPLE 10: Testing in Browser Console
 * =======================================
 * Copy-paste these commands in browser DevTools console
 */

const consoleExamples = `
// Check storage content
localStorage.getItem('quiettask_state')

// See storage statistics
JSON.parse(localStorage.getItem('quiettask_state'))

// Run all tests
import { storageTests } from '@/utils/taskStorage.test'
storageTests.runAll()

// Clear storage
localStorage.removeItem('quiettask_state')

// Check backup
localStorage.getItem('quiettask_backup')

// Monitor saves (watch console while using app)
// Look for logs starting with [TaskStorage]

// Get available space
import { getAvailableStorageSpace } from '@/utils/taskStorage'
console.log('Available:', getAvailableStorageSpace(), 'bytes')

// Export current data
JSON.stringify(JSON.parse(localStorage.getItem('quiettask_state')), null, 2)
`

export {
  ExampleBasicUsage,
  ExampleCriticalSave,
  ExampleBackupRestore,
  ExampleDiagnostics,
  ExampleAvailabilityCheck,
  ExampleErrorHandling,
  ExampleRunTests,
  ExampleCompleteFeature,
  useTaskBackup,
  consoleExamples,
}
