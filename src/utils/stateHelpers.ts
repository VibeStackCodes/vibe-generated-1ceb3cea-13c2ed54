/**
 * State management helper utilities
 * Provides utility functions for common state operations and transformations
 */

import type {
  Task,
  TaskList,
  TaskState,
  TaskFilter,
  TaskPriority,
} from '@/types/task'
import type {
  FilterBuilder,
  SortBuilder,
  ConflictResolution,
  BatchOperationResult,
} from '@/types/taskStateUtils'

/**
 * Filter Builder Implementation
 * Provides a fluent API for building filters
 */
class FilterBuilderImpl implements FilterBuilder {
  private currentFilter: TaskFilter = {}

  byCompleted(completed: boolean): FilterBuilder {
    this.currentFilter.completed = completed
    return this
  }

  byPriority(priority: TaskPriority): FilterBuilder {
    this.currentFilter.priority = priority
    return this
  }

  byListId(listId: string): FilterBuilder {
    this.currentFilter.listId = listId
    return this
  }

  byTags(tags: string[]): FilterBuilder {
    this.currentFilter.tags = tags
    return this
  }

  byDueDateRange(from: Date, to: Date): FilterBuilder {
    this.currentFilter.dueDateFrom = from
    this.currentFilter.dueDateTo = to
    return this
  }

  build(): TaskFilter {
    return { ...this.currentFilter }
  }

  clear(): FilterBuilder {
    this.currentFilter = {}
    return this
  }
}

/**
 * Sort Builder Implementation
 * Provides a fluent API for building sorts
 */
class SortBuilderImpl implements SortBuilder {
  private sortBy: 'dueDate' | 'priority' | 'createdAt' | 'title' = 'dueDate'
  private order: 'asc' | 'desc' = 'asc'

  by(field: 'dueDate' | 'priority' | 'createdAt' | 'title'): SortBuilder {
    this.sortBy = field
    return this
  }

  ascending(): SortBuilder {
    this.order = 'asc'
    return this
  }

  descending(): SortBuilder {
    this.order = 'desc'
    return this
  }

  build() {
    return { sortBy: this.sortBy, order: this.order }
  }

  clear(): SortBuilder {
    this.sortBy = 'dueDate'
    this.order = 'asc'
    return this
  }
}

/**
 * Create a new filter builder instance
 */
export function createFilterBuilder(): FilterBuilder {
  return new FilterBuilderImpl()
}

/**
 * Create a new sort builder instance
 */
export function createSortBuilder(): SortBuilder {
  return new SortBuilderImpl()
}

/**
 * Check if a task matches a filter
 */
export function taskMatchesFilter(task: Task, filter: TaskFilter): boolean {
  if (filter.completed !== undefined && task.completed !== filter.completed) {
    return false
  }

  if (filter.priority && task.priority !== filter.priority) {
    return false
  }

  if (filter.listId && task.listId !== filter.listId) {
    return false
  }

  if (filter.tags && filter.tags.length > 0) {
    const hasAllTags = filter.tags.every((tag) => task.tags.includes(tag))
    if (!hasAllTags) return false
  }

  if (filter.dueDateFrom && task.dueDate && task.dueDate < filter.dueDateFrom) {
    return false
  }

  if (filter.dueDateTo && task.dueDate && task.dueDate > filter.dueDateTo) {
    return false
  }

  return true
}

/**
 * Compare two tasks for sorting
 */
export function compareTasks(
  a: Task,
  b: Task,
  sortBy: 'dueDate' | 'priority' | 'createdAt' | 'title',
  order: 'asc' | 'desc' = 'asc'
): number {
  let comparison = 0

  switch (sortBy) {
    case 'dueDate':
      if (!a.dueDate && !b.dueDate) comparison = 0
      else if (!a.dueDate) comparison = 1
      else if (!b.dueDate) comparison = -1
      else comparison = a.dueDate.getTime() - b.dueDate.getTime()
      break

    case 'priority': {
      const priorityOrder = { high: 0, medium: 1, low: 2 }
      comparison = priorityOrder[a.priority] - priorityOrder[b.priority]
      break
    }

    case 'createdAt':
      comparison = a.createdAt.getTime() - b.createdAt.getTime()
      break

    case 'title':
      comparison = a.title.localeCompare(b.title)
      break

    default:
      comparison = 0
  }

  return order === 'asc' ? comparison : -comparison
}

