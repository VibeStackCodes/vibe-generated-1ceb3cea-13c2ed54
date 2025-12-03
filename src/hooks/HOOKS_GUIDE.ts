/**
 * Comprehensive React Hooks Guide for Task State Management
 *
 * This guide demonstrates best practices and usage patterns for all available hooks
 * in the QuietTask application. Each section includes examples, use cases, and
 * performance considerations.
 *
 * ============================================================================
 * TABLE OF CONTENTS
 * ============================================================================
 *
 * 1. CORE HOOKS - Basic state access
 *    - useTask, useTasks, useTaskLists, useTaskActions, useTaskFilter, useTaskSort
 *
 * 2. ADVANCED HOOKS - Complex state computations
 *    - useTaskStatistics, useGroupedTasks, useDerivedTaskState, useTaskSearch
 *
 * 3. REDUCER HOOKS - Complex state transitions
 *    - useTaskStateReducer, useTaskStateHistory, useImmutableStateUpdate
 *
 * 4. PERFORMANCE HOOKS - Optimization utilities
 *    - useTaskSelector, useMemoizedTasks, useDebouncedValue, useDebouncedCallback
 *
 * 5. COMPOSITION HOOKS - Event listeners and workflows
 *    - useTaskEventListener, useTaskNotifications, useStateChangeSummary
 *
 * 6. STORAGE HOOKS - Persistence management
 *    - useStoragePersistence, useStorageDiagnostics
 *
 * ============================================================================
 */

/**
 * SECTION 1: CORE HOOKS
 * ============================================================================
 *
 * These hooks provide basic access to task state and actions.
 * They are the foundation for building task management features.
 *
 * useTask()
 * ---------
 * Returns the complete task context with state and actions.
 * Always use this as the base for accessing task state.
 *
 * Example:
 * ```tsx
 * import { useTask } from '@/hooks'
 *
 * function MyComponent() {
 *   const { state, actions, isLoading } = useTask()
 *
 *   const handleAddTask = () => {
 *     const newTask = actions.addTask({
 *       title: 'New Task',
 *       completed: false,
 *       priority: 'medium',
 *       listId: 'list-1',
 *       tags: []
 *     })
 *     console.log('Task created:', newTask)
 *   }
 *
 *   if (isLoading) return <div>Loading...</div>
 *
 *   return (
 *     <div>
 *       <button onClick={handleAddTask}>Add Task</button>
 *       <p>Total tasks: {state.tasks.length}</p>
 *     </div>
 *   )
 * }
 * ```
 *
 * useTasks()
 * ----------
 * Returns only the tasks array. Use when you only need tasks, not other state.
 * More efficient than useTask() when other state isn't needed.
 *
 * Example:
 * ```tsx
 * function TaskList() {
 *   const tasks = useTasks()
 *   return <ul>{tasks.map(t => <li key={t.id}>{t.title}</li>)}</ul>
 * }
 * ```
 *
 * useTaskActions()
 * ----------------
 * Returns only the actions object. Use when you need to dispatch actions
 * but don't need to read state.
 *
 * Example:
 * ```tsx
 * function TaskControls() {
 *   const actions = useTaskActions()
 *
 *   return (
 *     <button onClick={() => actions.toggleTaskCompletion('task-1')}>
 *       Toggle Task
 *     </button>
 *   )
 * }
 * ```
 *
 * useTaskFilter() and useTaskSort()
 * ----------------------------------
 * Access and modify filter and sort settings.
 *
 * Example:
 * ```tsx
 * function FilterControls() {
 *   const { filter, setFilter } = useTaskFilter()
 *   const { sort, setSort } = useTaskSort()
 *
 *   return (
 *     <div>
 *       <button
 *         onClick={() => setFilter({ priority: 'high' })}
 *       >
 *         Show High Priority
 *       </button>
 *       <button
 *         onClick={() => setSort({ sortBy: 'dueDate', order: 'asc' })}
 *       >
 *         Sort by Due Date
 *       </button>
 *     </div>
 *   )
 * }
 * ```
 *
 * ============================================================================
 */

