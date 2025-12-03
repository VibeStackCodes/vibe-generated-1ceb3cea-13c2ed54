/**
 * Unified exports for all task management hooks
 * Provides convenient importing from @/hooks
 *
 * Hook Categories:
 * - Core: Basic task state access
 * - Advanced: Complex state transformations and analytics
 * - Reducer: useReducer-based state management patterns
 * - Performance: Memoization and optimization utilities
 * - Composition: Event listeners, notifications, and workflows
 * - Storage: localStorage persistence and diagnostics
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

// Reducer-based state management hooks
export {
  useTaskStateReducer,
  useTaskStateHistory,
  useImmutableStateUpdate,
  useTaskReducerWithMiddleware,
  taskReducer,
  type TaskReducerAction,
  type ReducerMiddleware,
} from './useTaskReducer'

// Performance optimization hooks
export {
  useTaskSelector,
  useMemoizedTasks,
  useMemoizedTaskLists,
  useDebouncedValue,
  useDebouncedCallback,
  useThrottledCallback,
  useTaskMap,
  useListMap,
  useMemoizedFilteredTasks,
  useMemoizedSortedTasks,
  useHasMounted,
  usePrevious,
  useHasChanged,
  useStableCallback,
  useRenderMetrics,
  shallowEqual,
  deepEqual,
} from './useTaskPerformance'

// State composition and workflow hooks
export {
  useTaskEventListener,
  useTaskNotifications,
  useStateChangeSummary,
  useConditionalTaskOperations,
  useDependentTaskOperations,
  useTaskStateCache,
  useAsyncTaskOperation,
  useTaskStateSerializer,
  useBatchOperationProgress,
  type TaskEventType,
  type TaskEventListener,
  type TaskEvent,
  type TaskNotificationOptions,
  type StateChangeSummary,
  type ConditionalTaskOperation,
  type AsyncTaskOperationState,
} from './useTaskComposition'

// localStorage hooks
export { useLocalStorage, useLoadLocalStorage } from './useLocalStorage'

// Storage persistence hooks
export { useStoragePersistence, useStorageDiagnostics } from './useStoragePersistence'

// Storage manager hooks
export { useStorageManager, useStorageQuota, useStorageEvents } from './useStorageManager'

// Type re-exports for convenience
export type { TaskContextType } from '@/context/TaskContext'
export type { TaskState, Task, TaskList, TaskFilter, TaskSort, TaskPriority } from '@/types/task'
