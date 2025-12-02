/**
 * Task Storage Utilities
 * Handles persistence of task state to localStorage
 * Enables local-first storage as per QuietTask requirements
 */

import type { Task, TaskList, TaskState } from '@/types/task'

const STORAGE_KEY = 'quiettask_state'

/**
 * Load task state from localStorage
 * Returns default empty state if no stored data exists
 */
export function loadTaskState(): Omit<TaskState, 'filter' | 'sort'> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) {
      return { tasks: [], lists: [] }
    }

    const parsed = JSON.parse(stored)

    // Convert date strings back to Date objects
    const tasks = (parsed.tasks || []).map((task: any) => ({
      ...task,
      createdAt: new Date(task.createdAt),
      updatedAt: new Date(task.updatedAt),
      dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
    }))

    const lists = (parsed.lists || []).map((list: any) => ({
      ...list,
      createdAt: new Date(list.createdAt),
      updatedAt: new Date(list.updatedAt),
    }))

    return { tasks, lists }
  } catch (error) {
    console.error('[TaskStorage] Error loading state from localStorage:', error)
    return { tasks: [], lists: [] }
  }
}

/**
 * Save task state to localStorage
 * Automatically serializes Date objects to ISO strings
 */
export function saveTaskState(state: Pick<TaskState, 'tasks' | 'lists'>): void {
  try {
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
  } catch (error) {
    console.error('[TaskStorage] Error saving state to localStorage:', error)
  }
}

/**
 * Clear all task data from localStorage
 */
export function clearTaskState(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (error) {
    console.error('[TaskStorage] Error clearing localStorage:', error)
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
} {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    const data = stored ? JSON.parse(stored) : { tasks: [], lists: [] }

    return {
      tasksCount: (data.tasks || []).length,
      listsCount: (data.lists || []).length,
      storageSize: stored ? new Blob([stored]).size : 0,
    }
  } catch (error) {
    console.error('[TaskStorage] Error getting storage stats:', error)
    return { tasksCount: 0, listsCount: 0, storageSize: 0 }
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
