/**
 * State composition and utility hooks
 * Provides advanced patterns for combining and composing task state management
 * Includes hooks for notifications, side effects, and complex workflows
 */

import { useCallback, useEffect, useRef, useMemo, useState } from 'react'
import { useTask, useTasks, useTaskLists } from './useTask'
import type {
  Task,
  TaskList,
  TaskState,
  TaskFilter,
  TaskSort,
} from '@/types/task'

/**
 * Task event listener types
 */
export type TaskEventType =
  | 'taskAdded'
  | 'taskUpdated'
  | 'taskDeleted'
  | 'taskCompleted'
  | 'taskUncompleted'
  | 'listAdded'
  | 'listUpdated'
  | 'listDeleted'
  | 'filterChanged'
  | 'sortChanged'

export type TaskEventListener = (event: TaskEvent) => void

export interface TaskEvent {
  type: TaskEventType
  timestamp: Date
  data: any
}

/**
 * Hook for subscribing to task state changes
 * Useful for side effects triggered by state changes
 */
export function useTaskEventListener(
  eventTypes: TaskEventType | TaskEventType[],
  listener: TaskEventListener
) {
  const { state, actions } = useTask()
  const prevStateRef = useRef<TaskState | null>(null)
  const listenerRef = useRef(listener)

  // Update listener ref
  useEffect(() => {
    listenerRef.current = listener
  }, [listener])

  // Subscribe to state changes
  useEffect(() => {
    if (!prevStateRef.current) {
      prevStateRef.current = state
      return
    }

    const prevState = prevStateRef.current
    const targetEvents = Array.isArray(eventTypes) ? eventTypes : [eventTypes]

    // Detect task additions
    if (targetEvents.includes('taskAdded')) {
      const newTasks = state.tasks.filter(
        (t) => !prevState.tasks.find((pt) => pt.id === t.id)
      )
      newTasks.forEach((task) => {
        listenerRef.current({
          type: 'taskAdded',
          timestamp: new Date(),
          data: { task },
        })
      })
    }

    // Detect task updates
    if (targetEvents.includes('taskUpdated')) {
      const updatedTasks = state.tasks.filter((t) => {
        const prevTask = prevState.tasks.find((pt) => pt.id === t.id)
        return prevTask && JSON.stringify(prevTask) !== JSON.stringify(t)
      })
      updatedTasks.forEach((task) => {
        listenerRef.current({
          type: 'taskUpdated',
          timestamp: new Date(),
          data: { task },
        })
      })
    }

    // Detect task deletions
    if (targetEvents.includes('taskDeleted')) {
      const deletedTasks = prevState.tasks.filter(
        (t) => !state.tasks.find((st) => st.id === t.id)
      )
      deletedTasks.forEach((task) => {
        listenerRef.current({
          type: 'taskDeleted',
          timestamp: new Date(),
          data: { taskId: task.id },
        })
      })
    }

    // Detect task completion changes
    if (targetEvents.includes('taskCompleted') || targetEvents.includes('taskUncompleted')) {
      state.tasks.forEach((task) => {
        const prevTask = prevState.tasks.find((pt) => pt.id === task.id)
        if (prevTask && prevTask.completed !== task.completed) {
          listenerRef.current({
            type: task.completed ? 'taskCompleted' : 'taskUncompleted',
            timestamp: new Date(),
            data: { taskId: task.id, task },
          })
        }
      })
    }

    // Detect filter changes
    if (targetEvents.includes('filterChanged')) {
      if (JSON.stringify(prevState.filter) !== JSON.stringify(state.filter)) {
        listenerRef.current({
          type: 'filterChanged',
          timestamp: new Date(),
          data: { filter: state.filter },
        })
      }
    }

    // Detect sort changes
    if (targetEvents.includes('sortChanged')) {
      if (JSON.stringify(prevState.sort) !== JSON.stringify(state.sort)) {
        listenerRef.current({
          type: 'sortChanged',
          timestamp: new Date(),
          data: { sort: state.sort },
        })
      }
    }

    prevStateRef.current = state
  }, [state, eventTypes])
}

/**
 * Hook for task notifications/alerts
 * Triggers callbacks on significant state changes
 */
