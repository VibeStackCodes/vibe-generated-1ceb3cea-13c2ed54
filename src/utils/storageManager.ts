/**
 * Storage Manager
 * High-level API for managing localStorage persistence
 * Provides methods for save, load, sync, backup, and recovery
 * Integrates with storage configuration for optimal performance
 */

import {
  loadTaskState,
  saveTaskState,
  clearTaskState,
  restoreFromBackup,
  exportTasksAsJSON,
  importTasksFromJSON,
  isLocalStorageAvailable,
  getStorageStats,
  getAvailableStorageSpace,
} from './taskStorage'
import { STORAGE_CONFIG, STORAGE_FEATURES } from '@/config/storageConfig'
import type { Task, TaskList, TaskState } from '@/types/task'

/**
 * Storage manager events
 */
export interface StorageEvent {
  type: 'sync' | 'error' | 'warning' | 'info'
  message: string
  timestamp: Date
  data?: any
}

/**
 * Storage manager stats
 */
export interface StorageManagerStats {
  lastSyncTime?: Date
  syncCount: number
  errorCount: number
  warningCount: number
  isOnline: boolean
  storageAvailable: boolean
}

/**
 * Singleton storage manager
 */
class StorageManager {
  private static instance: StorageManager
  private eventListeners: ((event: StorageEvent) => void)[] = []
  private stats: StorageManagerStats = {
    syncCount: 0,
    errorCount: 0,
    warningCount: 0,
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    storageAvailable: isLocalStorageAvailable(),
  }

  private constructor() {
    this.initializeOnlineListener()
    this.loadStorageMetadata()
  }

  /**
   * Get singleton instance
   */
  static getInstance(): StorageManager {
    if (!StorageManager.instance) {
      StorageManager.instance = new StorageManager()
    }
    return StorageManager.instance
  }