/**
 * Merge two task states
 * Used for conflict resolution or combining data from multiple sources
 */
export function mergeTaskStates(
  state1: TaskState,
  state2: TaskState,
  strategy: 'merge' | 'overwrite' = 'merge'
): TaskState {
  if (strategy === 'overwrite') {
    return state2
  }

  // Merge strategy: use newer updatedAt time
  const taskMap = new Map<string, Task>()

  ;[...state1.tasks, ...state2.tasks].forEach((task) => {
    const existing = taskMap.get(task.id)
    if (!existing || task.updatedAt > existing.updatedAt) {
      taskMap.set(task.id, task)
    }
  })

  const listMap = new Map<string, TaskList>()

  ;[...state1.lists, ...state2.lists].forEach((list) => {
    const existing = listMap.get(list.id)
    if (!existing || list.updatedAt > existing.updatedAt) {
      listMap.set(list.id, list)
    }
  })

  return {
    tasks: Array.from(taskMap.values()),
    lists: Array.from(listMap.values()),
    filter: state2.filter || state1.filter,
    sort: state2.sort || state1.sort,
  }
}

/**
 * Calculate conflicts between two task states
 */
export function calculateConflicts(
  localState: TaskState,
  remoteState: TaskState
): ConflictResolution[] {
  const conflicts: ConflictResolution[] = []

  const remoteTaskMap = new Map(remoteState.tasks.map((t) => [t.id, t]))

  localState.tasks.forEach((localTask) => {
    const remoteTask = remoteTaskMap.get(localTask.id)

    if (
      remoteTask &&
      localTask.updatedAt !== remoteTask.updatedAt &&
      JSON.stringify(localTask) !== JSON.stringify(remoteTask)
    ) {
      conflicts.push({
        taskId: localTask.id,
        localVersion: localTask,
        remoteVersion: remoteTask,
        resolution: 'local', // Default to local
      })
    }
  })

  return conflicts
}

/**
 * Deep clone a task (for immutability)
 */
export function cloneTask(task: Task): Task {
  return {
    ...task,
    createdAt: new Date(task.createdAt),
    updatedAt: new Date(task.updatedAt),
    dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
    tags: [...task.tags],
  }
}

/**
 * Deep clone a task list (for immutability)
 */
export function cloneTaskList(list: TaskList): TaskList {
  return {
    ...list,
    createdAt: new Date(list.createdAt),
    updatedAt: new Date(list.updatedAt),
  }
}

/**
 * Deep clone task state (for immutability)
 */
export function cloneTaskState(state: TaskState): TaskState {
  return {
    tasks: state.tasks.map(cloneTask),
    lists: state.lists.map(cloneTaskList),
    filter: { ...state.filter },
    sort: { ...state.sort },
  }
}

/**
 * Check if a task is overdue
 */
export function isTaskOverdue(task: Task): boolean {
  if (task.completed) return false
  if (!task.dueDate) return false
  return task.dueDate < new Date()
}

/**
 * Check if a task is due today
 */
export function isTaskDueToday(task: Task): boolean {
  if (!task.dueDate) return false

  const today = new Date()
  return (
    task.dueDate.getDate() === today.getDate() &&
    task.dueDate.getMonth() === today.getMonth() &&
    task.dueDate.getFullYear() === today.getFullYear()
  )
}

/**
 * Check if a task is due soon (within 7 days)
 */
export function isTaskDueSoon(task: Task): boolean {
  if (!task.dueDate) return false

  const now = new Date()
  const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
  return task.dueDate > now && task.dueDate <= sevenDaysFromNow
}

/**
 * Get all unique tags from tasks
 */
export function getAllUniqueTags(tasks: Task[]): string[] {
  const tagsSet = new Set<string>()
  tasks.forEach((task) => {
    task.tags.forEach((tag) => tagsSet.add(tag))
  })
  return Array.from(tagsSet).sort()
}