/**
 * SECTION 2: ADVANCED HOOKS
 * ============================================================================
 *
 * These hooks compute derived state from task data.
 * They use memoization to prevent unnecessary recalculations.
 *
 * useTaskStatistics()
 * -------------------
 * Computes task statistics like completion percentage, counts by priority, etc.
 * Automatically memoized and only recalculates when tasks/lists change.
 *
 * Use cases:
 * - Dashboard stats display
 * - Progress indicators
 * - Analytics and reporting
 *
 * Example:
 * ```tsx
 * function Dashboard() {
 *   const stats = useTaskStatistics()
 *
 *   return (
 *     <div>
 *       <p>Total Tasks: {stats.total}</p>
 *       <p>Completed: {stats.completed} ({stats.completionPercentage.toFixed(1)}%)</p>
 *       <p>High Priority: {stats.byPriority.high}</p>
 *       <p>Overdue: {stats.overdue}</p>
 *       <p>Due Today: {stats.dueToday}</p>
 *       <p>Due Soon: {stats.dueSoon}</p>
 *     </div>
 *   )
 * }
 * ```
 *
 * useGroupedTasks(groupBy)
 * ------------------------
 * Groups tasks by listId, priority, completion status, or due date.
 * Returns a Record<string, Task[]> for easy mapping.
 *
 * Example:
 * ```tsx
 * function PriorityView() {
 *   const grouped = useGroupedTasks('priority')
 *
 *   return (
 *     <div>
 *       <h3>High Priority ({grouped.high?.length || 0})</h3>
 *       <ul>{grouped.high?.map(t => <li key={t.id}>{t.title}</li>)}</ul>
 *
 *       <h3>Medium Priority ({grouped.medium?.length || 0})</h3>
 *       <ul>{grouped.medium?.map(t => <li key={t.id}>{t.title}</li>)}</ul>
 *
 *       <h3>Low Priority ({grouped.low?.length || 0})</h3>
 *       <ul>{grouped.low?.map(t => <li key={t.id}>{t.title}</li>)}</ul>
 *     </div>
 *   )
 * }
 * ```
 *
 * useDerivedTaskState()
 * ---------------------
 * Provides a comprehensive derived state with active/completed tasks,
 * overdue tasks, and tasks grouped by priority/list.
 *
 * Example:
 * ```tsx
 * function TaskOverview() {
 *   const derived = useDerivedTaskState()
 *
 *   return (
 *     <div>
 *       <p>Active: {derived.activeTasks.length}</p>
 *       <p>Completed: {derived.completedTasks.length}</p>
 *       <p>Overdue: {derived.overdueTasks.length}</p>
 *       <p>Stats: {JSON.stringify(derived.statistics)}</p>
 *     </div>
 *   )
 * }
 * ```
 *
 * useTaskSearch(searchTerm)
 * -------------------------
 * Searches tasks by title or description.
 * Memoized to prevent recalculation on every render.
 *
 * Example:
 * ```tsx
 * function SearchTasks() {
 *   const [query, setQuery] = useState('')
 *   const results = useTaskSearch(query)
 *
 *   return (
 *     <div>
 *       <input
 *         value={query}
 *         onChange={e => setQuery(e.target.value)}
 *         placeholder="Search tasks..."
 *       />
 *       <ul>
 *         {results.map(t => <li key={t.id}>{t.title}</li>)}
 *       </ul>
 *     </div>
 *   )
 * }
 * ```
 *
 * ============================================================================
 */

/**
 * SECTION 3: REDUCER HOOKS
 * ============================================================================
 *
 * These hooks provide useReducer patterns for complex state management.
 * Useful for undo/redo, batch operations, and complex workflows.
 *
 * useTaskStateReducer(initialState)
 * ----------------------------------
 * Uses reducer pattern for state management.
 * Provides a dispatch function and action creators.
 * Useful for complex state transitions with middleware support.
 *
 * Example:
 * ```tsx
 * function TaskManager() {
 *   const { state, dispatch, actions } = useTaskStateReducer()
 *
 *   return (
 *     <div>
 *       <button onClick={() => actions.addTask({
 *         title: 'New Task',
 *         completed: false,
 *         priority: 'medium',
 *         listId: 'list-1',
 *         tags: []
 *       })}>
 *         Add Task
 *       </button>
 *       <p>Tasks: {state.tasks.length}</p>
 *     </div>
 *   )
 * }
 * ```
 *
 * useTaskStateHistory(initialState)
 * ----------------------------------
 * Maintains state history for undo/redo functionality.
 *
 * Example:
 * ```tsx
 * function UndoRedoExample() {
 *   const initialState = { tasks: [], lists: [], filter: {}, sort: { sortBy: 'dueDate', order: 'asc' } }
 *   const { currentState, push, undo, canUndo } = useTaskStateHistory(initialState)
 *
 *   return (
 *     <div>
 *       <button onClick={() => undo()} disabled={!canUndo}>Undo</button>
 *       <p>Current tasks: {currentState.tasks.length}</p>
 *     </div>
 *   )
 * }
 * ```
 *
 * useImmutableStateUpdate(initialState)
 * --------------------------------------
 * Provides a simple immutable state update pattern similar to useState
 * but with automatic immutability.
 *
 * Example:
 * ```tsx
 * function StateUpdateExample() {
 *   const [state, updateState] = useImmutableStateUpdate({ count: 0 })
 *
 *   return (
 *     <div>
 *       <button onClick={() => updateState({ count: state.count + 1 })}>
 *         Increment
 *       </button>
 *       <p>Count: {state.count}</p>
 *     </div>
 *   )
 * }
 * ```
 *
 * ============================================================================
 */