export interface TaskNotificationOptions {
  onTaskDue?: (task: Task) => void
  onTaskOverdue?: (task: Task) => void
  onTaskCompleted?: (task: Task) => void
  onQuotaWarning?: (message: string) => void
}

export function useTaskNotifications(options: TaskNotificationOptions) {
  const tasks = useTasks()
  const notificationsRef = useRef<Set<string>>(new Set())
  const prevTasksRef = useRef<Map<string, Task>>(new Map())

  useEffect(() => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    tasks.forEach((task) => {
      const notificationKey = `${task.id}:${task.completed}`
      const hasNotified = notificationsRef.current.has(notificationKey)

      if (task.completed && !hasNotified) {
        options.onTaskCompleted?.(task)
        notificationsRef.current.add(notificationKey)
      }

      if (
        !task.completed &&
        task.dueDate &&
        task.dueDate >= today &&
        task.dueDate < tomorrow &&
        !hasNotified
      ) {
        options.onTaskDue?.(task)
        notificationsRef.current.add(notificationKey)
      }

      if (
        !task.completed &&
        task.dueDate &&
        task.dueDate < now &&
        !hasNotified
      ) {
        options.onTaskOverdue?.(task)
        notificationsRef.current.add(notificationKey)
      }
    })

    // Clean up old notification entries
    prevTasksRef.current = new Map(tasks.map((t) => [t.id, t]))
  }, [tasks, options])
}

/**
 * Hook for tracking task state changes
 * Returns information about what changed since last render
 */
export interface StateChangeSummary {
  taskCountChanged: boolean
  listCountChanged: boolean
  filterChanged: boolean
  sortChanged: boolean
  previousTaskCount: number
  currentTaskCount: number
  previousListCount: number
  currentListCount: number
}

export function useStateChangeSummary(): StateChangeSummary {
  const { state } = useTask()
  const prevStateRef = useRef<TaskState>()

  const summary = useMemo<StateChangeSummary>(() => {
    const prevState = prevStateRef.current

    return {
      taskCountChanged:
        prevState?.tasks.length !== state.tasks.length,
      listCountChanged:
        prevState?.lists.length !== state.lists.length,
      filterChanged:
        JSON.stringify(prevState?.filter) !== JSON.stringify(state.filter),
      sortChanged:
        JSON.stringify(prevState?.sort) !== JSON.stringify(state.sort),
      previousTaskCount: prevState?.tasks.length ?? 0,
      currentTaskCount: state.tasks.length,
      previousListCount: prevState?.lists.length ?? 0,
      currentListCount: state.lists.length,
    }
  }, [state])

  useEffect(() => {
    prevStateRef.current = state
  }, [state])

  return summary
}

/**
 * Hook for conditional task operations
 * Applies operations only when certain conditions are met
 */
export interface ConditionalTaskOperation {
  predicate: (task: Task) => boolean
  operation: (task: Task) => void
}

export function useConditionalTaskOperations(
  operations: ConditionalTaskOperation[]
) {
  const tasks = useTasks()

  return useCallback(() => {
    tasks.forEach((task) => {
      operations.forEach(({ predicate, operation }) => {
        if (predicate(task)) {
          operation(task)
        }
      })
    })
  }, [tasks, operations])
}

/**
 * Hook for dependent task operations
 * Chains operations that depend on previous results
 */
export function useDependentTaskOperations() {
  const { actions } = useTask()
  const tasks = useTasks()

  return useCallback(
    (
      operations: Array<{
        condition: (tasks: Task[]) => boolean
        execute: (tasks: Task[], actions: typeof actions) => Promise<void> | void
      }>
    ) => {
      return operations.reduce((promise, op) => {
        return promise.then(() => {
          if (op.condition(tasks)) {
            return op.execute(tasks, actions)
          }
        })
      }, Promise.resolve())
    },
    [tasks, actions]
  )
}

/**
 * Hook for task state caching
 * Memoizes expensive computations on task state
 */
