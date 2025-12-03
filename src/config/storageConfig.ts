/**
 * Storage Configuration
 * Centralized configuration for localStorage persistence
 * Defines keys, versions, and optimization settings for task storage
 */

/**
 * Storage configuration constants
 */
export const STORAGE_CONFIG = {
  // Primary storage key for task state
  STORAGE_KEY: 'quiettask_state',

  // Version tracking for migration support
  STORAGE_VERSION: 2,
  STORAGE_VERSION_KEY: 'quiettask_version',

  // Backup key for recovery
  BACKUP_KEY: 'quiettask_backup',

  // Metadata keys
  LAST_SYNC_KEY: 'quiettask_last_sync',
  SYNC_COUNT_KEY: 'quiettask_sync_count',
  ERROR_COUNT_KEY: 'quiettask_error_count',

  // Debounce settings (in milliseconds)
  DEBOUNCE_MS: 500,

  // Auto-save settings
  AUTO_SYNC_ENABLED: true,

  // Cleanup settings
  OLD_TASK_RETENTION_DAYS: 30,
  ARCHIVE_THRESHOLD_DAYS: 90,

  // Storage quota warnings
  QUOTA_WARNING_PERCENT: 80,
  QUOTA_CRITICAL_PERCENT: 95,

  // Retry settings
  MAX_RETRIES: 3,
  RETRY_DELAY_MS: 100,
} as const

/**
 * Storage feature flags
 */
export const STORAGE_FEATURES = {
  // Enable automatic backup creation before saves
  AUTO_BACKUP: true,

  // Enable compression of stored data (future enhancement)
  COMPRESSION_ENABLED: false,

  // Enable encryption of stored data (future enhancement)
  ENCRYPTION_ENABLED: false,

  // Enable diagnostics logging
  DIAGNOSTICS_ENABLED: process.env.NODE_ENV === 'development',

  // Enable storage usage monitoring
  MONITOR_USAGE: true,

  // Enable automatic cleanup of old tasks
  AUTO_CLEANUP: true,

  // Enable recovery attempts on load failure
  AUTO_RECOVERY: true,

  // Enable export/import functionality
  IMPORT_EXPORT: true,
} as const

/**
 * Storage thresholds
 */
export const STORAGE_THRESHOLDS = {
  // Warn if more than X tasks
  TASKS_WARNING_THRESHOLD: 10000,

  // Warn if more than X lists
  LISTS_WARNING_THRESHOLD: 1000,

  // Maximum tasks per list
  MAX_TASKS_PER_LIST: 50000,

  // Minimum available space before warnings (in bytes)
  MIN_AVAILABLE_SPACE: 1024 * 1024, // 1MB
} as const

/**
 * Default state shape for type safety
 */
export const DEFAULT_STATE = {
  tasks: [],
  lists: [],
} as const

/**
 * Storage encryption config (for future use)
 */
export const ENCRYPTION_CONFIG = {
  ALGORITHM: 'AES-256-GCM',
  KEY_DERIVATION: 'PBKDF2',
  ITERATIONS: 100000,
} as const

/**
 * Get storage config for current environment
 */
export function getStorageConfig() {
  return {
    ...STORAGE_CONFIG,
    ...STORAGE_FEATURES,
    ...STORAGE_THRESHOLDS,
  }
}

/**
 * Validate storage configuration
 */
export function validateStorageConfig(): {
  valid: boolean
  warnings: string[]
} {
  const warnings: string[] = []

  if (STORAGE_CONFIG.DEBOUNCE_MS < 100) {
    warnings.push('Debounce time is very low, may cause performance issues')
  }

  if (STORAGE_CONFIG.DEBOUNCE_MS > 5000) {
    warnings.push('Debounce time is very high, may cause data loss on page refresh')
  }

  if (STORAGE_CONFIG.MAX_RETRIES < 1) {
    warnings.push('Max retries should be at least 1')
  }

  if (STORAGE_CONFIG.OLD_TASK_RETENTION_DAYS < 7) {
    warnings.push('Task retention is less than 7 days')
  }

  return {
    valid: warnings.length === 0,
    warnings,
  }
}
