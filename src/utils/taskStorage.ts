/**
 * Task Storage Utilities
 * Handles persistence of task state to localStorage
 * Enables local-first storage as per QuietTask requirements
 * Features: automatic save/load, serialization, export/import, migration support
 */

import type { Task, TaskList, TaskState } from '@/types/task'

const STORAGE_KEY = 'quiettask_state'
const STORAGE_VERSION = 2
const STORAGE_VERSION_KEY = 'quiettask_version'
const BACKUP_KEY = 'quiettask_backup'

/**
 * Load task state from localStorage
 * Returns default empty state if no stored data exists
 * Handles version migration and recovery from corrupted data
 */
export function loadTaskState(): Omit<TaskState, 'filter' | 'sort'> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) {
      console.log('[TaskStorage] No saved state found, initializing empty state')
      return { tasks: [], lists: [] }
    }

    const parsed = JSON.parse(stored)

    // Handle version migration
    const version = parseInt(localStorage.getItem(STORAGE_VERSION_KEY) || '1', 10)
    if (version < STORAGE_VERSION) {
      console.log(`[TaskStorage] Migrating from version ${version} to ${STORAGE_VERSION}`)
      migrateTaskState(version, parsed)
    }

    // Convert date strings back to Date objects with validation
    const tasks = (parsed.tasks || [])
      .filter((task: any) => task && typeof task === 'object')
      .map((task: any) => ({
        ...task,
        createdAt: task.createdAt ? new Date(task.createdAt) : new Date(),
        updatedAt: task.updatedAt ? new Date(task.updatedAt) : new Date(),
        dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
      }))

    const lists = (parsed.lists || [])
      .filter((list: any) => list && typeof list === 'object')
      .map((list: any) => ({
        ...list,
        createdAt: list.createdAt ? new Date(list.createdAt) : new Date(),
        updatedAt: list.updatedAt ? new Date(list.updatedAt) : new Date(),
      }))

    console.log(
      `[TaskStorage] Successfully loaded ${tasks.length} tasks and ${lists.length} lists from localStorage`
    )
    return { tasks, lists }
  } catch (error) {
    console.error('[TaskStorage] Error loading state from localStorage:', error)
    // Attempt recovery from backup
    try {
      const backup = localStorage.getItem(BACKUP_KEY)
      if (backup) {
        console.log('[TaskStorage] Attempting recovery from backup...')
        localStorage.setItem(STORAGE_KEY, backup)
        return loadTaskState()
      }
    } catch (backupError) {
      console.error('[TaskStorage] Failed to recover from backup:', backupError)
    }
    return { tasks: [], lists: [] }
  }
}

/**
 * Migrate task state between versions
 */
function migrateTaskState(fromVersion: number, state: any): void {
  if (fromVersion < 2) {
    // Version 1 to 2: Add version key
    console.log('[TaskStorage] Applying migration v1->v2')
    // Add any necessary transformations here
  }
  localStorage.setItem(STORAGE_VERSION_KEY, STORAGE_VERSION.toString())
}

/**
 * Save task state to localStorage
 * Automatically serializes Date objects to ISO strings
 * Creates backup before saving to enable recovery from corruption
 */
export function saveTaskState(state: Pick<TaskState, 'tasks' | 'lists'>): void {
  try {
    // Create backup of previous state
    const currentState = localStorage.getItem(STORAGE_KEY)
    if (currentState) {
      try {
        localStorage.setItem(BACKUP_KEY, currentState)
      } catch (backupError) {
        console.warn('[TaskStorage] Could not create backup:', backupError)
      }
    }

    const serializable = {
      tasks: state.tasks.map((task) => ({
        ...task,
        createdAt: task.createdAt.toISOString(),
        updatedAt: task.updatedAt.toISOString(),
        dueDate: task.dueDate?.toISOString(),
      })),
      lists: state.lists.map((list) => ({
        ...list,
        createdAt: list.createdAt.toISOString(),
        updatedAt: list.updatedAt.toISOString(),
      })),
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(serializable))
    localStorage.setItem(STORAGE_VERSION_KEY, STORAGE_VERSION.toString())

    console.log(
      `[TaskStorage] Successfully saved ${state.tasks.length} tasks and ${state.lists.length} lists to localStorage`
    )
  } catch (error) {
    console.error('[TaskStorage] Error saving state to localStorage:', error)
    // Handle quota exceeded errors gracefully
    if (error instanceof DOMException && error.code === 22) {
      console.warn('[TaskStorage] localStorage quota exceeded - attempting cleanup')
      pruneOldTasksForSpace()
    }
  }
}

/**
 * Prune old completed tasks to free up storage space
 * Keeps recent incomplete tasks and maintains lists
 */
function pruneOldTasksForSpace(): void {
  try {
    const state = loadTaskState()

    // Remove completed tasks older than 30 days
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const pruned = {
      tasks: state.tasks.filter(
        (task) => !task.completed || task.updatedAt > thirtyDaysAgo
      ),
      lists: state.lists,
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(pruned))
    console.log('[TaskStorage] Pruned old tasks to free up space')
  } catch (error) {
    console.error('[TaskStorage] Error pruning tasks:', error)
  }
}

