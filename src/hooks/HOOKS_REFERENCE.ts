/**
 * Complete Reference of All Available Hooks
 *
 * This file provides a quick reference for all 50+ hooks available
 * in the QuietTask application, organized by category and purpose.
 *
 * For detailed documentation and examples, see HOOKS_GUIDE.ts
 */

/**
 * ============================================================================
 * CORE HOOKS (9 total)
 * ============================================================================
 * Basic state access and actions - use these as your starting point
 */

/**
 * useTask()
 * Returns: { state: TaskState, actions: TaskActions, isLoading: boolean }
 * Purpose: Access complete task context (state and actions)
 * Use when: You need multiple aspects of the task state
 */

/**
 * useTasks()
 * Returns: Task[]
 * Purpose: Get only the tasks array
 * Use when: You only need tasks, no other state
 * Performance: More efficient than useTask() for tasks-only needs
 */

/**
 * useTaskLists()
 * Returns: TaskList[]
 * Purpose: Get only the lists array
 * Use when: You only need lists, no other state
 */

/**
 * useTaskFilter()
 * Returns: { filter: TaskFilter, setFilter: (filter: TaskFilter) => void }
 * Purpose: Manage task filters
 * Use when: Building filter UI or applying filters
 */

/**
 * useTaskSort()
 * Returns: { sort: TaskSort, setSort: (sort: TaskSort) => void }
 * Purpose: Manage task sorting
 * Use when: Building sort controls
 */

/**
 * useTaskActions()
 * Returns: TaskActions object with all action methods
 * Purpose: Get all available actions
 * Use when: You only need to dispatch actions, not read state
 */

/**
 * useTaskLoading()
 * Returns: boolean
 * Purpose: Check if tasks are being loaded from storage
 * Use when: Showing loading indicators during initialization
 */

/**
 * useTasksByList(listId)
 * Returns: Task[]
 * Purpose: Get all tasks in a specific list
 * Use when: Displaying tasks for a particular list
 */

/**
 * useFilteredTasks()
 * Returns: Task[]
 * Purpose: Get filtered and sorted tasks based on current filter/sort
 * Use when: Displaying the final filtered list
 */

/**
 * ============================================================================
 * ADVANCED HOOKS (12 total)
 * ============================================================================
 * Complex state computations with memoization for performance
 */

/**
 * useTaskStatistics()
 * Returns: TaskStatistics
 * Purpose: Compute task statistics (total, completed, overdue, by priority)
 * Memoized: Yes, only recalculates when tasks change
 * Use when: Displaying dashboard stats or progress indicators
 */

/**
 * useGroupedTasks(groupBy: 'listId' | 'priority' | 'completed' | 'dueDate')
 * Returns: Record<string, Task[]>
 * Purpose: Group tasks by specified field
 * Use when: Displaying tasks organized by category
 */

/**
 * useDerivedTaskState()
 * Returns: DerivedTaskState
 * Purpose: Get comprehensive derived state (active, completed, overdue, by priority/list)
 * Use when: Building complex task views with multiple derived values
 */

/**
 * useFilterBuilder()
 * Returns: FilterBuilder with fluent API
 * Purpose: Build filters using fluent API
 * Use when: Building advanced filter UIs
 */

/**
 * useSortBuilder()
 * Returns: SortBuilder with fluent API
 * Purpose: Build sorts using fluent API
 * Use when: Building advanced sort controls
 */

/**
 * useTaskSearch(searchTerm: string)
 * Returns: Task[]
 * Purpose: Search tasks by title or description
 * Memoized: Yes, includes debouncing capability
 * Use when: Building search functionality
 */

/**
 * useTaskValidation()
 * Returns: { validateTask, validateList }
 * Purpose: Validate task and list data
 * Use when: Creating/updating tasks with validation
 */

/**
 * useTasksByTag(tag: string)
 * Returns: Task[]
 * Purpose: Get all tasks with a specific tag
 * Use when: Filtering by tags
 */

/**
 * useCompletionTrend()
 * Returns: { last7Days, last30Days, last90Days }
 * Purpose: Calculate completion trend over time periods
 * Use when: Analyzing task completion trends
 */

/**
 * useTasksByDateRange(from: Date, to: Date)
 * Returns: Task[]
 * Purpose: Get tasks within a date range
 * Use when: Filtering by date ranges (calendar views)
 */

