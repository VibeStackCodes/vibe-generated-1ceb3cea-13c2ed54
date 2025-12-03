/**
 * Unified exports for all state management utilities
 * Provides convenient importing from @/utils
 */

// Storage utilities
export {
  loadTaskState,
  saveTaskState,
  clearTaskState,
  exportTasksAsJSON,
  importTasksFromJSON,
  getStorageStats,
  createStorageSyncManager,
  isLocalStorageAvailable,
  getAvailableStorageSpace,
  restoreFromBackup,
} from './taskStorage'

// App initialization
export {
  initializeApp,
  logInitializationStatus,
  canSyncToStorage,
  getStorageUsageSummary,
} from './appInitializer'

// Task operations
export { performTaskOperation } from './taskOperations'

// State helpers
export {
  createFilterBuilder,
  createSortBuilder,
  taskMatchesFilter,
  compareTasks,
  mergeTaskStates,
  calculateConflicts,
  cloneTask,
  cloneTaskList,
  cloneTaskState,
  isTaskOverdue,
  isTaskDueToday,
  isTaskDueSoon,
  getAllUniqueTags,
  groupTasksBy,
  calculateTaskStatistics,
  sanitizeTask,
  createDefaultTask,
  createDefaultTaskList,
  exportStatesToCSV,
  areTasksEqual,
  filterTasksMultiple,
  filterTasksAny,
  batchUpdateTasks,
} from './stateHelpers'

// Type re-exports
export type {
  FilterBuilder,
  SortBuilder,
  TaskStatistics,
  GroupedTasks,
  TaskGroupBy,
  StateSnapshot,
  StateHistory,
  BatchOperation,
  BatchOperationResult,
  ValidationResult,
  TaskSelector,
  StateListener,
  TaskListener,
  ListListener,
  StateMiddleware,
  ImportOptions,
  ExportOptions,
  StateChangeNotification,
  DerivedTaskState,
  ConflictResolution,
} from '@/types/taskStateUtils'

// Initialization types
export type { InitializationStatus } from './appInitializer'

// Utility type re-exports
export type {
  ReadonlyTask,
  ReadonlyTaskList,
  ReadonlyTaskState,
  TaskUpdate,
  TaskListUpdate,
  TaskCreationData,
  TaskListCreationData,
  TaskActionResult,
} from '@/types/taskStateUtils'

// Type guards
export {
  isTask,
  isTaskList,
  isValidPriority,
  isValidRecurrence,
} from '@/types/taskStateUtils'
