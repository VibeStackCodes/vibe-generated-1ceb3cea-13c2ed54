/**
 * Task Context and Provider
 * Manages global state for tasks using React Context API
 * Integrates localStorage persistence for local-first data storage
 */

import {
  createContext,
  useCallback,
  useMemo,
  useState,
  ReactNode,
  useEffect,
} from 'react'
import type {
  Task,
  TaskList,
  TaskFilter,
  TaskSort,
  TaskState,
  TaskPriority,
  RecurrenceType,
} from '@/types/task'
import { saveTaskState, loadTaskState } from '@/utils/taskStorage'

interface TaskContextType {
  state: TaskState
  actions: {
    addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => Task
    updateTask: (id: string, updates: Partial<Task>) => void
    deleteTask: (id: string) => void
    toggleTaskCompletion: (id: string) => void
    addList: (list: Omit<TaskList, 'id' | 'createdAt' | 'updatedAt'>) => TaskList
    updateList: (id: string, updates: Partial<TaskList>) => void
    deleteList: (id: string) => void
    setFilter: (filter: TaskFilter) => void
    setSort: (sort: TaskSort) => void
    getTasksByList: (listId: string) => Task[]
    getFilteredAndSortedTasks: () => Task[]
  }
  isLoading: boolean
}

/**
 * Create the task context with default undefined value
 * Type-safe context that requires explicit provider setup
 */
export const TaskContext = createContext<TaskContextType | undefined>(undefined)

interface TaskProviderProps {
  children: ReactNode
}

/**
 * TaskProvider component
 * Provides task state and actions to all child components
 * Implements local-first state management with React hooks
 * Automatically persists state to localStorage on changes
 */
export function TaskProvider({ children }: TaskProviderProps) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [lists, setLists] = useState<TaskList[]>([])
  const [filter, setFilter] = useState<TaskFilter>({})
  const [sort, setSort] = useState<TaskSort>({
    sortBy: 'dueDate',
    order: 'asc',
  })
  const [isLoading, setIsLoading] = useState(true)
  const [hasInitialized, setHasInitialized] = useState(false)

  /**
   * Initialize state from localStorage on mount
   * This runs once when the component first mounts
   */
  useEffect(() => {
    try {
      const savedState = loadTaskState()

      if (savedState.tasks.length > 0 || savedState.lists.length > 0) {
        setTasks(savedState.tasks)
        setLists(savedState.lists)
      }
    } catch (error) {
      console.error('[TaskProvider] Error loading state from storage:', error)
    } finally {
      setIsLoading(false)
      setHasInitialized(true)
    }
  }, [])

  /**
   * Persist state to localStorage whenever tasks or lists change
   * Uses debouncing to avoid excessive writes to storage
   */
  useEffect(() => {
    // Skip persistence during initial load
    if (!hasInitialized) return

    // Debounce the save operation
    const timeoutId = setTimeout(() => {
      try {
        saveTaskState({ tasks, lists })
      } catch (error) {
        console.error('[TaskProvider] Error saving state to storage:', error)
      }
    }, 500) // 500ms debounce

    return () => clearTimeout(timeoutId)
  }, [tasks, lists, hasInitialized])

  /**
   * Generate unique ID for new tasks/lists
   */
  const generateId = useCallback((): string => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }, [])

  /**
   * Add a new task
   */
  const addTask = useCallback(
    (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Task => {
      const newTask: Task = {
        ...taskData,
        id: generateId(),
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      setTasks((prev) => [...prev, newTask])
      return newTask
    },
    [generateId]
  )

  /**
   * Update an existing task
   */
  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id
          ? { ...task, ...updates, updatedAt: new Date() }
          : task
      )
    )
  }, [])

  /**
   * Delete a task
   */
  const deleteTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id))
  }, [])

  /**
   * Toggle task completion status
   */
  const toggleTaskCompletion = useCallback((id: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id
          ? { ...task, completed: !task.completed, updatedAt: new Date() }
          : task
      )
    )
  }, [])

  /**
   * Add a new list
   */
  const addList = useCallback(
    (listData: Omit<TaskList, 'id' | 'createdAt' | 'updatedAt'>): TaskList => {
      const newList: TaskList = {
        ...listData,
        id: generateId(),
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      setLists((prev) => [...prev, newList])
      return newList
    },
    [generateId]
  )

  /**
   * Update an existing list
   */
  const updateList = useCallback((id: string, updates: Partial<TaskList>) => {
    setLists((prev) =>
      prev.map((list) =>
        list.id === id
          ? { ...list, ...updates, updatedAt: new Date() }
          : list
      )
    )
  }, [])

  /**
   * Delete a list and its tasks
   */
  const deleteList = useCallback((id: string) => {
    setLists((prev) => prev.filter((list) => list.id !== id))
    setTasks((prev) => prev.filter((task) => task.listId !== id))
  }, [])

  /**
   * Get all tasks for a specific list
   */
  const getTasksByList = useCallback(
    (listId: string): Task[] => {
      return tasks.filter((task) => task.listId === listId)
    },
    [tasks]
  )

  /**
   * Apply filters to tasks
   */
  const applyFilters = useCallback(
    (tasksToFilter: Task[]): Task[] => {
      return tasksToFilter.filter((task) => {
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
    },
    [filter]
  )

  /**
   * Sort tasks based on current sort settings
   */
  const applySort = useCallback(
    (tasksToSort: Task[]): Task[] => {
      const sorted = [...tasksToSort].sort((a, b) => {
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
            comparison =
              priorityOrder[a.priority] - priorityOrder[b.priority]
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
    },
    [sort]
  )

  /**
   * Get filtered and sorted tasks
   */
  const getFilteredAndSortedTasks = useCallback((): Task[] => {
    const filtered = applyFilters(tasks)
    return applySort(filtered)
  }, [tasks, applyFilters, applySort])

  /**
   * Memoize the state object
   */
  const state: TaskState = useMemo(
    () => ({
      tasks,
      lists,
      filter,
      sort,
    }),
    [tasks, lists, filter, sort]
  )

  /**
   * Memoize the actions object
   */
  const actions = useMemo(
    () => ({
      addTask,
      updateTask,
      deleteTask,
      toggleTaskCompletion,
      addList,
      updateList,
      deleteList,
      setFilter,
      setSort,
      getTasksByList,
      getFilteredAndSortedTasks,
    }),
    [
      addTask,
      updateTask,
      deleteTask,
      toggleTaskCompletion,
      addList,
      updateList,
      deleteList,
      getTasksByList,
      getFilteredAndSortedTasks,
    ]
  )

  const value = useMemo(() => ({ state, actions, isLoading }), [state, actions, isLoading])

  return (
    <TaskContext.Provider value={value}>{children}</TaskContext.Provider>
  )
}