/**
 * useBulkTaskOperations()
 * Returns: (taskIds: string[], updates: Partial<Task>) => void
 * Purpose: Update multiple tasks at once
 * Use when: Bulk operations (mark all as done, change priority, etc.)
 */

/**
 * useTaskUndoRedoState()
 * Returns: { currentState, canUndo, canRedo, undo, redo }
 * Purpose: Foundation for undo/redo (requires middleware)
 * Use when: Implementing undo/redo functionality
 */

/**
 * ============================================================================
 * REDUCER HOOKS (4 total)
 * ============================================================================
 * useReducer patterns for complex state management
 */

/**
 * useTaskStateReducer(initialState?: TaskState)
 * Returns: { state, dispatch, actions }
 * Purpose: Reducer-based state management with action creators
 * Use when: Complex state transitions with middleware support
 */

/**
 * useTaskStateHistory(initialState: TaskState)
 * Returns: { currentState, history, push, undo, canUndo }
 * Purpose: Track state history for undo/redo
 * Use when: Implementing full undo/redo functionality
 */

/**
 * useImmutableStateUpdate(initialState)
 * Returns: [state, updateState, resetState]
 * Purpose: Immutable state updates similar to useState
 * Use when: Need immutability guarantees
 */

/**
 * useTaskReducerWithMiddleware(initialState, middlewares)
 * Returns: { state, dispatch }
 * Purpose: Reducer with middleware for intercepting actions
 * Use when: Need logging, analytics, or action interception
 */

/**
 * ============================================================================
 * PERFORMANCE HOOKS (15+ total)
 * ============================================================================
 * Optimization utilities and memoization patterns
 */

/**
 * useTaskSelector<T>(selector, equalityFn?)
 * Returns: T
 * Purpose: Memoized state selector with custom equality
 * Use when: Selecting specific state slices for performance
 */

/**
 * useMemoizedTasks()
 * Returns: Task[] (shallow memoized)
 * Purpose: Prevent re-renders when tasks array reference doesn't change
 * Use when: Large task lists needing optimization
 */

/**
 * useMemoizedTaskLists()
 * Returns: TaskList[] (shallow memoized)
 * Purpose: Prevent re-renders for lists
 * Use when: Optimizing list rendering
 */

/**
 * useDebouncedValue<T>(value, delay = 500)
 * Returns: T
 * Purpose: Delay value updates
 * Use when: Search inputs, filter debouncing, expensive operations
 */

/**
 * useDebouncedCallback<T>(callback, delay = 500, deps)
 * Returns: (...args) => void
 * Purpose: Delay function execution
 * Use when: Auto-save, delayed validations
 */

/**
 * useThrottledCallback<T>(callback, delay = 500, deps)
 * Returns: (...args) => void
 * Purpose: Limit function execution frequency
 * Use when: Scroll events, resize handlers
 */

/**
 * useTaskMap()
 * Returns: Map<string, Task>
 * Purpose: O(1) task lookup by ID
 * Use when: Frequent task lookups needed
 */

/**
 * useListMap()
 * Returns: Map<string, TaskList>
 * Purpose: O(1) list lookup by ID
 * Use when: Frequent list lookups needed
 */

/**
 * useMemoizedFilteredTasks(filter)
 * Returns: Task[]
 * Purpose: Memoized task filtering
 * Use when: Complex filtering with optimization
 */

/**
 * useMemoizedSortedTasks(tasks, sort)
 * Returns: Task[]
 * Purpose: Memoized task sorting
 * Use when: Complex sorting with optimization
 */

/**
 * useHasMounted()
 * Returns: boolean
 * Purpose: Detect if component has mounted
 * Use when: Avoiding hydration mismatches
 */

/**
 * usePrevious<T>(value)
 * Returns: T | undefined
 * Purpose: Track previous value
 * Use when: Detecting changes between renders
 */

/**
 * useHasChanged<T>(value, isEqual?)
 * Returns: boolean
 * Purpose: Check if value has changed
 * Use when: Conditional side effects on change
 */

/**
 * useStableCallback<T>(callback, deps)
 * Returns: T (reference-stable callback)
 * Purpose: Callback with reference stability
 * Use when: Passing callbacks to optimized children
 */

/**
 * useRenderMetrics(componentName)
 * Returns: { renderCount, metrics }
 * Purpose: Track render count and timing
 * Use when: Performance debugging and monitoring
 */