  /**
   * Initialize online/offline listener
   */
  private initializeOnlineListener(): void {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.stats.isOnline = true
        this.emit('info', 'App is now online - syncing data')
      })
      window.addEventListener('offline', () => {
        this.stats.isOnline = false
        this.emit('warning', 'App is now offline - will sync when online')
      })
    }
  }

  /**
   * Load storage metadata from localStorage
   */
  private loadStorageMetadata(): void {
    try {
      const syncCount = localStorage.getItem(STORAGE_CONFIG.SYNC_COUNT_KEY)
      const errorCount = localStorage.getItem(STORAGE_CONFIG.ERROR_COUNT_KEY)
      const lastSync = localStorage.getItem(STORAGE_CONFIG.LAST_SYNC_KEY)

      if (syncCount) this.stats.syncCount = parseInt(syncCount, 10)
      if (errorCount) this.stats.errorCount = parseInt(errorCount, 10)
      if (lastSync) this.stats.lastSyncTime = new Date(lastSync)
    } catch (error) {
      console.warn('[StorageManager] Could not load metadata:', error)
    }
  }

  /**
   * Save storage metadata to localStorage
   */
  private saveStorageMetadata(): void {
    try {
      localStorage.setItem(STORAGE_CONFIG.SYNC_COUNT_KEY, this.stats.syncCount.toString())
      localStorage.setItem(STORAGE_CONFIG.ERROR_COUNT_KEY, this.stats.errorCount.toString())
      localStorage.setItem(
        STORAGE_CONFIG.LAST_SYNC_KEY,
        new Date().toISOString()
      )
    } catch (error) {
      console.warn('[StorageManager] Could not save metadata:', error)
    }
  }

  /**
   * Sync state to storage
   */
  sync(state: Pick<TaskState, 'tasks' | 'lists'>): boolean {
    try {
      if (!this.stats.storageAvailable) {
        this.emit(
          'warning',
          'Storage is not available - changes will not be persisted'
        )
        return false
      }

      saveTaskState(state)
      this.stats.syncCount++
      this.stats.lastSyncTime = new Date()
      this.saveStorageMetadata()

      this.emit('sync', 'Successfully synced to storage', {
        tasksCount: state.tasks.length,
        listsCount: state.lists.length,
      })

      return true
    } catch (error) {
      this.stats.errorCount++
      this.saveStorageMetadata()
      const message = error instanceof Error ? error.message : 'Unknown error'
      this.emit('error', `Failed to sync: ${message}`)
      return false
    }
  }

  /**
   * Load state from storage
   */
  load(): Pick<TaskState, 'tasks' | 'lists'> | null {
    try {
      if (!this.stats.storageAvailable) {
        this.emit('warning', 'Storage is not available')
        return null
      }

      const state = loadTaskState()
      this.emit('sync', 'Successfully loaded from storage', {
        tasksCount: state.tasks.length,
        listsCount: state.lists.length,
      })

      return state
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      this.emit('error', `Failed to load: ${message}`)
      return null
    }
  }

  /**
   * Clear all storage
   */
  clear(keepBackup: boolean = true): boolean {
    try {
      clearTaskState(keepBackup)
      this.stats.syncCount = 0
      this.stats.errorCount = 0
      this.saveStorageMetadata()
      this.emit('info', `Storage cleared${keepBackup ? ' (backup kept)' : ''}`)
      return true
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      this.emit('error', `Failed to clear: ${message}`)
      return false
    }
  }

  /**
   * Restore from backup
   */
  restoreBackup(): boolean {
    try {
      const success = restoreFromBackup()
      if (success) {
        this.emit('info', 'Successfully restored from backup')
      } else {
        this.emit('warning', 'No backup available')
      }
      return success
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      this.emit('error', `Failed to restore: ${message}`)
      return false
    }
  }

  /**
   * Export data as JSON
   */
  export(state: Pick<TaskState, 'tasks' | 'lists'>): string | null {
    try {
      const json = exportTasksAsJSON(state)
      this.emit('info', 'Successfully exported data')
      return json
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      this.emit('error', `Failed to export: ${message}`)
      return null
    }
  }

  /**
   * Import data from JSON
   */
  import(jsonString: string): Pick<TaskState, 'tasks' | 'lists'> | null {
    try {
      const state = importTasksFromJSON(jsonString)
      this.emit('info', `Successfully imported ${state.tasks.length} tasks and ${state.lists.length} lists`)
      return state
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      this.emit('error', `Failed to import: ${message}`)
      return null
    }
  }

  /**
   * Get storage statistics
   */
  getStats() {
    const storageStats = getStorageStats()
    const availableSpace = getAvailableStorageSpace()

    return {
      ...this.stats,
      ...storageStats,
      availableSpace,
      usagePercent:
        availableSpace > 0
          ? (storageStats.totalSize / (storageStats.totalSize + availableSpace)) * 100
          : 0,
    }
  }

  /**
   * Check if storage is available
   */
  isAvailable(): boolean {
    return this.stats.storageAvailable
  }

  /**
   * Check if app is online
   */
  isOnline(): boolean {
    return this.stats.isOnline
  }

  /**
   * Check if storage quota is low
   */
  isQuotaLow(): boolean {
    const stats = this.getStats()
    return stats.usagePercent > STORAGE_CONFIG.QUOTA_WARNING_PERCENT
  }

  /**
   * Check if storage quota is critical
   */
  isQuotaCritical(): boolean {
    const stats = this.getStats()
    return stats.usagePercent > STORAGE_CONFIG.QUOTA_CRITICAL_PERCENT
  }

  /**
   * Register event listener
   */
  addEventListener(listener: (event: StorageEvent) => void): () => void {
    this.eventListeners.push(listener)
    return () => {
      this.eventListeners = this.eventListeners.filter((l) => l !== listener)
    }
  }

  /**
   * Emit event
   */
  private emit(type: StorageEvent['type'], message: string, data?: any): void {
    const event: StorageEvent = {
      type,
      message,
      timestamp: new Date(),
      data,
    }

    if (STORAGE_FEATURES.DIAGNOSTICS_ENABLED) {
      console.log(`[StorageManager] ${type.toUpperCase()}: ${message}`, data)
    }

    this.eventListeners.forEach((listener) => {
      try {
        listener(event)
      } catch (error) {
        console.error('[StorageManager] Error in event listener:', error)
      }
    })
  }

  /**
   * Reset stats
   */
  resetStats(): void {
    this.stats = {
      syncCount: 0,
      errorCount: 0,
      warningCount: 0,
      isOnline: this.stats.isOnline,
      storageAvailable: this.stats.storageAvailable,
    }
    this.saveStorageMetadata()
  }
}

/**
 * Export singleton instance
 */
export const storageManager = StorageManager.getInstance()

/**
 * Get storage manager instance
 */
export function getStorageManager(): StorageManager {
  return StorageManager.getInstance()
}
