/**
 * Advanced reducer-based task state management hooks
 * Provides useReducer patterns for complex state transformations
 * Useful for undo/redo, batch operations, and complex workflows
 */

import { useReducer, useCallback, useMemo } from 'react'
import type { Task, TaskList, TaskState, TaskFilter, TaskSort } from '@/types/task'

/**
 * Action types for task reducer
 */
export type TaskReducerAction =
  | { type: 'ADD_TASK'; payload: Task }
  | { type: 'UPDATE_TASK'; payload: { id: string; updates: Partial<Task> } }
  | { type: 'DELETE_TASK'; payload: string }
  | { type: 'TOGGLE_TASK_COMPLETION'; payload: string }
  | { type: 'ADD_LIST'; payload: TaskList }
  | { type: 'UPDATE_LIST'; payload: { id: string; updates: Partial<TaskList> } }
  | { type: 'DELETE_LIST'; payload: string }
  | { type: 'SET_FILTER'; payload: TaskFilter }
  | { type: 'SET_SORT'; payload: TaskSort }
  | { type: 'BATCH_UPDATE_TASKS'; payload: { taskIds: string[]; updates: Partial<Task> } }
  | { type: 'RESET_STATE'; payload?: Partial<TaskState> }

/**
 * Task reducer function for useReducer hook
 * Pure function that transforms state based on actions
 */
export function taskReducer(state: TaskState, action: TaskReducerAction): TaskState {
  switch (action.type) {
    case 'ADD_TASK':
      return {
        ...state,
        tasks: [...state.tasks, action.payload],
      }

    case 'UPDATE_TASK': {
      const { id, updates } = action.payload
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === id
            ? { ...task, ...updates, updatedAt: new Date() }
            : task
        ),
      }
    }

    case 'DELETE_TASK':
      return {
        ...state,
        tasks: state.tasks.filter((task) => task.id !== action.payload),
      }

    case 'TOGGLE_TASK_COMPLETION': {
      const id = action.payload
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === id
            ? {
                ...task,
                completed: !task.completed,
                updatedAt: new Date(),
              }
            : task
        ),
      }
    }

    case 'ADD_LIST':
      return {
        ...state,
        lists: [...state.lists, action.payload],
      }

    case 'UPDATE_LIST': {
      const { id, updates } = action.payload
      return {
        ...state,
        lists: state.lists.map((list) =>
          list.id === id
            ? { ...list, ...updates, updatedAt: new Date() }
            : list
        ),
      }
    }

    case 'DELETE_LIST': {
      const listId = action.payload
      return {
        ...state,
        lists: state.lists.filter((list) => list.id !== listId),
        tasks: state.tasks.filter((task) => task.listId !== listId),
      }
    }

    case 'SET_FILTER':
      return {
        ...state,
        filter: action.payload,
      }

    case 'SET_SORT':
      return {
        ...state,
        sort: action.payload,
      }

    case 'BATCH_UPDATE_TASKS': {
      const { taskIds, updates } = action.payload
      const idSet = new Set(taskIds)
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          idSet.has(task.id)
            ? { ...task, ...updates, updatedAt: new Date() }
            : task
        ),
      }
    }

    case 'RESET_STATE': {
      const defaultState: TaskState = {
        tasks: [],
        lists: [],
        filter: {},
        sort: { sortBy: 'dueDate', order: 'asc' },
      }
      return action.payload ? { ...defaultState, ...action.payload } : defaultState
    }

    default:
      return state
  }
}

/**
 * Custom hook using reducer pattern for task state management
 * Useful when you need complex state transitions
 */
