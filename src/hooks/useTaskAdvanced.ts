/**
 * Advanced custom hooks for complex task management scenarios
 * Includes statistics, grouping, filtering builders, and state manipulation
 */

import { useMemo, useCallback } from 'react'
import { useTask, useTasks, useTaskLists, useFilteredTasks } from './useTask'
import type {
  Task,
  TaskList,
  TaskFilter,
  TaskSort,
  TaskPriority,
} from '@/types/task'
import type {
  TaskStatistics,
  GroupedTasks,
  TaskGroupBy,
  FilterBuilder,
  SortBuilder,
  DerivedTaskState,
  ValidationResult,
} from '@/types/taskStateUtils'

/**
 * useTaskStatistics hook
 * Computes task statistics like completion percentage, counts by priority, etc.
 * Memoized to prevent unnecessary recalculations
 */
export function useTaskStatistics(): TaskStatistics {
  const tasks = useTasks()
  const lists = useTaskLists()

  return useMemo(() => {
    const total = tasks.length
    const completed = tasks.filter((t) => t.completed).length
    const pending = total - completed

    const byPriority = {
      high: tasks.filter((t) => t.priority === 'high').length,
      medium: tasks.filter((t) => t.priority === 'medium').length,
      low: tasks.filter((t) => t.priority === 'low').length,
    }

    const byList: Record<string, number> = {}
    lists.forEach((list) => {
      byList[list.id] = tasks.filter((t) => t.listId === list.id).length
    })

    const now = new Date()
    const overdue = tasks.filter(
      (t) => !t.completed && t.dueDate && t.dueDate < now
    ).length

    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const dueToday = tasks.filter(
      (t) =>
        !t.completed &&
        t.dueDate &&
        t.dueDate.getDate() === today.getDate() &&
        t.dueDate.getMonth() === today.getMonth() &&
        t.dueDate.getFullYear() === today.getFullYear()
    ).length

    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    const dueSoon = tasks.filter(
      (t) =>
        !t.completed &&
        t.dueDate &&
        t.dueDate > now &&
        t.dueDate <= sevenDaysFromNow
    ).length

    return {
      total,
      completed,
      pending,
      completionPercentage: total === 0 ? 0 : (completed / total) * 100,
      byPriority,
      byList,
      overdue,
      dueToday,
      dueSoon,
    }
  }, [tasks, lists])
}

/**
 * useGroupedTasks hook
 * Groups tasks by specified field (listId, priority, completed, dueDate)
 */
export function useGroupedTasks(groupBy: TaskGroupBy = 'listId'): GroupedTasks {
  const tasks = useTasks()

  return useMemo(() => {
    const grouped: GroupedTasks = {}

    tasks.forEach((task) => {
      let key: string

      switch (groupBy) {
        case 'listId':
          key = task.listId
          break
        case 'priority':
          key = task.priority
          break
        case 'completed':
          key = task.completed ? 'completed' : 'pending'
          break
        case 'dueDate':
          if (!task.dueDate) {
            key = 'no-due-date'
          } else {
            key = task.dueDate.toISOString().split('T')[0]
          }
          break
        default:
          key = 'other'
      }

      if (!grouped[key]) {
        grouped[key] = []
      }
      grouped[key].push(task)
    })

    return grouped
  }, [tasks, groupBy])
}

/**
 * useDerivedTaskState hook
 * Computes derived state including active/completed tasks, overdue, etc.
 */
export function useDerivedTaskState(): DerivedTaskState {
  const tasks = useTasks()
  const lists = useTaskLists()
  const statistics = useTaskStatistics()

  return useMemo(() => {
    const activeTasks = tasks.filter((t) => !t.completed)
    const completedTasks = tasks.filter((t) => t.completed)
    const now = new Date()
    const overdueTasks = activeTasks.filter((t) => t.dueDate && t.dueDate < now)

    const tasksByPriority: Record<TaskPriority, Task[]> = {
      high: tasks.filter((t) => t.priority === 'high'),
      medium: tasks.filter((t) => t.priority === 'medium'),
      low: tasks.filter((t) => t.priority === 'low'),
    }

    const tasksByList: Record<string, Task[]> = {}
    lists.forEach((list) => {
      tasksByList[list.id] = tasks.filter((t) => t.listId === list.id)
    })

    return {
      activeTasks,
      completedTasks,
      overdueTasks,
      tasksByPriority,
      tasksByList,
      statistics,
    }
  }, [tasks, lists, statistics])
}

/**
 * useFilterBuilder hook
 * Creates a fluent API for building task filters
 */
export function useFilterBuilder(): FilterBuilder {
  const { actions } = useTask()

  const builder: FilterBuilder = useMemo(
    () => ({
      byCompleted(completed: boolean) {
        actions.setFilter({ completed })
        return builder
      },
      byPriority(priority: TaskPriority) {
        actions.setFilter({ priority })
        return builder
      },
      byListId(listId: string) {
        actions.setFilter({ listId })
        return builder
      },
      byTags(tags: string[]) {
        actions.setFilter({ tags })
        return builder
      },
      byDueDateRange(from: Date, to: Date) {
        actions.setFilter({ dueDateFrom: from, dueDateTo: to })
        return builder
      },
      build() {
        const { state } = useTask()
        return state.filter
      },
      clear() {
        actions.setFilter({})
        return builder
      },
    }),
    [actions]
  )

  return builder
}

