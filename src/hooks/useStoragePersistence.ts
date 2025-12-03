/**
 * Advanced Storage Persistence Hook
 * Provides comprehensive control over localStorage persistence with lifecycle management
 * Features: auto-save, debouncing, manual save/load, backup recovery, diagnostics
 */

import { useEffect, useCallback, useRef, useState } from 'react'
import {
  loadTaskState,
  saveTaskState,
  clearTaskState,
  restoreFromBackup,
  isLocalStorageAvailable,
  getStorageStats,
  getAvailableStorageSpace,
  exportTasksAsJSON,
  importTasksFromJSON,
} from '@/utils/taskStorage'
import type { Task, TaskList } from '@/types/task'

interface StoragePersistenceOptions {
  autoSync?: boolean
  debounceMs?: number
  enableDiagnostics?: boolean
  onSyncError?: (error: Error) => void
  onSyncSuccess?: () => void
  maxRetries?: number
}

interface StoragePersistenceStats {
  isSyncing: boolean
  lastSyncTime?: Date
  syncCount: number
  errorCount: number
  tasksCount: number
  listsCount: number
  storageSize: number
  availableSpace: number
}

/**
 * Advanced storage persistence hook for task state
 * Handles automatic persistence with comprehensive error handling and diagnostics
 */
export function useStoragePersistence(
  tasks: Task[],
  lists: TaskList[],
  onLoad: (tasks: Task[], lists: TaskList[]) => void,
  options: StoragePersistenceOptions = {}
) {
  const {
    autoSync = true,
    debounceMs = 500,
    enableDiagnostics = false,
    onSyncError,
    onSyncSuccess,
    maxRetries = 3,
  } = options

  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isStorageAvailableRef = useRef(isLocalStorageAvailable())
  const retryCountRef = useRef(0)

  const [stats, setStats] = useState<StoragePersistenceStats>({
    isSyncing: false,
    syncCount: 0,
    errorCount: 0,
    tasksCount: 0,
    listsCount: 0,
    storageSize: 0,
    availableSpace: 0,
  })

  /**
   * Update stats
   */
  const updateStats = useCallback(() => {
    if (!isStorageAvailableRef.current) return

    const storageStats = getStorageStats()
    const availableSpace = getAvailableStorageSpace()

    setStats((prev) => ({
      ...prev,
      tasksCount: storageStats.tasksCount,
      listsCount: storageStats.listsCount,
      storageSize: storageStats.totalSize,
      availableSpace,
    }))
  }, [])

  /**
   * Load initial state from localStorage on component mount
   */
  useEffect(() => {
    if (!isStorageAvailableRef.current) {
      console.warn('[useStoragePersistence] localStorage is not available')
      return
    }

    try {
      const loadedState = loadTaskState()
      onLoad(loadedState.tasks, loadedState.lists)

      if (enableDiagnostics) {
        console.log('[useStoragePersistence] Loaded state:', loadedState)
        updateStats()
      }
    } catch (error) {
      console.error('[useStoragePersistence] Failed to load state:', error)
      if (onSyncError && error instanceof Error) {
        onSyncError(error)
      }
    }
  }, [onLoad, enableDiagnostics, updateStats])

  /**
   * Setup debounced save function with retry logic
   */
  const debouncedSave = useCallback(() => {
    if (!autoSync || !isStorageAvailableRef.current) return

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => {
      setStats((prev) => ({ ...prev, isSyncing: true }))

      try {
        saveTaskState({ tasks, lists })
        retryCountRef.current = 0

        setStats((prev) => ({
          ...prev,
          isSyncing: false,
          lastSyncTime: new Date(),
          syncCount: prev.syncCount + 1,
        }))

        if (enableDiagnostics) {
          console.log('[useStoragePersistence] Successfully synced to storage')
          updateStats()
        }

        onSyncSuccess?.()
      } catch (error) {
        console.error('[useStoragePersistence] Failed to save state:', error)

        // Retry logic
        if (retryCountRef.current < maxRetries) {
          retryCountRef.current++
          console.log(
            `[useStoragePersistence] Retrying save (${retryCountRef.current}/${maxRetries})...`
          )
          debouncedSave()
        } else {
          setStats((prev) => ({
            ...prev,
            isSyncing: false,
            errorCount: prev.errorCount + 1,
          }))
          if (onSyncError && error instanceof Error) {
            onSyncError(error)
          }
        }
      }
    }, debounceMs)

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [tasks, lists, autoSync, debounceMs, enableDiagnostics, onSyncSuccess, onSyncError, maxRetries, updateStats])

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
   * Force immediate save without debounce
   */
  const forceSave = useCallback((): boolean => {
    if (!isStorageAvailableRef.current) {
      console.warn('[useStoragePersistence] localStorage is not available')
      return false
    }
    try {
      saveTaskState({ tasks, lists })
      updateStats()
      return true
    } catch (error) {
      console.error('[useStoragePersistence] Failed to save state:', error)
      if (onSyncError && error instanceof Error) {
        onSyncError(error)
      }
      return false
    }
  }, [tasks, lists, updateStats, onSyncError])

  /**
   * Force load from storage
   */
  const forceLoad = useCallback((): boolean => {
    if (!isStorageAvailableRef.current) {
      console.warn('[useStoragePersistence] localStorage is not available')
      return false
    }
    try {
      const loadedState = loadTaskState()
      onLoad(loadedState.tasks, loadedState.lists)
      updateStats()
      return true
    } catch (error) {
      console.error('[useStoragePersistence] Failed to load state:', error)
      if (onSyncError && error instanceof Error) {
        onSyncError(error)
      }
      return false
    }
  }, [onLoad, updateStats, onSyncError])

  /**
   * Clear storage
   */
  const clear = useCallback((keepBackup: boolean = true): boolean => {
    if (!isStorageAvailableRef.current) {
      console.warn('[useStoragePersistence] localStorage is not available')
      return false
    }
    try {
      clearTaskState(keepBackup)
      setStats((prev) => ({
        ...prev,
        tasksCount: 0,
        listsCount: 0,
        storageSize: 0,
      }))
      return true
    } catch (error) {
      console.error('[useStoragePersistence] Failed to clear state:', error)
      if (onSyncError && error instanceof Error) {
        onSyncError(error)
      }
      return false
    }
  }, [onSyncError])

  /**
   * Restore from backup
   */
  const restore = useCallback((): boolean => {
    if (!isStorageAvailableRef.current) {
      console.warn('[useStoragePersistence] localStorage is not available')
      return false
    }
    try {
      const success = restoreFromBackup()
      if (success) {
        const loadedState = loadTaskState()
        onLoad(loadedState.tasks, loadedState.lists)
        updateStats()
      }
      return success
    } catch (error) {
      console.error('[useStoragePersistence] Failed to restore:', error)
      if (onSyncError && error instanceof Error) {
        onSyncError(error)
      }
      return false
    }
  }, [onLoad, updateStats, onSyncError])

  /**
   * Export data as JSON
   */
  const exportAsJSON = useCallback((): string | null => {
    try {
      return exportTasksAsJSON({ tasks, lists })
    } catch (error) {
      console.error('[useStoragePersistence] Failed to export JSON:', error)
      if (onSyncError && error instanceof Error) {
        onSyncError(error)
      }
      return null
    }
  }, [tasks, lists, onSyncError])

  /**
   * Import data from JSON
   */
  const importFromJSON = useCallback((jsonString: string): boolean => {
    try {
      const imported = importTasksFromJSON(jsonString)
      onLoad(imported.tasks, imported.lists)
      return true
    } catch (error) {
      console.error('[useStoragePersistence] Failed to import JSON:', error)
      if (onSyncError && error instanceof Error) {
        onSyncError(error)
      }
      return false
    }
  }, [onLoad, onSyncError])

  return {
    stats,
    forceSave,
    forceLoad,
    clear,
    restore,
    exportAsJSON,
    importFromJSON,
    isAvailable: isStorageAvailableRef.current,
  }
}

/**
 * Hook for storage diagnostics and monitoring
 */
export function useStorageDiagnostics() {
  const [isAvailable, setIsAvailable] = useState(false)
  const [stats, setStats] = useState(getStorageStats())
  const [availableSpace, setAvailableSpace] = useState(0)

  useEffect(() => {
    setIsAvailable(isLocalStorageAvailable())
    setStats(getStorageStats())
    setAvailableSpace(getAvailableStorageSpace())
  }, [])

  const refresh = useCallback(() => {
    setIsAvailable(isLocalStorageAvailable())
    setStats(getStorageStats())
    setAvailableSpace(getAvailableStorageSpace())
  }, [])

  const getUsagePercent = useCallback((): number => {
    if (availableSpace === 0) return 0
    const total = stats.totalSize + availableSpace
    return (stats.totalSize / total) * 100
  }, [stats.totalSize, availableSpace])

  return {
    isAvailable,
    stats,
    availableSpace,
    usagePercent: getUsagePercent(),
    refresh,
  }
}
