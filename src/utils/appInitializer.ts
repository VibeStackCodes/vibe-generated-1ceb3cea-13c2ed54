/**
 * App Initializer
 * Handles app-level initialization including localStorage setup and diagnostics
 * Ensures optimal startup performance and data integrity
 */

import {
  isLocalStorageAvailable,
  getStorageStats,
  loadTaskState,
  getAvailableStorageSpace,
} from './taskStorage'

/**
 * App initialization status
 */
export interface InitializationStatus {
  storageAvailable: boolean
  hasData: boolean
  dataLoaded: boolean
  stats: {
    tasksCount: number
    listsCount: number
    storageSize: number
    backupSize: number
    totalSize: number
  }
  availableSpace: number
  timestamp: Date
}

/**
 * Initialize app on startup
 * Verifies localStorage availability and checks for existing data
 * Returns initialization status for app state management
 */
export function initializeApp(): InitializationStatus {
  const startTime = performance.now()
  console.log('[AppInitializer] Starting app initialization...')

  const status: InitializationStatus = {
    storageAvailable: false,
    hasData: false,
    dataLoaded: false,
    stats: {
      tasksCount: 0,
      listsCount: 0,
      storageSize: 0,
      backupSize: 0,
      totalSize: 0,
    },
    availableSpace: 0,
    timestamp: new Date(),
  }

  try {
    // Check localStorage availability
    status.storageAvailable = isLocalStorageAvailable()
    console.log(`[AppInitializer] localStorage available: ${status.storageAvailable}`)

    if (!status.storageAvailable) {
      console.warn('[AppInitializer] localStorage is not available - app will work in memory only')
      return status
    }

    // Load and verify existing data
    try {
      const loadedState = loadTaskState()
      status.hasData = loadedState.tasks.length > 0 || loadedState.lists.length > 0
      status.dataLoaded = true

      console.log(
        `[AppInitializer] Loaded ${loadedState.tasks.length} tasks and ${loadedState.lists.length} lists`
      )
    } catch (loadError) {
      console.error('[AppInitializer] Error loading existing state:', loadError)
      status.dataLoaded = false
    }

    // Get storage statistics
    status.stats = getStorageStats()
    console.log(`[AppInitializer] Storage stats:`, status.stats)

    // Check available space
    status.availableSpace = getAvailableStorageSpace()
    console.log(`[AppInitializer] Available storage space: ${status.availableSpace} bytes`)

    // Warn if storage is getting full
    if (status.stats.totalSize > 0 && status.availableSpace > 0) {
      const usagePercent = (status.stats.totalSize / (status.stats.totalSize + status.availableSpace)) * 100
      if (usagePercent > 80) {
        console.warn(
          `[AppInitializer] Storage usage is high: ${usagePercent.toFixed(1)}%. Consider archiving old tasks.`
        )
      }
    }

    const endTime = performance.now()
    const duration = endTime - startTime
    console.log(`[AppInitializer] Initialization complete in ${duration.toFixed(2)}ms`)

    return status
  } catch (error) {
    console.error('[AppInitializer] Unexpected error during initialization:', error)
    return status
  }
}

/**
 * Log initialization status for debugging
 */
export function logInitializationStatus(status: InitializationStatus): void {
  console.group('[AppInitializer] Initialization Status Summary')
  console.log('Storage Available:', status.storageAvailable)
  console.log('Has Existing Data:', status.hasData)
  console.log('Data Successfully Loaded:', status.dataLoaded)
  console.log('Tasks Count:', status.stats.tasksCount)
  console.log('Lists Count:', status.stats.listsCount)
  console.log('Storage Usage:', `${(status.stats.totalSize / 1024).toFixed(2)} KB`)
  console.log('Available Space:', `${(status.availableSpace / 1024 / 1024).toFixed(2)} MB`)
  console.log('Timestamp:', status.timestamp.toISOString())
  console.groupEnd()
}

/**
 * Check if app can safely sync to localStorage
 */
export function canSyncToStorage(): boolean {
  return isLocalStorageAvailable()
}

/**
 * Get human-readable storage usage summary
 */
export function getStorageUsageSummary(): string {
  if (!isLocalStorageAvailable()) {
    return 'localStorage not available'
  }

  const stats = getStorageStats()
  const totalKB = (stats.totalSize / 1024).toFixed(2)
  const availableMB = (getAvailableStorageSpace() / 1024 / 1024).toFixed(2)

  return `${stats.tasksCount} tasks, ${stats.listsCount} lists, ${totalKB} KB used, ${availableMB} MB available`
}