/**
 * useSortBuilder hook
 * Creates a fluent API for building task sorts
 */
export function useSortBuilder(): SortBuilder {
  const { actions } = useTask()

  const builder: SortBuilder = useMemo(
    () => ({
      by(field: 'dueDate' | 'priority' | 'createdAt' | 'title') {
        actions.setSort({ sortBy: field, order: 'asc' })
        return builder
      },
      ascending() {
        const { state } = useTask()
        actions.setSort({ ...state.sort, order: 'asc' })
        return builder
      },
      descending() {
        const { state } = useTask()
        actions.setSort({ ...state.sort, order: 'desc' })
        return builder
      },
      build() {
        const { state } = useTask()
        return state.sort
      },
      clear() {
        actions.setSort({ sortBy: 'dueDate', order: 'asc' })
        return builder
      },
    }),
    [actions]
  )

  return builder
}

/**
 * useTaskSearch hook
 * Search tasks by title or description with memoization
 */
export function useTaskSearch(searchTerm: string): Task[] {
  const tasks = useTasks()

  return useMemo(() => {
    if (!searchTerm.trim()) return tasks

    const term = searchTerm.toLowerCase()
    return tasks.filter(
      (task) =>
        task.title.toLowerCase().includes(term) ||
        (task.description && task.description.toLowerCase().includes(term))
    )
  }, [tasks, searchTerm])
}

/**
 * useTaskValidation hook
 * Validates task data before creation or update
 */
export function useTaskValidation() {
  return useMemo(
    () => ({
      validateTask: (task: Partial<Task>): ValidationResult => {
        const errors: string[] = []

        if (!task.title || task.title.trim().length === 0) {
          errors.push('Task title is required')
        }

        if (task.title && task.title.length > 200) {
          errors.push('Task title must be less than 200 characters')
        }

        if (task.dueDate && !(task.dueDate instanceof Date)) {
          errors.push('Invalid due date format')
        }

        if (task.priority && !['low', 'medium', 'high'].includes(task.priority)) {
          errors.push('Invalid priority value')
        }

        if (task.tags && !Array.isArray(task.tags)) {
          errors.push('Tags must be an array')
        }

        return errors.length === 0 ? { valid: true } : { valid: false, errors }
      },

      validateList: (list: Partial<TaskList>): ValidationResult => {
        const errors: string[] = []

        if (!list.title || list.title.trim().length === 0) {
          errors.push('List title is required')
        }

        if (list.title && list.title.length > 100) {
          errors.push('List title must be less than 100 characters')
        }

        return errors.length === 0 ? { valid: true } : { valid: false, errors }
      },
    }),
    []
  )
}

/**
 * useTasksByTag hook
 * Get all tasks with a specific tag
 */
export function useTasksByTag(tag: string): Task[] {
  const tasks = useTasks()

  return useMemo(
    () => tasks.filter((task) => task.tags.includes(tag)),
    [tasks, tag]
  )
}

/**
 * useCompletionTrend hook
 * Calculate completion trend over time (last 7, 30, 90 days)
 */
export function useCompletionTrend() {
  const tasks = useTasks()

  return useMemo(() => {
    const now = new Date()
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const last90Days = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)

    const last7DaysCompleted = tasks.filter(
      (t) => t.completed && t.updatedAt >= last7Days
    ).length
    const last30DaysCompleted = tasks.filter(
      (t) => t.completed && t.updatedAt >= last30Days
    ).length
    const last90DaysCompleted = tasks.filter(
      (t) => t.completed && t.updatedAt >= last90Days
    ).length

    return {
      last7Days: last7DaysCompleted,
      last30Days: last30DaysCompleted,
      last90Days: last90DaysCompleted,
    }
  }, [tasks])
}

/**
 * useTasksByDateRange hook
 * Get all tasks within a date range
 */
export function useTasksByDateRange(from: Date, to: Date): Task[] {
  const tasks = useTasks()

  return useMemo(
    () =>
      tasks.filter(
        (task) =>
          task.dueDate && task.dueDate >= from && task.dueDate <= to
      ),
    [tasks, from, to]
  )
}

/**
 * useBulkTaskOperations hook
 * Provide batch operations on multiple tasks
 */
export function useBulkTaskOperations() {
  const { actions } = useTask()

  return useCallback(
    (taskIds: string[], updates: Partial<Task>) => {
      taskIds.forEach((id) => {
        actions.updateTask(id, updates)
      })
    },
    [actions]
  )
}

/**
 * useTaskUndoRedoState hook
 * Track undo/redo history for task operations
 * Note: This provides the foundation; full undo/redo requires state middleware
 */
export function useTaskUndoRedoState() {
  const { state } = useTask()

  return useMemo(
    () => ({
      currentState: state,
      canUndo: false, // Would need middleware to track history
      canRedo: false,
      undo: () => {
        /* Implementation requires middleware */
      },
      redo: () => {
        /* Implementation requires middleware */
      },
    }),
    [state]
  )
}
