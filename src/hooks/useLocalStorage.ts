/**
 * Custom hook for localStorage integration
 * Handles automatic persistence and loading of task state
 * Provides initialization and synchronization with localStorage
 * Features: auto-save, debouncing, backup/restore, diagnostics
 */

import { useEffect, useCallback, useRef } from 'react'
import {
  loadTaskState,
  saveTaskState,
  clearTaskState,
  restoreFromBackup,
  isLocalStorageAvailable,
  getStorageStats,
} from '@/utils/taskStorage'
import type { Task, TaskList } from '@/types/task'

interface UseLocalStorageOptions {
  autoSync?: boolean
  debounceMs?: number
  enableDiagnostics?: boolean
}

/**
 * Custom hook for managing localStorage persistence
 * Automatically loads state on mount and saves on changes
 * Includes optional debouncing to prevent excessive writes
 * Provides recovery and diagnostic capabilities
 */
export function useLocalStorage(
  tasks: Task[],
  lists: TaskList[],
  onLoad: (tasks: Task[], lists: TaskList[]) => void,
  options: UseLocalStorageOptions = {}
) {
  const { autoSync = true, debounceMs = 500, enableDiagnostics = false } = options
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isStorageAvailableRef = useRef(isLocalStorageAvailable())

  /**
   * Load initial state from localStorage on component mount
   */
  useEffect(() => {
    if (!isStorageAvailableRef.current) {
      console.warn('[useLocalStorage] localStorage is not available')
      return
    }

    try {
      const loadedState = loadTaskState()
      onLoad(loadedState.tasks, loadedState.lists)

      if (enableDiagnostics) {
        const stats = getStorageStats()
        console.log('[useLocalStorage] Diagnostics:', stats)
      }
    } catch (error) {
      console.error('[useLocalStorage] Failed to load state:', error)
    }
  }, [onLoad, enableDiagnostics])

  /**
   * Setup debounced save function
   */
  const debouncedSave = useCallback(() => {
    if (!autoSync || !isStorageAvailableRef.current) return

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => {
      try {
        saveTaskState({ tasks, lists })
      } catch (error) {
        console.error('[useLocalStorage] Failed to save state:', error)
      }
    }, debounceMs)

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [tasks, lists, autoSync, debounceMs])

  /**
   * Save to localStorage whenever tasks or lists change
   */
  useEffect(() => {
    const cleanup = debouncedSave()
    return cleanup
  }, [debouncedSave])

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  /**
   * Return utility functions for manual control
   */
  const forceSave = useCallback(() => {
    if (!isStorageAvailableRef.current) {
      console.warn('[useLocalStorage] localStorage is not available')
      return false
    }
    try {
      saveTaskState({ tasks, lists })
      return true
    } catch (error) {
      console.error('[useLocalStorage] Failed to save state:', error)
      return false
    }
  }, [tasks, lists])

  const clearStorage = useCallback((keepBackup: boolean = true) => {
    if (!isStorageAvailableRef.current) {
      console.warn('[useLocalStorage] localStorage is not available')
      return false
    }
    try {
      clearTaskState(keepBackup)
      return true
    } catch (error) {
      console.error('[useLocalStorage] Failed to clear state:', error)
      return false
    }
  }, [])

  const restore = useCallback(() => {
    if (!isStorageAvailableRef.current) {
      console.warn('[useLocalStorage] localStorage is not available')
      return false
    }
    try {
      const success = restoreFromBackup()
      if (success) {
        const loadedState = loadTaskState()
        onLoad(loadedState.tasks, loadedState.lists)
      }
      return success
    } catch (error) {
      console.error('[useLocalStorage] Failed to restore:', error)
      return false
    }
  }, [onLoad])

  return {
    forceSave,
    clearStorage,
    restore,
    isAvailable: isStorageAvailableRef.current,
    stats: getStorageStats(),
  }
}

/**
 * Simpler hook for just loading state from localStorage
 * Useful for components that only need to read, not persist
 */
export function useLoadLocalStorage() {
  const loadState = useCallback(() => {
    if (!isLocalStorageAvailable()) {
      console.warn('[useLoadLocalStorage] localStorage is not available')
      return { tasks: [], lists: [] }
    }
    try {
      return loadTaskState()
    } catch (error) {
      console.error('[useLoadLocalStorage] Failed to load state:', error)
      return { tasks: [], lists: [] }
    }
  }, [])

  return { loadState }
}

/**
 * Hook for storage diagnostics and management
 * Useful for debugging and monitoring storage usage
 */
export function useStorageDiagnostics() {
  const getStats = useCallback(() => {
    if (!isLocalStorageAvailable()) {
      return {
        available: false,
        stats: null,
      }
    }
    return {
      available: true,
      stats: getStorageStats(),
    }
  }, [])

  const refresh = useCallback(() => {
    return getStats()
  }, [getStats])

  return { getStats, refresh }
}
