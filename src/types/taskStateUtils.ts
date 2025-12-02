/**
 * Advanced TypeScript utility types for task state management
 * Provides type-safe utilities for working with tasks, lists, and state
 */

import type {
  Task,
  TaskList,
  TaskFilter,
  TaskSort,
  TaskState,
  TaskPriority,
  RecurrenceType,
} from './task'

/**
 * Readonly versions of task types for immutable state snapshots
 */
export type ReadonlyTask = Readonly<Task>
export type ReadonlyTaskList = Readonly<TaskList>
export type ReadonlyTaskState = Readonly<TaskState>

/**
 * Partial update types for mutations
 */
export type TaskUpdate = Partial<Omit<Task, 'id' | 'createdAt'>>
export type TaskListUpdate = Partial<Omit<TaskList, 'id' | 'createdAt'>>

/**
 * Task creation types
 */
export type TaskCreationData = Omit<Task, 'id' | 'createdAt' | 'updatedAt'>
export type TaskListCreationData = Omit<TaskList, 'id' | 'createdAt' | 'updatedAt'>

/**
 * Action result types
 */
export type TaskActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string }

/**
 * Filter builder for type-safe filter creation
 */
export interface FilterBuilder {
  byCompleted(completed: boolean): FilterBuilder
  byPriority(priority: TaskPriority): FilterBuilder
  byListId(listId: string): FilterBuilder
  byTags(tags: string[]): FilterBuilder
  byDueDateRange(from: Date, to: Date): FilterBuilder
  build(): TaskFilter
  clear(): FilterBuilder
}

/**
 * Sort builder for type-safe sort creation
 */
export interface SortBuilder {
  by(field: 'dueDate' | 'priority' | 'createdAt' | 'title'): SortBuilder
  ascending(): SortBuilder
  descending(): SortBuilder
  build(): TaskSort
  clear(): SortBuilder
}

/**
 * Task statistics interface
 */
export interface TaskStatistics {
  total: number
  completed: number
  pending: number
  completionPercentage: number
  byPriority: {
    high: number
    medium: number
    low: number
  }
  byList: Record<string, number>
  overdue: number
  dueToday: number
  dueSoon: number // Next 7 days
}

/**
 * Task grouping results
 */
export type GroupedTasks = Record<string, Task[]>
export type TaskGroupBy = 'listId' | 'priority' | 'completed' | 'dueDate'

/**
 * Undo/Redo stack interface for state history
 */
export interface StateSnapshot {
  state: TaskState
  timestamp: Date
  description: string
}

export interface StateHistory {
  past: StateSnapshot[]
  present: TaskState
  future: StateSnapshot[]
}

/**
 * Batch operation interface for multiple mutations
 */
export interface BatchOperation {
  type: 'add' | 'update' | 'delete'
  target: 'task' | 'list'
  data: any
}

export interface BatchOperationResult {
  successful: number
  failed: number
  errors: Array<{ operation: BatchOperation; error: string }>
}

/**
 * Validation result type
 */
export type ValidationResult = {
  valid: true
} | {
  valid: false
  errors: string[]
}

/**
 * Task selector type - for memoized selectors
 */
export type TaskSelector<T> = (state: TaskState) => T

/**
 * Task listener/observer type - for state change notifications
 */
export type StateListener = (newState: TaskState, oldState: TaskState) => void
export type TaskListener = (newTasks: Task[], oldTasks: Task[]) => void
export type ListListener = (newLists: TaskList[], oldLists: TaskList[]) => void

/**
 * Middleware type for state mutations
 */
export type StateMiddleware = (
  action: string,
  payload: any,
  state: TaskState
) => void

/**
 * Import/Export interfaces
 */
export interface ImportOptions {
  merge?: boolean // true: merge with existing, false: replace
  conflictResolution?: 'keep' | 'replace' | 'merge'
  validateData?: boolean
}

export interface ExportOptions {
  includeTimestamps?: boolean
  compact?: boolean
  format?: 'json' | 'csv'
}

/**
 * Notification/Alert types for state changes
 */
export type StateChangeNotification =
  | { type: 'taskAdded'; task: Task }
  | { type: 'taskUpdated'; task: Task; changes: Partial<Task> }
  | { type: 'taskDeleted'; taskId: string }
  | { type: 'taskCompleted'; taskId: string }
  | { type: 'listAdded'; list: TaskList }
  | { type: 'listUpdated'; list: TaskList }
  | { type: 'listDeleted'; listId: string }
  | { type: 'filterChanged'; filter: TaskFilter }
  | { type: 'sortChanged'; sort: TaskSort }
  | { type: 'stateReset' }

/**
 * Derived state interfaces
 */
export interface DerivedTaskState {
  activeTasks: Task[]
  completedTasks: Task[]
  overdueTasks: Task[]
  tasksByPriority: Record<TaskPriority, Task[]>
  tasksByList: Record<string, Task[]>
  statistics: TaskStatistics
}

/**
 * Conflict resolution interface for sync operations
 */
export interface ConflictResolution {
  taskId: string
  localVersion: Task
  remoteVersion: Task
  resolution: 'local' | 'remote' | 'merge'
  mergedVersion?: Task
}

/**
 * Type guards and predicates
 */
export function isTask(obj: any): obj is Task {
  return (
    obj &&
    typeof obj === 'object' &&
    typeof obj.id === 'string' &&
    typeof obj.title === 'string' &&
    typeof obj.completed === 'boolean'
  )
}

export function isTaskList(obj: any): obj is TaskList {
  return (
    obj &&
    typeof obj === 'object' &&
    typeof obj.id === 'string' &&
    typeof obj.title === 'string' &&
    typeof obj.taskCount === 'number'
  )
}

export function isValidPriority(value: any): value is TaskPriority {
  return ['low', 'medium', 'high'].includes(value)
}

export function isValidRecurrence(value: any): value is RecurrenceType {
  return ['none', 'daily', 'weekly', 'monthly', 'custom'].includes(value)
}
