/**
 * Task Operations Utilities
 * Common operations and utilities for task management
 */

import type { Task, TaskList } from '@/types/task'

/**
 * Group tasks by list
 */
export function groupTasksByList(
  tasks: Task[],
  lists: TaskList[]
): Record<string, Task[]> {
  const grouped: Record<string, Task[]> = {}

  lists.forEach((list) => {
    grouped[list.id] = tasks.filter((task) => task.listId === list.id)
  })

  return grouped
}

/**
 * Get incomplete tasks
 */
export function getIncompleteTasks(tasks: Task[]): Task[] {
  return tasks.filter((task) => !task.completed)
}

/**
 * Get completed tasks
 */
export function getCompletedTasks(tasks: Task[]): Task[] {
  return tasks.filter((task) => task.completed)
}

/**
 * Get overdue tasks
 */
export function getOverdueTasks(tasks: Task[]): Task[] {
  const now = new Date()
  now.setHours(0, 0, 0, 0)

  return tasks.filter((task) => {
    if (!task.dueDate || task.completed) return false
    const dueDate = new Date(task.dueDate)
    dueDate.setHours(0, 0, 0, 0)
    return dueDate < now
  })
}

/**
 * Get tasks due today
 */
export function getTasksDueToday(tasks: Task[]): Task[] {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  return tasks.filter((task) => {
    if (!task.dueDate) return false
    const dueDate = new Date(task.dueDate)
    dueDate.setHours(0, 0, 0, 0)
    return dueDate.getTime() === today.getTime()
  })
}

/**
 * Get tasks due this week
 */
export function getTasksDueThisWeek(tasks: Task[]): Task[] {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const weekStart = new Date(today)
  weekStart.setDate(today.getDate() - today.getDay())

  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekEnd.getDate() + 7)

  return tasks.filter((task) => {
    if (!task.dueDate) return false
    const dueDate = new Date(task.dueDate)
    dueDate.setHours(0, 0, 0, 0)
    return dueDate >= weekStart && dueDate < weekEnd
  })
}

/**
 * Get high priority tasks
 */
export function getHighPriorityTasks(tasks: Task[]): Task[] {
  return tasks.filter((task) => task.priority === 'high' && !task.completed)
}

/**
 * Get tasks with a specific tag
 */
export function getTasksByTag(tasks: Task[], tag: string): Task[] {
  return tasks.filter((task) => task.tags.includes(tag))
}

/**
 * Get all unique tags from tasks
 */
export function getAllTags(tasks: Task[]): string[] {
  const tagSet = new Set<string>()
  tasks.forEach((task) => {
    task.tags.forEach((tag) => tagSet.add(tag))
  })
  return Array.from(tagSet).sort()
}

/**
 * Get subtasks for a parent task
 */
export function getSubtasks(tasks: Task[], parentTaskId: string): Task[] {
  return tasks.filter((task) => task.parentTaskId === parentTaskId)
}

/**
 * Calculate task statistics
 */
export function calculateTaskStats(tasks: Task[], lists: TaskList[]) {
  const stats = {
    total: tasks.length,
    completed: tasks.filter((t) => t.completed).length,
    incomplete: tasks.filter((t) => !t.completed).length,
    overdue: getOverdueTasks(tasks).length,
    dueToday: getTasksDueToday(tasks).length,
    dueThisWeek: getTasksDueThisWeek(tasks).length,
    highPriority: getHighPriorityTasks(tasks).length,
    completionRate: tasks.length > 0 ? (tasks.filter((t) => t.completed).length / tasks.length) * 100 : 0,
    listStats: lists.map((list) => ({
      listId: list.id,
      listTitle: list.title,
      total: tasks.filter((t) => t.listId === list.id).length,
      completed: tasks.filter((t) => t.listId === list.id && t.completed).length,
    })),
  }

  return stats
}

/**
 * Search tasks by title and description
 */
export function searchTasks(
  tasks: Task[],
  query: string
): Task[] {
  const lowerQuery = query.toLowerCase()
  return tasks.filter(
    (task) =>
      task.title.toLowerCase().includes(lowerQuery) ||
      (task.description && task.description.toLowerCase().includes(lowerQuery))
  )
}

/**
 * Format a due date for display
 */
export function formatDueDate(date: Date): string {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const dueDate = new Date(date)
  dueDate.setHours(0, 0, 0, 0)

  if (dueDate.getTime() === today.getTime()) {
    return 'Today'
  }

  if (dueDate.getTime() === tomorrow.getTime()) {
    return 'Tomorrow'
  }

  if (dueDate < today) {
    return `Overdue by ${Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24))} days`
  }

  const options: Intl.DateTimeFormatOptions = {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }

  return dueDate.toLocaleDateString('en-US', options)
}

/**
 * Check if task is overdue
 */
export function isTaskOverdue(task: Task): boolean {
  if (task.completed || !task.dueDate) return false
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const dueDate = new Date(task.dueDate)
  dueDate.setHours(0, 0, 0, 0)
  return dueDate < today
}

/**
 * Check if task is due soon (within 3 days)
 */
export function isTaskDueSoon(task: Task): boolean {
  if (task.completed || !task.dueDate) return false

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const threeDaysFromNow = new Date(today)
  threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3)

  const dueDate = new Date(task.dueDate)
  dueDate.setHours(0, 0, 0, 0)

  return dueDate <= threeDaysFromNow && dueDate >= today
}
