/**
 * Storage Persistence Hook Guide & Examples
 *
 * This file demonstrates how to use localStorage integration in QuietTask.
 * The integration is AUTOMATIC - you don't need to do anything!
 *
 * How it works:
 * 1. TaskProvider loads tasks from localStorage on app startup
 * 2. Any changes to tasks/lists are automatically persisted (with 500ms debounce)
 * 3. Page refresh preserves all data
 * 4. Works completely offline
 *
 * Storage Location: localStorage["quiettask_state"]
 * Storage Size: Varies based on data volume (auto-managed by browser)
 */

/**
 * ============================================================================
 * USAGE EXAMPLES
 * ============================================================================
 */

/**
 * Example 1: Basic usage (no code needed!)
 *
 * import { useTask } from '@/hooks/useTask'
 *
 * function MyComponent() {
 *   const { state, actions } = useTask()
 *
 *   // Tasks are AUTOMATICALLY loaded from localStorage on mount
 *   // and saved whenever they change
 *
 *   const handleAddTask = () => {
 *     const task = actions.addTask({
 *       title: 'New Task',
 *       completed: false,
 *       priority: 'medium',
 *       listId: 'default',
 *       tags: [],
 *     })
 *     // Task is automatically persisted to localStorage
 *   }
 *
 *   return <div>{state.tasks.length} tasks</div>
 * }
 */

/**
 * Example 2: Show loading state during initialization
 *
 * import { useTaskLoading } from '@/hooks/useTask'
 *
 * function MyComponent() {
 *   const isLoading = useTaskLoading()
 *
 *   if (isLoading) {
 *     return <div>Loading your tasks...</div>
 *   }
 *
 *   return <div>Tasks loaded!</div>
 * }
 */

/**
 * Example 3: Force immediate save (bypass debounce)
 *
 * import { useEffect } from 'react'
 * import { useTask } from '@/hooks/useTask'
 * import { saveTaskState } from '@/utils/taskStorage'
 *
 * function CriticalSave() {
 *   const { state } = useTask()
 *
 *   const handleCriticalOperation = async () => {
 *     // Do something important
 *
 *     // Force immediate save instead of waiting for debounce
 *     saveTaskState({ tasks: state.tasks, lists: state.lists })
 *   }
 *
 *   return <button onClick={handleCriticalOperation}>Critical Save</button>
 * }
 */

/**
 * Example 4: Export tasks as backup
 *
 * import { useTask } from '@/hooks/useTask'
 * import { exportTasksAsJSON } from '@/utils/taskStorage'
 *
 * function ExportButton() {
 *   const { state } = useTask()
 *
 *   const handleExport = () => {
 *     const json = exportTasksAsJSON({
 *       tasks: state.tasks,
 *       lists: state.lists
 *     })
 *
 *     // Create download link
 *     const blob = new Blob([json], { type: 'application/json' })
 *     const url = URL.createObjectURL(blob)
 *     const link = document.createElement('a')
 *     link.href = url
 *     link.download = `tasks-backup-${Date.now()}.json`
 *     link.click()
 *   }
 *
 *   return <button onClick={handleExport}>Backup Tasks</button>
 * }
 */

/**
 * Example 5: Import tasks from backup
 *
 * import { importTasksFromJSON } from '@/utils/taskStorage'
 * import { useTask } from '@/hooks/useTask'
 *
 * function ImportButton() {
 *   const { actions } = useTask()
 *
 *   const handleImport = async (fileContent: string) => {
 *     try {
 *       const importedState = importTasksFromJSON(fileContent)
 *
 *       // Add imported tasks
 *       for (const task of importedState.tasks) {
 *         actions.addTask(task)
 *       }
 *
 *       // Add imported lists
 *       for (const list of importedState.lists) {
 *         actions.addList(list)
 *       }
 *     } catch (error) {
 *       console.error('Import failed:', error)
 *     }
 *   }
 *
 *   return <input type="file" accept=".json" onChange={(e) => {
 *     const file = e.target.files?.[0]
 *     if (file) {
 *       const reader = new FileReader()
 *       reader.onload = (event) => {
 *         handleImport(event.target?.result as string)
 *       }
 *       reader.readAsText(file)
 *     }
 *   }} />
 * }
 */

