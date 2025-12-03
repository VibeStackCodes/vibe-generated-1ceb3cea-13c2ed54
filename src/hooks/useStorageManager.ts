/**
 * useStorageManager Hook
 * Provides easy access to storage manager functionality
 * Handles event subscription and cleanup
 */

import { useEffect, useCallback, useState } from 'react'
import { storageManager, type StorageEvent } from '@/utils/storageManager'
import type { Task, TaskList, TaskState } from '@/types/task'

interface StorageManagerStats {
  lastSyncTime?: Date
  syncCount: number
  errorCount: number
  warningCount: number
  isOnline: boolean
  storageAvailable: boolean
  tasksCount: number
  listsCount: number
  storageSize: number
  availableSpace: number
  usagePercent: number
}

/**
 * Hook for accessing storage manager
 * Automatically subscribes to storage events and provides stats
 */
export function useStorageManager() {
  const [stats, setStats] = useState<StorageManagerStats>(() =>
    storageManager.getStats()
  )
  const [lastEvent, setLastEvent] = useState<StorageEvent | null>(null)

  /**
   * Update stats
   */
  const updateStats = useCallback(() => {
    setStats(storageManager.getStats())
  }, [])

  /**
   * Handle storage events
   */
  useEffect(() => {
    const unsubscribe = storageManager.addEventListener((event) => {
      setLastEvent(event)
      updateStats()
    })

    // Initial update
    updateStats()

    return unsubscribe
  }, [updateStats])

  /**
   * Sync state to storage
   */
  const sync = useCallback((state: Pick<TaskState, 'tasks' | 'lists'>) => {
    const success = storageManager.sync(state)
    updateStats()
    return success
  }, [updateStats])

  /**
   * Load state from storage
   */
  const load = useCallback(() => {
    return storageManager.load()
  }, [])

  /**
   * Clear all storage
   */
  const clear = useCallback((keepBackup: boolean = true) => {
    const success = storageManager.clear(keepBackup)
    updateStats()
    return success
  }, [updateStats])

  /**
   * Restore from backup
   */
  const restore = useCallback(() => {
    const success = storageManager.restoreBackup()
    updateStats()
    return success
  }, [updateStats])

  /**
   * Export data as JSON
   */
  const exportData = useCallback((state: Pick<TaskState, 'tasks' | 'lists'>) => {
    return storageManager.export(state)
  }, [])

  /**
   * Import data from JSON
   */
  const importData = useCallback((jsonString: string) => {
    const state = storageManager.import(jsonString)
    updateStats()
    return state
  }, [updateStats])

  return {
    // Stats
    stats,
    lastEvent,

    // Operations
    sync,
    load,
    clear,
    restore,
    exportData,
    importData,

    // Status checks
    isAvailable: storageManager.isAvailable(),
    isOnline: storageManager.isOnline(),
    isQuotaLow: storageManager.isQuotaLow(),
    isQuotaCritical: storageManager.isQuotaCritical(),

    // Utils
    updateStats,
    resetStats: () => {
      storageManager.resetStats()
      updateStats()
    },
  }
}

/**
 * Hook for storage quota monitoring
 * Useful for showing storage usage indicators
 */
export function useStorageQuota() {
  const [quota, setQuota] = useState(() => {
    const stats = storageManager.getStats()
    return {
      used: stats.storageSize,
      available: stats.availableSpace,
      total: stats.storageSize + stats.availableSpace,
      percent: stats.usagePercent,
    }
  })

  useEffect(() => {
    const unsubscribe = storageManager.addEventListener(() => {
      const stats = storageManager.getStats()
      setQuota({
        used: stats.storageSize,
        available: stats.availableSpace,
        total: stats.storageSize + stats.availableSpace,
        percent: stats.usagePercent,
      })
    })

    return unsubscribe
  }, [])

  return quota
}

/**
 * Hook for storage events
 * Useful for showing notifications or alerts
 */
export function useStorageEvents() {
  const [events, setEvents] = useState<StorageEvent[]>([])
  const [lastError, setLastError] = useState<StorageEvent | null>(null)
  const [lastWarning, setLastWarning] = useState<StorageEvent | null>(null)

  useEffect(() => {
    const unsubscribe = storageManager.addEventListener((event) => {
      setEvents((prev) => [...prev, event].slice(-10)) // Keep last 10 events

      if (event.type === 'error') {
        setLastError(event)
      } else if (event.type === 'warning') {
        setLastWarning(event)
      }
    })

    return unsubscribe
  }, [])

  return {
    events,
    lastError,
    lastWarning,
    clearEvents: () => setEvents([]),
  }
}
