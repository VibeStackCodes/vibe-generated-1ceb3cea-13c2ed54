/**
 * Performance optimization hooks for task management
 * Includes memoization patterns, selector hooks, and debouncing utilities
 * Helps prevent unnecessary re-renders and optimizes state access
 */

import { useMemo, useCallback, useRef, useEffect, useState, DependencyList } from 'react'
import { useTask, useTasks, useTaskLists } from './useTask'
import type { Task, TaskList, TaskFilter, TaskSort, TaskState } from '@/types/task'

/**
 * Custom selector hook - memoizes selected state slices
 * Only re-renders when selected state actually changes
 */
export function useTaskSelector<T>(
  selector: (state: TaskState) => T,
  equalityFn?: (a: T, b: T) => boolean
): T {
  const { state } = useTask()
  const previousValueRef = useRef<T>()
  const selectedValue = selector(state)

  return useMemo(() => {
    if (previousValueRef.current === undefined) {
      previousValueRef.current = selectedValue
      return selectedValue
    }

    const isEqual =
      equalityFn?.(previousValueRef.current, selectedValue) ??
      previousValueRef.current === selectedValue

    if (!isEqual) {
      previousValueRef.current = selectedValue
    }

    return previousValueRef.current
  }, [selectedValue, equalityFn])
}

/**
 * Deep equality check for objects
 * Useful as an equality function for selectors
 */
function deepEqual(a: any, b: any): boolean {
  if (a === b) return true
  if (a == null || b == null) return false
  if (typeof a !== 'object' || typeof b !== 'object') return false

  const keysA = Object.keys(a)
  const keysB = Object.keys(b)

  if (keysA.length !== keysB.length) return false

  return keysA.every((key) => deepEqual(a[key], b[key]))
}

/**
 * Shallow object equality check
 */
function shallowEqual(a: any, b: any): boolean {
  if (a === b) return true
  if (a == null || b == null) return false
  if (typeof a !== 'object' || typeof b !== 'object') return false

  const keysA = Object.keys(a)
  const keysB = Object.keys(b)

  if (keysA.length !== keysB.length) return false

  return keysA.every((key) => a[key] === b[key])
}

/**
 * Shallowly memoized tasks
 * Only updates when task array reference changes, not when contents change
 */
export function useMemoizedTasks(): Task[] {
  const tasks = useTasks()
  const memoRef = useRef<Task[]>()
  const prevTasksRef = useRef<Task[]>()

  return useMemo(() => {
    if (prevTasksRef.current !== tasks) {
      memoRef.current = tasks
      prevTasksRef.current = tasks
    }
    return memoRef.current || tasks
  }, [tasks])
}

/**
 * Shallowly memoized lists
 */
export function useMemoizedTaskLists(): TaskList[] {
  const lists = useTaskLists()
  const memoRef = useRef<TaskList[]>()
  const prevListsRef = useRef<TaskList[]>()

  return useMemo(() => {
    if (prevListsRef.current !== lists) {
      memoRef.current = lists
      prevListsRef.current = lists
    }
    return memoRef.current || lists
  }, [lists])
}

/**
 * Debounced state value hook
 * Delays state updates by specified milliseconds
 * Useful for search inputs, filter debouncing, etc.
 */
export function useDebouncedValue<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => clearTimeout(handler)
  }, [value, delay])

  return debouncedValue
}

/**
 * Debounced callback hook
 * Delays function execution by specified milliseconds
 */
export function useDebouncedCallback<Args extends any[], R>(
  callback: (...args: Args) => R,
  delay: number = 500,
  dependencies: DependencyList = []
): (...args: Args) => void {
  const timeoutRef = useRef<NodeJS.Timeout>()

  return useCallback(
    (...args: Args) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      timeoutRef.current = setTimeout(() => {
        callback(...args)
      }, delay)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [callback, delay, ...dependencies]
  )
}

/**
 * Throttled callback hook
 * Limits function execution to once per specified milliseconds
 */
