/**
 * Unified exports for all task management hooks
 * Provides convenient importing from @/hooks
 */

// Core hooks
export {
  useTask,
  useTasks,
  useTaskLists,
  useTaskFilter,
  useTaskSort,
  useTaskActions,
  useTaskLoading,
  useTasksByList,
  useFilteredTasks,
} from './useTask'

// Advanced hooks
export {
  useTaskStatistics,
  useGroupedTasks,
  useDerivedTaskState,
  useFilterBuilder,
  useSortBuilder,
  useTaskSearch,
  useTaskValidation,
  useTasksByTag,
  useCompletionTrend,
  useTasksByDateRange,
  useBulkTaskOperations,
  useTaskUndoRedoState,
} from './useTaskAdvanced'

// localStorage hooks
export { useLocalStorage, useLoadLocalStorage } from './useLocalStorage'

// Storage persistence hooks
export { useStoragePersistence, useStorageDiagnostics } from './useStoragePersistence'

// Type re-exports for convenience
export type { TaskContextType } from '@/context/TaskContext'
