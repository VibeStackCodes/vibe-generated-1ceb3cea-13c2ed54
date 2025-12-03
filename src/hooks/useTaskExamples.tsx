/**
 * Practical examples of hooks usage in React components
 * These are working examples demonstrating real-world usage patterns
 * for QuietTask state management hooks
 */

import { useState, useEffect } from 'react'
import {
  // Core hooks
  useTask,
  useTasks,
  useTaskLists,
  useTaskActions,
  useTaskFilter,
  useTaskSort,

  // Advanced hooks
  useTaskStatistics,
  useGroupedTasks,
  useDerivedTaskState,
  useTaskSearch,
  useTaskValidation,

  // Reducer hooks
  useTaskStateReducer,

  // Performance hooks
  useDebouncedValue,
  useDebouncedCallback,
  useTaskSelector,

  // Composition hooks
  useTaskEventListener,
  useTaskNotifications,
  useStateChangeSummary,

  // Storage hooks
  useStoragePersistence,
} from '@/hooks'

import type { Task } from '@/types/task'

/**
 * Example 1: Simple Task List Component
 * Demonstrates: useTasks, useTaskActions, basic rendering
 */
export function SimpleTaskListExample() {
  const tasks = useTasks()
  const { addTask, deleteTask, toggleTaskCompletion } = useTaskActions()

  const handleAddTask = () => {
    const title = prompt('Enter task title:')
    if (title) {
      addTask({
        title,
        completed: false,
        priority: 'medium',
        listId: 'default',
        tags: [],
      })
    }
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">My Tasks ({tasks.length})</h2>
      <button
        onClick={handleAddTask}
        className="mb-4 px-4 py-2 bg-blue-500 text-white rounded"
      >
        Add Task
      </button>
      <ul className="space-y-2">
        {tasks.map((task) => (
          <li
            key={task.id}
            className="flex items-center gap-2 p-2 border rounded"
          >
            <input
              type="checkbox"
              checked={task.completed}
              onChange={() => toggleTaskCompletion(task.id)}
            />
            <span className={task.completed ? 'line-through' : ''}>
              {task.title}
            </span>
            <button
              onClick={() => deleteTask(task.id)}
              className="ml-auto text-red-500"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

/**
 * Example 2: Dashboard with Statistics
 * Demonstrates: useTaskStatistics, useDerivedTaskState, memoization
 */
export function DashboardStatsExample() {
  const stats = useTaskStatistics()
  const derived = useDerivedTaskState()

  return (
    <div className="p-4 grid grid-cols-2 gap-4">
      <div className="p-4 bg-blue-100 rounded">
        <h3 className="font-bold">Total Tasks</h3>
        <p className="text-2xl">{stats.total}</p>
      </div>

      <div className="p-4 bg-green-100 rounded">
        <h3 className="font-bold">Completed</h3>
        <p className="text-2xl">{stats.completed}</p>
      </div>

      <div className="p-4 bg-yellow-100 rounded">
        <h3 className="font-bold">Completion %</h3>
        <p className="text-2xl">{stats.completionPercentage.toFixed(1)}%</p>
      </div>

      <div className="p-4 bg-red-100 rounded">
        <h3 className="font-bold">Overdue</h3>
        <p className="text-2xl">{stats.overdue}</p>
      </div>

      <div className="p-4 bg-purple-100 rounded">
        <h3 className="font-bold">Due Today</h3>
        <p className="text-2xl">{stats.dueToday}</p>
      </div>

      <div className="p-4 bg-orange-100 rounded">
        <h3 className="font-bold">Due Soon</h3>
        <p className="text-2xl">{stats.dueSoon}</p>
      </div>

      <div className="p-4 bg-gray-100 rounded col-span-2">
        <h3 className="font-bold">Priority Breakdown</h3>
        <p>High: {stats.byPriority.high}</p>
        <p>Medium: {stats.byPriority.medium}</p>
        <p>Low: {stats.byPriority.low}</p>
      </div>

      <div className="p-4 bg-gray-100 rounded col-span-2">
        <h3 className="font-bold">By Status</h3>
        <p>Active: {derived.activeTasks.length}</p>
        <p>Completed: {derived.completedTasks.length}</p>
      </div>
    </div>
  )
}

/**
 * Example 3: Search with Debouncing
 * Demonstrates: useDebouncedValue, useTaskSearch, performance optimization
 */
export function SearchWithDebouncingExample() {
  const [query, setQuery] = useState('')
  const debouncedQuery = useDebouncedValue(query, 300)
  const results = useTaskSearch(debouncedQuery)

  return (
    <div className="p-4">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search tasks..."
        className="w-full px-4 py-2 border rounded mb-4"
      />
      <p className="text-gray-600 text-sm mb-2">
        Found {results.length} tasks{' '}
        {debouncedQuery && `matching "${debouncedQuery}"`}
      </p>
      <ul className="space-y-2">
        {results.map((task) => (
          <li key={task.id} className="p-2 bg-gray-100 rounded">
            <p className="font-bold">{task.title}</p>
            {task.description && (
              <p className="text-sm text-gray-600">{task.description}</p>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

/**
 * Example 4: Priority Filter View
 * Demonstrates: useGroupedTasks, filtering, conditional rendering
 */
export function PriorityFilterViewExample() {
  const grouped = useGroupedTasks('priority')
  const { toggleTaskCompletion } = useTaskActions()

  const renderTaskGroup = (priority: 'high' | 'medium' | 'low', label: string, color: string) => {
    const tasks = grouped[priority] || []
    return (
      <div key={priority} className="mb-6">
        <h3 className={`text-lg font-bold ${color} mb-2`}>
          {label} ({tasks.length})
        </h3>
        {tasks.length === 0 ? (
          <p className="text-gray-400 italic">No tasks</p>
        ) : (
          <ul className="space-y-1">
            {tasks.map((task) => (
              <li
                key={task.id}
                className="flex items-center gap-2 p-2 bg-gray-50 rounded"
              >
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => toggleTaskCompletion(task.id)}
                />
                <span className={task.completed ? 'line-through text-gray-400' : ''}>
                  {task.title}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    )
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Tasks by Priority</h2>
      {renderTaskGroup('high', 'High Priority', 'text-red-600')}
      {renderTaskGroup('medium', 'Medium Priority', 'text-yellow-600')}
      {renderTaskGroup('low', 'Low Priority', 'text-green-600')}
    </div>
  )
}

/**
 * Example 5: Task Notifications
 * Demonstrates: useTaskNotifications, event listeners, side effects
 */
export function TaskNotificationsExample() {
  const [notifications, setNotifications] = useState<string[]>([])

  useTaskNotifications({
    onTaskDue: (task) => {
      setNotifications((prev) => [
        ...prev,
        `📌 Task due today: ${task.title}`,
      ])
    },
    onTaskOverdue: (task) => {
      setNotifications((prev) => [
        ...prev,
        `⚠️ Task overdue: ${task.title}`,
      ])
    },
    onTaskCompleted: (task) => {
      setNotifications((prev) => [
        ...prev,
        `✅ Task completed: ${task.title}`,
      ])
    },
  })

  // Auto-clear old notifications
  useEffect(() => {
    if (notifications.length > 5) {
      setNotifications((prev) => prev.slice(-5))
    }
  }, [notifications])

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Recent Notifications</h2>
      <ul className="space-y-2">
        {notifications.map((notif, idx) => (
          <li
            key={idx}
            className="p-2 bg-blue-100 border border-blue-300 rounded"
          >
            {notif}
          </li>
        ))}
      </ul>
      {notifications.length === 0 && (
        <p className="text-gray-400 italic">No notifications yet</p>
      )}
    </div>
  )
}

/**
 * Example 6: State Change Monitor
 * Demonstrates: useStateChangeSummary, useTaskEventListener, monitoring
 */
export function StateChangeMonitorExample() {
  const summary = useStateChangeSummary()
  const [events, setEvents] = useState<string[]>([])

  useTaskEventListener(
    ['taskAdded', 'taskDeleted', 'taskCompleted'],
    (event) => {
      const message = `${event.type}: ${new Date().toLocaleTimeString()}`
      setEvents((prev) => [message, ...prev].slice(0, 10))
    }
  )

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">State Changes</h2>
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className={summary.taskCountChanged ? 'p-2 bg-yellow-100' : 'p-2'}>
          Tasks: {summary.previousTaskCount} → {summary.currentTaskCount}
        </div>
        <div className={summary.listCountChanged ? 'p-2 bg-yellow-100' : 'p-2'}>
          Lists: {summary.previousListCount} → {summary.currentListCount}
        </div>
        <div className={summary.filterChanged ? 'p-2 bg-yellow-100' : 'p-2'}>
          Filter Changed: {summary.filterChanged ? 'Yes' : 'No'}
        </div>
        <div className={summary.sortChanged ? 'p-2 bg-yellow-100' : 'p-2'}>
          Sort Changed: {summary.sortChanged ? 'Yes' : 'No'}
        </div>
      </div>

      <h3 className="font-bold mb-2">Recent Events</h3>
      <ul className="space-y-1">
        {events.map((event, idx) => (
          <li key={idx} className="text-sm text-gray-600 p-1">
            {event}
          </li>
        ))}
      </ul>
    </div>
  )
}

/**
 * Example 7: Form with Validation
 * Demonstrates: useTaskValidation, form handling, error states
 */
export function TaskFormWithValidationExample() {
  const [formData, setFormData] = useState({
    title: '',
    priority: 'medium' as const,
  })
  const [errors, setErrors] = useState<string[]>([])

  const { validateTask } = useTaskValidation()
  const { addTask } = useTaskActions()

  const handleSubmit = () => {
    const validation = validateTask({
      title: formData.title,
      priority: formData.priority,
      completed: false,
      listId: 'default',
      tags: [],
    })

    if (!validation.valid) {
      setErrors(validation.errors)
      return
    }

    addTask({
      title: formData.title,
      priority: formData.priority,
      completed: false,
      listId: 'default',
      tags: [],
    })

    setFormData({ title: '', priority: 'medium' })
    setErrors([])
  }

  return (
    <div className="p-4 max-w-md">
      <h2 className="text-xl font-bold mb-4">Add New Task</h2>

      {errors.length > 0 && (
        <div className="p-2 bg-red-100 border border-red-300 rounded mb-4">
          {errors.map((error, idx) => (
            <p key={idx} className="text-sm text-red-700">
              • {error}
            </p>
          ))}
        </div>
      )}

      <input
        type="text"
        value={formData.title}
        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        placeholder="Task title"
        className="w-full px-3 py-2 border rounded mb-2"
      />

      <select
        value={formData.priority}
        onChange={(e) =>
          setFormData({ ...formData, priority: e.target.value as any })
        }
        className="w-full px-3 py-2 border rounded mb-4"
      >
        <option value="low">Low Priority</option>
        <option value="medium">Medium Priority</option>
        <option value="high">High Priority</option>
      </select>

      <button
        onClick={handleSubmit}
        className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Add Task
      </button>
    </div>
  )
}

/**
 * Example 8: Async Task Operation
 * Demonstrates: useAsyncTaskOperation, loading states, error handling
 */
export function AsyncOperationExample() {
  const { state: actionState, execute } = useTask()
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>(
    'idle'
  )

  const handleAsyncAction = async () => {
    setStatus('loading')
    try {
      // Simulate async operation
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setStatus('success')
      setTimeout(() => setStatus('idle'), 2000)
    } catch (error) {
      setStatus('error')
    }
  }

  return (
    <div className="p-4">
      <button
        onClick={handleAsyncAction}
        disabled={status === 'loading'}
        className={`px-4 py-2 rounded text-white ${
          status === 'loading'
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-500 hover:bg-blue-600'
        }`}
      >
        {status === 'loading'
          ? 'Processing...'
          : status === 'success'
            ? 'Success! ✓'
            : 'Execute Action'}
      </button>

      <p className="mt-4 text-sm text-gray-600">
        Current status: <strong>{status}</strong>
      </p>
      <p className="mt-2 text-sm">
        Total tasks: <strong>{actionState.tasks.length}</strong>
      </p>
    </div>
  )
}

/**
 * Export all examples as a component map for demonstration
 */
export const HOOK_EXAMPLES = {
  SimpleTaskList: SimpleTaskListExample,
  Dashboard: DashboardStatsExample,
  Search: SearchWithDebouncingExample,
  PriorityFilter: PriorityFilterViewExample,
  Notifications: TaskNotificationsExample,
  StateMonitor: StateChangeMonitorExample,
  TaskForm: TaskFormWithValidationExample,
  AsyncOperation: AsyncOperationExample,
}

export type HookExampleKey = keyof typeof HOOK_EXAMPLES