/**
 * Clear all task data from localStorage
 * Optionally keep backup for recovery
 */
export function clearTaskState(keepBackup: boolean = true): void {
  try {
    if (!keepBackup) {
      localStorage.removeItem(BACKUP_KEY)
    }
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem(STORAGE_VERSION_KEY)
    console.log('[TaskStorage] Task state cleared from localStorage')
  } catch (error) {
    console.error('[TaskStorage] Error clearing localStorage:', error)
  }
}

/**
 * Restore from backup
 */
export function restoreFromBackup(): boolean {
  try {
    const backup = localStorage.getItem(BACKUP_KEY)
    if (!backup) {
      console.warn('[TaskStorage] No backup available to restore')
      return false
    }
    localStorage.setItem(STORAGE_KEY, backup)
    console.log('[TaskStorage] Successfully restored from backup')
    return true
  } catch (error) {
    console.error('[TaskStorage] Error restoring from backup:', error)
    return false
  }
}

/**
 * Export task data as JSON
 * Useful for backup and sharing
 */
export function exportTasksAsJSON(
  state: Pick<TaskState, 'tasks' | 'lists'>
): string {
  const serializable = {
    version: 1,
    exportDate: new Date().toISOString(),
    tasks: state.tasks.map((task) => ({
      ...task,
      createdAt: task.createdAt.toISOString(),
      updatedAt: task.updatedAt.toISOString(),
      dueDate: task.dueDate?.toISOString(),
    })),
    lists: state.lists.map((list) => ({
      ...list,
      createdAt: list.createdAt.toISOString(),
      updatedAt: list.updatedAt.toISOString(),
    })),
  }

  return JSON.stringify(serializable, null, 2)
}

/**
 * Import task data from JSON
 * Used for restoring backups or importing from other sources
 */
export function importTasksFromJSON(
  jsonString: string
): Pick<TaskState, 'tasks' | 'lists'> {
  try {
    const parsed = JSON.parse(jsonString)

    // Handle both versioned and unversioned imports
    const data = parsed.version ? parsed : parsed

    const tasks = (data.tasks || []).map((task: any) => ({
      ...task,
      createdAt: new Date(task.createdAt),
      updatedAt: new Date(task.updatedAt),
      dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
    }))

    const lists = (data.lists || []).map((list: any) => ({
      ...list,
      createdAt: new Date(list.createdAt),
      updatedAt: new Date(list.updatedAt),
    }))

    return { tasks, lists }
  } catch (error) {
    console.error('[TaskStorage] Error importing tasks from JSON:', error)
    throw new Error('Failed to import tasks: Invalid JSON format')
  }
}

/**
 * Get storage usage statistics
 */
export function getStorageStats(): {
  tasksCount: number
  listsCount: number
  storageSize: number
  backupSize: number
  totalSize: number
} {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    const backup = localStorage.getItem(BACKUP_KEY)
    const data = stored ? JSON.parse(stored) : { tasks: [], lists: [] }

    const storageSize = stored ? new Blob([stored]).size : 0
    const backupSize = backup ? new Blob([backup]).size : 0

    return {
      tasksCount: (data.tasks || []).length,
      listsCount: (data.lists || []).length,
      storageSize,
      backupSize,
      totalSize: storageSize + backupSize,
    }
  } catch (error) {
    console.error('[TaskStorage] Error getting storage stats:', error)
    return { tasksCount: 0, listsCount: 0, storageSize: 0, backupSize: 0, totalSize: 0 }
  }
}

/**
 * Get available localStorage space
 * Returns available space in bytes
 */
export function getAvailableStorageSpace(): number {
  try {
    const test = '__storage_test__'
    localStorage.setItem(test, test)
    localStorage.removeItem(test)

    // Rough estimate: try adding progressively larger data until quota is exceeded
    let available = 0
    const testSize = 1024 * 1024 // Start with 1MB
    const testData = 'x'.repeat(testSize)

    try {
      localStorage.setItem(test, testData)
      localStorage.removeItem(test)
      available = testSize
    } catch {
      // Quota exceeded, estimated
      available = 0
    }

    return available
  } catch (error) {
    console.warn('[TaskStorage] Could not determine available storage space')
    return 0
  }
}

/**
 * Validate localStorage is accessible
 */
export function isLocalStorageAvailable(): boolean {
  try {
    const test = '__storage_test__'
    localStorage.setItem(test, test)
    localStorage.removeItem(test)
    return true
  } catch {
    console.warn('[TaskStorage] localStorage is not available')
    return false
  }
}

/**
 * Sync state with localStorage whenever it changes
 * Can be used with a useEffect hook in TaskProvider
 */
export function createStorageSyncManager(
  onStateChange: (state: Pick<TaskState, 'tasks' | 'lists'>) => void
) {
  return {
    syncToStorage: (state: Pick<TaskState, 'tasks' | 'lists'>) => {
      saveTaskState(state)
    },
    loadFromStorage: () => {
      const state = loadTaskState()
      onStateChange(state)
      return state
    },
    clearStorage: () => {
      clearTaskState()
    },
  }
}
