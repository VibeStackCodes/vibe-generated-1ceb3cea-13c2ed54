/**
 * Custom hook for localStorage integration
 * Handles automatic persistence and loading of task state
 * Provides initialization and synchronization with localStorage
 */

import { useEffect, useCallback } from 'react'
import { loadTaskState, saveTaskState } from '@/utils/taskStorage'
import type { Task, TaskList } from '@/types/task'

interface UseLocalStorageOptions {
  autoSync?: boolean
  debounceMs?: number
}

/**
 * Custom hook for managing localStorage persistence
 * Automatically loads state on mount and saves on changes
 * Includes optional debouncing to prevent excessive writes
 */
export function useLocalStorage(
  tasks: Task[],
  lists: TaskList[],
  onLoad: (tasks: Task[], lists: TaskList[]) => void,
  options: UseLocalStorageOptions = {}
) {
  const { autoSync = true, debounceMs = 500 } = options

  /**
   * Load initial state from localStorage on component mount
   */
  useEffect(() => {
    const loadedState = loadTaskState()
    onLoad(loadedState.tasks, loadedState.lists)
  }, [onLoad])

  /**
   * Setup debounced save function
   */
  const debouncedSave = useCallback(() => {
    if (!autoSync) return

    const timeoutId = setTimeout(() => {
      saveTaskState({ tasks, lists })
    }, debounceMs)

    return () => clearTimeout(timeoutId)
  }, [tasks, lists, autoSync, debounceMs])

  /**
   * Save to localStorage whenever tasks or lists change
   */
  useEffect(() => {
    const cleanup = debouncedSave()
    return cleanup
  }, [debouncedSave])

  /**
   * Return utility function to force save immediately
   */
  const forceSave = useCallback(() => {
    saveTaskState({ tasks, lists })
  }, [tasks, lists])

  return { forceSave }
}

/**
 * Simpler hook for just loading state from localStorage
 * Useful for components that only need to read, not persist
 */
export function useLoadLocalStorage() {
  const loadState = useCallback(() => {
    return loadTaskState()
  }, [])

  return { loadState }
}