export function useTaskStateCache<T>(
  computeFn: (tasks: Task[]) => T,
  dependencies: any[] = []
): T {
  const tasks = useTasks()
  const cacheRef = useRef<{ tasks: string; value: T }>({
    tasks: JSON.stringify(tasks),
    value: computeFn(tasks),
  })

  const result = useMemo(() => {
    const tasksJson = JSON.stringify(tasks)

    if (tasksJson !== cacheRef.current.tasks) {
      cacheRef.current = {
        tasks: tasksJson,
        value: computeFn(tasks),
      }
    }

    return cacheRef.current.value
  }, [tasks, computeFn, ...dependencies])

  return result
}

/**
 * Hook for async task operations with loading and error states
 */
export interface AsyncTaskOperationState {
  isLoading: boolean
  error: Error | null
  isSuccess: boolean
}

export function useAsyncTaskOperation() {
  const [state, setState] = useState<AsyncTaskOperationState>({
    isLoading: false,
    error: null,
    isSuccess: false,
  })

  const execute = useCallback(
    async (operation: () => Promise<void>) => {
      setState({ isLoading: true, error: null, isSuccess: false })
      try {
        await operation()
        setState({ isLoading: false, error: null, isSuccess: true })
      } catch (error) {
        setState({
          isLoading: false,
          error: error instanceof Error ? error : new Error(String(error)),
          isSuccess: false,
        })
      }
    },
    []
  )

  const reset = useCallback(() => {
    setState({ isLoading: false, error: null, isSuccess: false })
  }, [])

  return { ...state, execute, reset }
}

/**
 * Hook for task state serialization and deserialization
 */
export function useTaskStateSerializer() {
  const { state, actions } = useTask()

  const serialize = useCallback((): string => {
    return JSON.stringify({
      tasks: state.tasks.map((t) => ({
        ...t,
        createdAt: t.createdAt.toISOString(),
        updatedAt: t.updatedAt.toISOString(),
        dueDate: t.dueDate?.toISOString(),
      })),
      lists: state.lists.map((l) => ({
        ...l,
        createdAt: l.createdAt.toISOString(),
        updatedAt: l.updatedAt.toISOString(),
      })),
      filter: state.filter,
      sort: state.sort,
    })
  }, [state])

  const deserialize = useCallback(
    (json: string): boolean => {
      try {
        const parsed = JSON.parse(json)

        const tasks = (parsed.tasks || []).map((t: any) => ({
          ...t,
          createdAt: new Date(t.createdAt),
          updatedAt: new Date(t.updatedAt),
          dueDate: t.dueDate ? new Date(t.dueDate) : undefined,
        }))

        const lists = (parsed.lists || []).map((l: any) => ({
          ...l,
          createdAt: new Date(l.createdAt),
          updatedAt: new Date(l.updatedAt),
        }))

        // Apply deserialized state
        actions.setFilter(parsed.filter || {})
        actions.setSort(parsed.sort || { sortBy: 'dueDate', order: 'asc' })

        return true
      } catch (error) {
        console.error('Failed to deserialize state:', error)
        return false
      }
    },
    [actions]
  )

  return { serialize, deserialize }
}

/**
 * Hook for batch operations with progress tracking
 */
export function useBatchOperationProgress<T>(
  items: T[],
  operation: (item: T) => Promise<void>,
  onProgressChange?: (progress: number) => void
) {
  const [state, setState] = useState({
    isRunning: false,
    completedCount: 0,
    totalCount: items.length,
    currentItem: null as T | null,
    error: null as Error | null,
  })

  const execute = useCallback(async () => {
    setState({
      isRunning: true,
      completedCount: 0,
      totalCount: items.length,
      currentItem: null,
      error: null,
    })

    try {
      for (const item of items) {
        setState((prev) => ({
          ...prev,
          currentItem: item,
        }))

        await operation(item)

        setState((prev) => {
          const newCount = prev.completedCount + 1
          const progress = (newCount / items.length) * 100
          onProgressChange?.(progress)
          return {
            ...prev,
            completedCount: newCount,
          }
        })
      }

      setState((prev) => ({
        ...prev,
        isRunning: false,
      }))
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isRunning: false,
        error: error instanceof Error ? error : new Error(String(error)),
      }))
    }
  }, [items, operation, onProgressChange])

  return { ...state, execute }
}
