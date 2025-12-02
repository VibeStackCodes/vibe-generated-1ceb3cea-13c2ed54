/**
 * Task-related type definitions
 * Core data structures for the QuietTask application
 */

export type TaskPriority = 'low' | 'medium' | 'high'
export type RecurrenceType = 'none' | 'daily' | 'weekly' | 'monthly' | 'custom'

/**
 * Represents a single task
 */
export interface Task {
  id: string
  title: string
  description?: string
  completed: boolean
  priority: TaskPriority
  dueDate?: Date
  createdAt: Date
  updatedAt: Date
  listId: string
  tags: string[]
  recurrence?: RecurrenceType
  parentTaskId?: string // For subtasks
}

/**
 * Represents a list/project
 */
export interface TaskList {
  id: string
  title: string
  description?: string
  color?: string
  createdAt: Date
  updatedAt: Date
  taskCount: number
  order: number
}

/**
 * Task filter options
 */
export interface TaskFilter {
  completed?: boolean
  priority?: TaskPriority
  listId?: string
  tags?: string[]
  dueDateFrom?: Date
  dueDateTo?: Date
}

/**
 * Task sort options
 */
export type TaskSortBy = 'dueDate' | 'priority' | 'createdAt' | 'title'
export type SortOrder = 'asc' | 'desc'

export interface TaskSort {
  sortBy: TaskSortBy
  order: SortOrder
}

/**
 * Task state snapshot for context
 */
export interface TaskState {
  tasks: Task[]
  lists: TaskList[]
  filter: TaskFilter
  sort: TaskSort
}