export function useTaskStateReducer(initialState?: TaskState) {
  const defaultState: TaskState = useMemo(
    () =>
      initialState || {
        tasks: [],
        lists: [],
        filter: {},
        sort: { sortBy: 'dueDate', order: 'asc' },
      },
    [initialState]
  )

  const [state, dispatch] = useReducer(taskReducer, defaultState)

  // Action creators as memoized callbacks
  const actions = useMemo(
    () => ({
      addTask: (task: Task) =>
        dispatch({ type: 'ADD_TASK', payload: task }),
      updateTask: (id: string, updates: Partial<Task>) =>
        dispatch({ type: 'UPDATE_TASK', payload: { id, updates } }),
      deleteTask: (id: string) =>
        dispatch({ type: 'DELETE_TASK', payload: id }),
      toggleTaskCompletion: (id: string) =>
        dispatch({ type: 'TOGGLE_TASK_COMPLETION', payload: id }),
      addList: (list: TaskList) =>
        dispatch({ type: 'ADD_LIST', payload: list }),
      updateList: (id: string, updates: Partial<TaskList>) =>
        dispatch({ type: 'UPDATE_LIST', payload: { id, updates } }),
      deleteList: (id: string) =>
        dispatch({ type: 'DELETE_LIST', payload: id }),
      setFilter: (filter: TaskFilter) =>
        dispatch({ type: 'SET_FILTER', payload: filter }),
      setSort: (sort: TaskSort) =>
        dispatch({ type: 'SET_SORT', payload: sort }),
      batchUpdateTasks: (taskIds: string[], updates: Partial<Task>) =>
        dispatch({ type: 'BATCH_UPDATE_TASKS', payload: { taskIds, updates } }),
      resetState: (partialState?: Partial<TaskState>) =>
        dispatch({ type: 'RESET_STATE', payload: partialState }),
    }),
    []
  )

  return { state, dispatch, actions }
}

/**
 * Hook for tracking state history (undo/redo)
 * Maintains past and future states for navigation
 */
interface StateHistoryEntry {
  state: TaskState
  timestamp: Date
  description?: string
}

export function useTaskStateHistory(initialState: TaskState) {
  const [history, setHistory] = useReducer(
    (hist: StateHistoryEntry[], action: any) => {
      switch (action.type) {
        case 'PUSH':
          return [
            ...hist,
            {
              state: action.payload.state,
              timestamp: new Date(),
              description: action.payload.description,
            },
          ]
        case 'POP':
          return hist.slice(0, -1)
        case 'RESET':
          return [
            {
              state: action.payload,
              timestamp: new Date(),
              description: 'Initial state',
            },
          ]
        default:
          return hist
      }
    },
    [
      {
        state: initialState,
        timestamp: new Date(),
        description: 'Initial state',
      },
    ]
  )

  const push = useCallback(
    (state: TaskState, description?: string) => {
      setHistory({ type: 'PUSH', payload: { state, description } })
    },
    []
  )

  const undo = useCallback(() => {
    if (canUndo) {
      setHistory({ type: 'POP' })
    }
  }, [])

  const canUndo = history.length > 1
  const currentState = history[history.length - 1]?.state || initialState

  return {
    currentState,
    history,
    push,
    undo,
    canUndo,
  }
}

/**
 * Hook for managing state with immer-like draft updates
 * Allows modifying state as if it were mutable
 */
export function useImmutableStateUpdate<T>(initialState: T) {
  const [state, setState] = useReducer(
    (currentState: T, action: any) => {
      if (action.type === 'UPDATE') {
        return { ...currentState, ...action.payload }
      }
      return currentState
    },
    initialState
  )

  const updateState = useCallback(
    (updates: Partial<T> | ((draft: T) => Partial<T>)) => {
      const newUpdates =
        typeof updates === 'function' ? updates(state) : updates
      setState({ type: 'UPDATE', payload: newUpdates })
    },
    [state]
  )

  const resetState = useCallback(() => {
    setState({ type: 'UPDATE', payload: initialState })
  }, [initialState])

  return [state, updateState, resetState] as const
}

/**
 * Hook for reducer with middleware support
 * Allows intercepting and transforming actions
 */
export type ReducerMiddleware<S, A> = (
  action: A,
  state: S,
  next: (action: A) => void
) => void

export function useTaskReducerWithMiddleware(
  initialState: TaskState,
  middlewares: ReducerMiddleware<TaskState, TaskReducerAction>[] = []
) {
  const [state, dispatch] = useReducer(taskReducer, initialState)

  const dispatchWithMiddleware = useCallback(
    (action: TaskReducerAction) => {
      let actionProcessed = false

      const next = (processedAction: TaskReducerAction) => {
        if (!actionProcessed) {
          dispatch(processedAction)
          actionProcessed = true
        }
      }

      // Process through middleware chain
      if (middlewares.length === 0) {
        next(action)
        return
      }

      // Apply middlewares in reverse order
      let index = middlewares.length - 1

      const executeMiddleware = (currentAction: TaskReducerAction): void => {
        if (index < 0) {
          next(currentAction)
          return
        }

        const middleware = middlewares[index]
        index--

        middleware(currentAction, state, (modifiedAction) => {
          executeMiddleware(modifiedAction)
        })
      }

      executeMiddleware(action)
    },
    [state, middlewares]
  )

  return { state, dispatch: dispatchWithMiddleware }
}