/**
 * SECTION 4: PERFORMANCE HOOKS
 * ============================================================================
 *
 * These hooks optimize performance by preventing unnecessary re-renders
 * and computations.
 *
 * useTaskSelector(selector, equalityFn)
 * --------------------------------------
 * Memoizes selected state slices. Only re-renders when selected value changes.
 * Useful for performance optimization in large lists.
 *
 * Example:
 * ```tsx
 * function HighPriorityCount() {
 *   const highPriorityCount = useTaskSelector(
 *     state => state.tasks.filter(t => t.priority === 'high').length,
 *     (a, b) => a === b // shallow equality
 *   )
 *
 *   return <div>High Priority Tasks: {highPriorityCount}</div>
 * }
 * ```
 *
 * useMemoizedTasks() and useMemoizedTaskLists()
 * -----------------------------------------------
 * Shallow memoization of tasks and lists arrays.
 * Only updates when array reference changes, not when contents change.
 *
 * Example:
 * ```tsx
 * function OptimizedTaskList() {
 *   const tasks = useMemoizedTasks()
 *   return <ul>{tasks.map(t => <li key={t.id}>{t.title}</li>)}</ul>
 * }
 * ```
 *
 * useDebouncedValue(value, delay)
 * --------------------------------
 * Delays value updates by specified milliseconds.
 * Useful for search inputs, filter debouncing.
 *
 * Example:
 * ```tsx
 * function SearchInput() {
 *   const [search, setSearch] = useState('')
 *   const debouncedSearch = useDebouncedValue(search, 300)
 *
 *   useEffect(() => {
 *     // Perform expensive search operation
 *     console.log('Searching for:', debouncedSearch)
 *   }, [debouncedSearch])
 *
 *   return <input value={search} onChange={e => setSearch(e.target.value)} />
 * }
 * ```
 *
 * useDebouncedCallback(callback, delay)
 * --------------------------------------
 * Delays function execution by specified milliseconds.
 *
 * Example:
 * ```tsx
 * function AutoSaveForm() {
 *   const debouncedSave = useDebouncedCallback((data) => {
 *     console.log('Saving:', data)
 *   }, 1000)
 *
 *   return (
 *     <input onChange={e => debouncedSave({ value: e.target.value })} />
 *   )
 * }
 * ```
 *
 * useTaskMap() and useListMap()
 * -----------------------------
 * Returns Map objects for O(1) lookup performance.
 *
 * Example:
 * ```tsx
 * function TaskDetail({ taskId }) {
 *   const taskMap = useTaskMap()
 *   const task = taskMap.get(taskId)
 *   return task ? <div>{task.title}</div> : <div>Not found</div>
 * }
 * ```
 *
 * ============================================================================
 */

/**
 * SECTION 5: COMPOSITION HOOKS
 * ============================================================================
 *
 * These hooks enable event-driven state management and complex workflows.
 *
 * useTaskEventListener(eventTypes, listener)
 * -------------------------------------------
 * Subscribe to task state change events.
 *
 * Example:
 * ```tsx
 * function TaskLogger() {
 *   useTaskEventListener(
 *     ['taskAdded', 'taskCompleted'],
 *     (event) => {
 *       console.log(`Event: ${event.type}`, event.data)
 *     }
 *   )
 *
 *   return <div>Check console for events</div>
 * }
 * ```
 *
 * useTaskNotifications(options)
 * ------------------------------
 * Trigger callbacks on significant state changes like tasks being due.
 *
 * Example:
 * ```tsx
 * function NotificationHandler() {
 *   useTaskNotifications({
 *     onTaskDue: (task) => {
 *       console.log(`Task due: ${task.title}`)
 *       // Show notification
 *     },
 *     onTaskOverdue: (task) => {
 *       console.log(`Task overdue: ${task.title}`)
 *     },
 *     onTaskCompleted: (task) => {
 *       console.log(`Task completed: ${task.title}`)
 *     }
 *   })
 *
 *   return <div>Monitoring tasks...</div>
 * }
 * ```
 *
 * useStateChangeSummary()
 * -----------------------
 * Track what changed in the state since the last render.
 *
 * Example:
 * ```tsx
 * function StateMonitor() {
 *   const summary = useStateChangeSummary()
 *
 *   useEffect(() => {
 *     if (summary.taskCountChanged) {
 *       console.log(
 *         `Tasks changed from ${summary.previousTaskCount} to ${summary.currentTaskCount}`
 *       )
 *     }
 *   }, [summary])
 *
 *   return <div>State changes: {JSON.stringify(summary)}</div>
 * }
 * ```
 *
 * useAsyncTaskOperation()
 * -----------------------
 * Manage async operations with loading and error states.
 *
 * Example:
 * ```tsx
 * function AsyncOperationExample() {
 *   const { isLoading, error, execute } = useAsyncTaskOperation()
 *
 *   const handleFetch = async () => {
 *     await execute(async () => {
 *       // Perform async operation
 *       await new Promise(resolve => setTimeout(resolve, 1000))
 *     })
 *   }
 *
 *   return (
 *     <div>
 *       <button onClick={handleFetch} disabled={isLoading}>
 *         {isLoading ? 'Loading...' : 'Execute'}
 *       </button>
 *       {error && <div>Error: {error.message}</div>}
 *     </div>
 *   )
 * }
 * ```
 *
 * ============================================================================
 */