/**
 * ============================================================================
 * COMPOSITION HOOKS (9 total)
 * ============================================================================
 * Event listeners, notifications, and workflow coordination
 */

/**
 * useTaskEventListener(eventTypes, listener)
 * Returns: void (sets up subscription)
 * Purpose: Subscribe to task state changes
 * Events: taskAdded, taskUpdated, taskDeleted, taskCompleted, taskUncompleted,
 *         listAdded, listUpdated, listDeleted, filterChanged, sortChanged
 * Use when: Building event-driven features
 */

/**
 * useTaskNotifications(options)
 * Returns: void (sets up subscriptions)
 * Purpose: Trigger callbacks on significant state changes
 * Options: onTaskDue, onTaskOverdue, onTaskCompleted, onQuotaWarning
 * Use when: Showing notifications or alerts
 */

/**
 * useStateChangeSummary()
 * Returns: StateChangeSummary
 * Purpose: Track what changed since last render
 * Use when: Monitoring state changes for effects
 */

/**
 * useConditionalTaskOperations(operations)
 * Returns: () => void (execute operations)
 * Purpose: Apply operations only when conditions are met
 * Use when: Conditional bulk operations
 */

/**
 * useDependentTaskOperations()
 * Returns: (operations) => Promise<void>
 * Purpose: Chain dependent operations
 * Use when: Sequential operations with dependencies
 */

/**
 * useTaskStateCache<T>(computeFn, deps)
 * Returns: T (cached result)
 * Purpose: Cache expensive computations
 * Use when: Very expensive calculations
 */

/**
 * useAsyncTaskOperation()
 * Returns: { isLoading, error, isSuccess, execute, reset }
 * Purpose: Manage async operations with loading/error states
 * Use when: Async operations like API calls
 */

/**
 * useTaskStateSerializer()
 * Returns: { serialize, deserialize }
 * Purpose: Serialize/deserialize task state
 * Use when: Saving/loading state from files
 */

/**
 * useBatchOperationProgress<T>(items, operation, onProgress?)
 * Returns: { isRunning, completedCount, totalCount, currentItem, error, execute }
 * Purpose: Track progress of batch operations
 * Use when: Long-running batch operations with progress tracking
 */

/**
 * ============================================================================
 * STORAGE HOOKS (2 total)
 * ============================================================================
 * localStorage persistence and diagnostics
 */

/**
 * useStoragePersistence(tasks, lists, onLoad, options)
 * Returns: { stats, forceSave, forceLoad, clear, restore, exportAsJSON, importFromJSON, isAvailable }
 * Purpose: Advanced storage persistence with diagnostics
 * Use when: Full control over storage with monitoring
 */

/**
 * useStorageDiagnostics()
 * Returns: { isAvailable, stats, availableSpace, usagePercent, refresh }
 * Purpose: Get storage diagnostics and monitoring
 * Use when: Monitoring storage usage and availability
 */

/**
 * ============================================================================
 * UTILITY FUNCTIONS (Exported)
 * ============================================================================
 */

/**
 * shallowEqual(a, b): boolean
 * Purpose: Shallow object equality check
 * Use when: Custom equality in selectors
 */

/**
 * deepEqual(a, b): boolean
 * Purpose: Deep object equality check
 * Use when: Complex object comparison
 */

/**
 * ============================================================================
 * QUICK START GUIDE
 * ============================================================================
 *
 * For a new task management feature:
 *
 * 1. Access state:
 *    const { state, actions } = useTask()
 *    or
 *    const tasks = useTasks()
 *
 * 2. Dispatch actions:
 *    const { addTask, updateTask, deleteTask } = useTaskActions()
 *    actions.addTask({ ... })
 *
 * 3. Optimize rendering:
 *    const specificValue = useTaskSelector(state => state.something)
 *    const tasks = useMemoizedTasks()
 *    const debounced = useDebouncedValue(value, 300)
 *
 * 4. Handle events:
 *    useTaskEventListener(['taskAdded'], (event) => {
 *      console.log('Task added:', event.data)
 *    })
 *
 * 5. Get derived data:
 *    const stats = useTaskStatistics()
 *    const grouped = useGroupedTasks('priority')
 *
 * ============================================================================
 */

export const HOOKS_REFERENCE = true