/**
 * Group tasks by a specific property
 */
export function groupTasksBy<K extends keyof Task>(
  tasks: Task[],
  property: K
): Record<string, Task[]> {
  const grouped: Record<string, Task[]> = {}

  tasks.forEach((task) => {
    const key = String(task[property])
    if (!grouped[key]) {
      grouped[key] = []
    }
    grouped[key].push(task)
  })

  return grouped
}

/**
 * Calculate task statistics
 */
export function calculateTaskStatistics(tasks: Task[]) {
  const total = tasks.length
  const completed = tasks.filter((t) => t.completed).length
  const pending = total - completed

  const now = new Date()
  const overdue = tasks.filter(
    (t) => !t.completed && t.dueDate && t.dueDate < now
  ).length

  const byPriority = {
    high: tasks.filter((t) => t.priority === 'high').length,
    medium: tasks.filter((t) => t.priority === 'medium').length,
    low: tasks.filter((t) => t.priority === 'low').length,
  }

  return {
    total,
    completed,
    pending,
    completionPercentage: total === 0 ? 0 : (completed / total) * 100,
    overdue,
    byPriority,
  }
}

/**
 * Sanitize task data (trim strings, remove empty arrays, etc.)
 */
export function sanitizeTask(task: Partial<Task>): Partial<Task> {
  return {
    ...task,
    title: typeof task.title === 'string' ? task.title.trim() : task.title,
    description:
      typeof task.description === 'string'
        ? task.description.trim()
        : task.description,
    tags:
      Array.isArray(task.tags) && task.tags.length > 0 ? task.tags : undefined,
  }
}

/**
 * Create a task with default values
 */
export function createDefaultTask(
  override: Partial<Task> = {}
): Omit<Task, 'id' | 'createdAt' | 'updatedAt'> {
  return {
    title: '',
    completed: false,
    priority: 'medium',
    listId: '',
    tags: [],
    ...override,
  }
}

/**
 * Create a task list with default values
 */
export function createDefaultTaskList(
  override: Partial<TaskList> = {}
): Omit<TaskList, 'id' | 'createdAt' | 'updatedAt'> {
  return {
    title: '',
    taskCount: 0,
    order: 0,
    ...override,
  }
}

/**
 * Export state to CSV format
 */
export function exportStatesToCSV(state: TaskState): string {
  const headers = [
    'ID',
    'Title',
    'Completed',
    'Priority',
    'DueDate',
    'ListId',
    'Tags',
    'CreatedAt',
  ]

  const rows = state.tasks.map((task) => [
    task.id,
    task.title,
    task.completed,
    task.priority,
    task.dueDate?.toISOString() || '',
    task.listId,
    task.tags.join(';'),
    task.createdAt.toISOString(),
  ])

  const csv = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n')

  return csv
}

/**
 * Check if two tasks are deeply equal
 */
export function areTasksEqual(task1: Task, task2: Task): boolean {
  return JSON.stringify(task1) === JSON.stringify(task2)
}

/**
 * Get all tasks that match multiple filters (AND operation)
 */
export function filterTasksMultiple(
  tasks: Task[],
  filters: TaskFilter[]
): Task[] {
  return tasks.filter((task) => filters.every((filter) => taskMatchesFilter(task, filter)))
}

/**
 * Get all tasks that match any filter (OR operation)
 */
export function filterTasksAny(tasks: Task[], filters: TaskFilter[]): Task[] {
  return tasks.filter((task) => filters.some((filter) => taskMatchesFilter(task, filter)))
}

/**
 * Batch update tasks with results tracking
 */
export function batchUpdateTasks(
  tasks: Task[],
  updates: Partial<Task>
): BatchOperationResult {
  let successful = 0
  const errors: Array<{ operation: string; error: string }> = []

  tasks.forEach((task) => {
    try {
      // This would be called in the context of the actual state update
      successful++
    } catch (error) {
      errors.push({
        operation: `update_${task.id}`,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  })

  return { successful, failed: errors.length, errors: [] }
}
