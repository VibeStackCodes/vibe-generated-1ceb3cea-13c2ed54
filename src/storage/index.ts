/**
 * Storage Module Index
 * Central export point for all storage-related utilities
 */

// Configuration
export * from '@/config/storageConfig'

// Utilities
export {
  loadTaskState,
  saveTaskState,
  clearTaskState,
  restoreFromBackup,
  exportTasksAsJSON,
  importTasksFromJSON,
  isLocalStorageAvailable,
  getStorageStats,
  getAvailableStorageSpace,
  createStorageSyncManager,
  type StorageStats,
} from '@/utils/taskStorage'

export {
  storageManager,
  getStorageManager,
  type StorageEvent,
  type StorageManagerStats,
} from '@/utils/storageManager'

// Hooks
export {
  useLocalStorage,
  useLoadLocalStorage,
  useStorageDiagnostics,
  type UseLocalStorageOptions,
} from '@/hooks/useLocalStorage'

export {
  useStoragePersistence,
  type StoragePersistenceOptions,
  type StoragePersistenceStats,
} from '@/hooks/useStoragePersistence'

export {
  useStorageManager,
  useStorageQuota,
  useStorageEvents,
} from '@/hooks/useStorageManager'

// Types
export type { Task, TaskList, TaskState } from '@/types/task'