/**
 * SECTION 6: STORAGE HOOKS
 * ============================================================================
 *
 * These hooks manage localStorage persistence and diagnostics.
 *
 * useStoragePersistence(tasks, lists, onLoad, options)
 * ---------------------------------------------------
 * Advanced storage persistence with retry logic and diagnostics.
 *
 * Example:
 * ```tsx
 * function PersistenceExample() {
 *   const [tasks, setTasks] = useState([])
 *   const [lists, setLists] = useState([])
 *
 *   const persistence = useStoragePersistence(
 *     tasks,
 *     lists,
 *     (newTasks, newLists) => {
 *       setTasks(newTasks)
 *       setLists(newLists)
 *     },
 *     {
 *       autoSync: true,
 *       debounceMs: 500,
 *       onSyncError: (error) => console.error('Sync error:', error),
 *       onSyncSuccess: () => console.log('Synced to storage')
 *     }
 *   )
 *
 *   return (
 *     <div>
 *       <p>Storage size: {persistence.stats.storageSize} bytes</p>
 *       <button onClick={persistence.forceSave}>Force Save</button>
 *       <button onClick={persistence.exportAsJSON}>Export</button>
 *     </div>
 *   )
 * }
 * ```
 *
 * useStorageDiagnostics()
 * -----------------------
 * Get diagnostic information about localStorage usage.
 *
 * Example:
 * ```tsx
 * function StorageMonitor() {
 *   const diagnostics = useStorageDiagnostics()
 *
 *   return (
 *     <div>
 *       <p>Storage available: {diagnostics.isAvailable ? 'Yes' : 'No'}</p>
 *       <p>Tasks: {diagnostics.stats.tasksCount}</p>
 *       <p>Storage used: {diagnostics.usagePercent.toFixed(1)}%</p>
 *     </div>
 *   )
 * }
 * ```
 *
 * ============================================================================
 */

/**
 * BEST PRACTICES & PATTERNS
 * ============================================================================
 *
 * 1. Hook Rules
 *    - Always call hooks at the top level of your component
 *    - Never call hooks conditionally
 *    - Use ESLint rules to enforce these patterns
 *
 * 2. Performance Optimization
 *    - Use specific hooks (useTasks instead of useTask) when possible
 *    - Use selector hooks with memoization for expensive computations
 *    - Debounce frequent updates like search inputs
 *
 * 3. Error Handling
 *    - Check for errors in useAsyncTaskOperation results
 *    - Handle edge cases in validation hooks
 *    - Implement error boundaries around task operations
 *
 * 4. State Updates
 *    - Always use action creators instead of manual state updates
 *    - Batch related updates together
 *    - Avoid triggering unnecessary re-renders
 *
 * 5. localStorage
 *    - Use useStoragePersistence for automatic syncing
 *    - Handle quota exceeded errors gracefully
 *    - Monitor storage usage with diagnostics hooks
 *
 * ============================================================================
 */

/**
 * MIGRATION GUIDE
 * ============================================================================
 *
 * Moving from useState to useTask:
 *
 * Before:
 * ```tsx
 * const [tasks, setTasks] = useState([])
 * const [filter, setFilter] = useState({})
 * ```
 *
 * After:
 * ```tsx
 * const { state, actions } = useTask()
 * const { tasks } = state
 * const { setFilter } = actions
 * ```
 *
 * ============================================================================
 */

// This file is documentation only - no runtime code
export const HOOKS_GUIDE = true