/**
 * Example 6: Check storage stats
 *
 * import { getStorageStats } from '@/utils/taskStorage'
 *
 * function StorageStats() {
 *   const stats = getStorageStats()
 *
 *   return (
 *     <div>
 *       <p>Total Tasks: {stats.tasksCount}</p>
 *       <p>Total Lists: {stats.listsCount}</p>
 *       <p>Storage Used: {(stats.storageSize / 1024).toFixed(2)} KB</p>
 *     </div>
 *   )
 * }
 */

/**
 * Example 7: Clear all data
 *
 * import { clearTaskState } from '@/utils/taskStorage'
 *
 * function ClearDataButton() {
 *   const handleClear = () => {
 *     if (confirm('Are you sure you want to delete all tasks?')) {
 *       clearTaskState()
 *       // Refresh page or reset state manually
 *       window.location.reload()
 *     }
 *   }
 *
 *   return <button onClick={handleClear}>Clear All Data</button>
 * }
 */

/**
 * ============================================================================
 * STORAGE DETAILS
 * ============================================================================
 */

/**
 * Storage Key: "quiettask_state"
 *
 * JSON Structure:
 * {
 *   "tasks": [
 *     {
 *       "id": "1234567890-abc123def",
 *       "title": "Task Title",
 *       "description": "Optional description",
 *       "completed": false,
 *       "priority": "medium",
 *       "dueDate": "2024-12-31T23:59:59.000Z",
 *       "createdAt": "2024-01-01T00:00:00.000Z",
 *       "updatedAt": "2024-01-01T00:00:00.000Z",
 *       "listId": "list-id",
 *       "tags": ["tag1", "tag2"],
 *       "recurrence": "none",
 *       "parentTaskId": undefined
 *     }
 *   ],
 *   "lists": [
 *     {
 *       "id": "list-1234567890",
 *       "title": "My List",
 *       "description": "List description",
 *       "color": "#FF6B35",
 *       "createdAt": "2024-01-01T00:00:00.000Z",
 *       "updatedAt": "2024-01-01T00:00:00.000Z",
 *       "taskCount": 5,
 *       "order": 0
 *     }
 *   ]
 * }
 */

/**
 * ============================================================================
 * PERSISTENCE BEHAVIOR
 * ============================================================================
 */

/**
 * AUTOMATIC INITIALIZATION:
 * - On app startup, TaskProvider loads saved state from localStorage
 * - If no saved state exists, starts with empty arrays
 * - Sets isLoading to true during load, false when complete
 *
 * AUTOMATIC PERSISTENCE:
 * - Every task/list change triggers a save to localStorage
 * - Save is debounced by 500ms to avoid excessive writes
 * - If multiple changes happen quickly, only one save occurs
 * - Save includes error handling and console logging
 *
 * OFFLINE BEHAVIOR:
 * - All operations work completely offline
 * - Changes are saved to localStorage immediately
 * - When online, no special sync needed (this is local-first)
 * - Perfect for PWA and offline-first applications
 */

/**
 * ============================================================================
 * BROWSER STORAGE LIMITS
 * ============================================================================
 */

/**
 * localStorage has these typical limits:
 * - Chrome: ~10MB per origin
 * - Firefox: ~10MB per origin
 * - Safari: ~5MB per origin
 * - IE: ~10MB per origin
 *
 * QuietTask tasks are very small (< 500 bytes each typically)
 * This means you can store 20,000+ tasks before hitting limits
 *
 * If storage limit is exceeded:
 * - Browser will throw QuotaExceededError
 * - TaskProvider catches and logs this error
 * - App continues functioning with in-memory state
 * - User should export and clear old data
 */

/**
 * ============================================================================
 * MIGRATION & UPGRADE
 * ============================================================================
 */

/**
 * Storage Version: 1
 *
 * Future migrations:
 * 1. loadTaskState() can handle version detection
 * 2. importTasksFromJSON() handles both versioned and unversioned data
 * 3. When format changes, update version number in exportTasksAsJSON()
 * 4. Add migration logic to handle old formats
 */

/**
 * ============================================================================
 * DEBUGGING
 * ============================================================================
 */

/**
 * To debug localStorage in the browser console:
 *
 * // View stored data
 * JSON.parse(localStorage.getItem('quiettask_state'))
 *
 * // Check storage size
 * new Blob([localStorage.getItem('quiettask_state')]).size + ' bytes'
 *
 * // Manually clear (WARNING: deletes all tasks!)
 * localStorage.removeItem('quiettask_state')
 *
 * // Get stats
 * const { getStorageStats } = await import('./utils/taskStorage')
 * getStorageStats()
 */

// This file is for documentation only - no exports needed
export {}