export function useThrottledCallback<Args extends any[], R>(
  callback: (...args: Args) => R,
  delay: number = 500,
  dependencies: DependencyList = []
): (...args: Args) => void {
  const lastRunRef = useRef<number>(0)
  const timeoutRef = useRef<NodeJS.Timeout>()

  return useCallback(
    (...args: Args) => {
      const now = Date.now()
      const timeSinceLastRun = now - lastRunRef.current

      if (timeSinceLastRun >= delay) {
        callback(...args)
        lastRunRef.current = now
      } else {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
        }

        timeoutRef.current = setTimeout(() => {
          callback(...args)
          lastRunRef.current = Date.now()
        }, delay - timeSinceLastRun)
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [callback, delay, ...dependencies]
  )
}

/**
 * Memoized task map for O(1) lookup
 * Useful for performance-critical lookups
 */
export function useTaskMap(): Map<string, Task> {
  const tasks = useTasks()

  return useMemo(() => {
    const map = new Map<string, Task>()
    tasks.forEach((task) => map.set(task.id, task))
    return map
  }, [tasks])
}

/**
 * Memoized list map for O(1) lookup
 */
export function useListMap(): Map<string, TaskList> {
  const lists = useTaskLists()

  return useMemo(() => {
    const map = new Map<string, TaskList>()
    lists.forEach((list) => map.set(list.id, list))
    return map
  }, [lists])
}

/**
 * Memoized task filter application with shallow equality
 * Only re-applies filter when tasks or filter criteria change meaningfully
 */
export function useMemoizedFilteredTasks(filter: TaskFilter): Task[] {
  const tasks = useTasks()
  const filterRef = useRef<TaskFilter>(filter)

  const filtered = useMemo(() => {
    const hasFilterChanged = !shallowEqual(filterRef.current, filter)
    if (hasFilterChanged) {
      filterRef.current = filter
    }

    if (Object.keys(filter).length === 0) {
      return tasks
    }

    return tasks.filter((task) => {
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
        const hasAllTags = filter.tags.every((tag) =>
          task.tags.includes(tag)
        )
        if (!hasAllTags) return false
      }
      if (filter.dueDateFrom && task.dueDate) {
        if (task.dueDate < filter.dueDateFrom) return false
      }
      if (filter.dueDateTo && task.dueDate) {
        if (task.dueDate > filter.dueDateTo) return false
      }
      return true
    })
  }, [tasks, filter])

  return filtered
}

/**
 * Memoized task sorting
 * Only re-sorts when tasks or sort criteria change
 */
export function useMemoizedSortedTasks(
  tasks: Task[],
  sort?: TaskSort
): Task[] {
  return useMemo(() => {
    if (!sort || tasks.length === 0) return tasks

    const sorted = [...tasks]
    sorted.sort((a, b) => {
      let comparison = 0

      switch (sort.sortBy) {
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

      return sort.order === 'asc' ? comparison : -comparison
    })

    return sorted
  }, [tasks, sort])
}

/**
 * Hook for detecting if component has mounted
 * Useful for conditional rendering and avoiding hydration mismatches
 */
export function useHasMounted(): boolean {
  const [hasMounted, setHasMounted] = useState(false)

  useEffect(() => {
    setHasMounted(true)
  }, [])

  return hasMounted
}

/**
 * Hook for previous value tracking
 * Useful for detecting changes and triggers
 */
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>()

  useEffect(() => {
    ref.current = value
  }, [value])

  return ref.current
}

/**
 * Hook for change detection
 * Returns true if value has changed since last render
 */
export function useHasChanged<T>(value: T, isEqual?: (a: T, b: T) => boolean): boolean {
  const previousRef = useRef<T>(value)

  const hasChanged = !isEqual
    ? previousRef.current !== value
    : !isEqual(previousRef.current, value)

  useEffect(() => {
    previousRef.current = value
  }, [value])

  return hasChanged
}

/**
 * Memoized callback with reference stability
 * Prevents callback recreation when dependencies haven't actually changed
 */
export function useStableCallback<T extends (...args: any[]) => any>(
  callback: T,
  dependencies: DependencyList
): T {
  const callbackRef = useRef<T>(callback)

  useEffect(() => {
    callbackRef.current = callback
  }, dependencies)

  return useCallback((...args: any[]) => callbackRef.current(...args), []) as T
}

/**
 * Performance monitoring hook
 * Tracks render count and timing information
 */
export function useRenderMetrics(componentName: string) {
  const renderCountRef = useRef(0)
  const renderTimingsRef = useRef<number[]>([])

  useEffect(() => {
    renderCountRef.current++
    const renderTime = performance.now()
    renderTimingsRef.current.push(renderTime)

    if (renderTimingsRef.current.length > 100) {
      renderTimingsRef.current.shift()
    }

    if (process.env.NODE_ENV === 'development') {
      console.log(
        `[${componentName}] Render #${renderCountRef.current}`,
        {
          renderCount: renderCountRef.current,
          averageRenderTime:
            renderTimingsRef.current.length > 1
              ? (
                  (renderTimingsRef.current[renderTimingsRef.current.length - 1] -
                    renderTimingsRef.current[0]) /
                  (renderTimingsRef.current.length - 1)
                ).toFixed(2)
              : 'N/A',
        }
      )
    }
  })

  return {
    renderCount: renderCountRef.current,
    metrics: {
      count: renderTimingsRef.current.length,
      timings: renderTimingsRef.current,
    },
  }
}

/**
 * Export utility functions for use as equality functions
 */
export { shallowEqual, deepEqual }
