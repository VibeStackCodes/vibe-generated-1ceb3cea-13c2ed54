/**
 * Custom hooks for task management
 * Provides convenient access to task context and state
 * Includes hooks for accessing tasks, lists, filters, sorting, and loading state
 */

import { useContext } from 'react'
import { TaskContext } from '@/context/TaskContext'

/**
 * useTask hook
 * Access the complete task context (state and actions)
 * Throws error if used outside of TaskProvider
 */
export function useTask() {
  const context = useContext(TaskContext)

  if (!context) {
    throw new Error('useTask must be used within TaskProvider')
  }

  return context
}

/**
 * useTasks hook
 * Access only the tasks array
 */
export function useTasks() {
  const { state } = useTask()
  return state.tasks
}

/**
 * useTaskLists hook
 * Access only the lists array
 */
export function useTaskLists() {
  const { state } = useTask()
  return state.lists
}

/**
 * useTaskFilter hook
 * Access and set task filters
 */
export function useTaskFilter() {
  const { state, actions } = useTask()
  return {
    filter: state.filter,
    setFilter: actions.setFilter,
  }
}

/**
 * useTaskSort hook
 * Access and set task sorting
 */
export function useTaskSort() {
  const { state, actions } = useTask()
  return {
    sort: state.sort,
    setSort: actions.setSort,
  }
}

/**
 * useTaskActions hook
 * Access all task manipulation actions
 */
export function useTaskActions() {
  const { actions } = useTask()
  return actions
}

/**
 * useTaskLoading hook
 * Check if tasks are currently being loaded from storage
 * Useful for showing loading indicators during initialization
 */
export function useTaskLoading() {
  const context = useContext(TaskContext)

  if (!context) {
    throw new Error('useTaskLoading must be used within TaskProvider')
  }

  return context.isLoading
}

/**
 * useTasksByList hook
 * Get all tasks in a specific list
 */
export function useTasksByList(listId: string) {
  const { actions } = useTask()
  return actions.getTasksByList(listId)
}

/**
 * useFilteredTasks hook
 * Get filtered and sorted tasks
 */
export function useFilteredTasks() {
  const { actions } = useTask()
  return actions.getFilteredAndSortedTasks()
}
