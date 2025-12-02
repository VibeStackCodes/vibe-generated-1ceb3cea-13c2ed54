/**
 * ============================================================================
 * COMPREHENSIVE STATE MANAGEMENT GUIDE
 * ============================================================================
 *
 * This guide documents the complete client-side state management system
 * for QuietTask, built using React hooks (useState, useContext).
 *
 * Architecture Overview:
 * ├── TaskContext (Context API)
 * ├── TaskProvider (Provider Component)
 * ├── Custom Hooks (useTask, useTasks, etc.)
 * ├── Type System (TypeScript interfaces and utilities)
 * ├── Storage Layer (localStorage persistence)
 * └── Utility Functions (helpers and transformations)
 *
 * ============================================================================
 */

/**
 * PART 1: CORE CONCEPTS
 * ============================================================================
 *
 * The state management system is built on three core pillars:
 *
 * 1. React Context API
 *    - Creates a centralized store for task data
 *    - Avoids prop drilling by providing direct access to state
 *    - Used via TaskContext and TaskProvider
 *
 * 2. React Hooks
 *    - useState: Manages tasks, lists, filters, and sort state
 *    - useContext: Accesses the task context in components
 *    - useCallback: Memoizes action functions for performance
 *    - useMemo: Optimizes derived state calculations
 *    - useEffect: Handles localStorage persistence and initialization
 *
 * 3. Local-First Architecture
 *    - All data persists to localStorage immediately
 *    - State is hydrated from storage on app startup
 *    - Provides offline-first experience as per PRD
 *
 * ============================================================================
 */

/**
 * PART 2: ARCHITECTURE DIAGRAM
 * ============================================================================
 *
 * TaskState Flow:
 *
 *     React Components
 *            |
 *            | (useTask hook)
 *            v
 *     TaskContext (creates reference)
 *            |
 *            v
 *     TaskProvider (manages state)
 *            |
 *            | (useState hooks)
 *            v
 *     Local State (tasks[], lists[], filter, sort)
 *            |
 *            | (useEffect with debounce)
 *            v
 *     localStorage (persistent storage)
 *
 * ============================================================================
 */

/**
 * PART 3: STATE STRUCTURE
 * ============================================================================
 *
 * The TaskState interface defines the complete state shape:
 *
 *   interface TaskState {
 *     tasks: Task[]           // Array of all tasks
 *     lists: TaskList[]       // Array of all lists/projects
 *     filter: TaskFilter      // Current filter settings
 *     sort: TaskSort          // Current sort settings
 *   }
 *
 * Task Structure:
 *   interface Task {
 *     id: string              // Unique identifier
 *     title: string           // Task title
 *     description?: string    // Optional description
 *     completed: boolean      // Completion status
 *     priority: TaskPriority  // 'low' | 'medium' | 'high'
 *     dueDate?: Date          // Optional due date
 *     createdAt: Date         // Creation timestamp
 *     updatedAt: Date         // Last update timestamp
 *     listId: string          // Parent list ID
 *     tags: string[]          // Custom tags/labels
 *     recurrence?: RecurrenceType  // Optional recurrence
 *     parentTaskId?: string   // Optional parent task (for subtasks)
 *   }
 *
 * TaskList Structure:
 *   interface TaskList {
 *     id: string              // Unique identifier
 *     title: string           // List name
 *     description?: string    // Optional description
 *     color?: string          // Optional color code
 *     createdAt: Date         // Creation timestamp
 *     updatedAt: Date         // Last update timestamp
 *     taskCount: number       // Number of tasks in list
 *     order: number           // Display order
 *   }
 *
 * ============================================================================
 */

/**
 * PART 4: CORE HOOKS - BASIC USAGE
 * ============================================================================
 *
 * 1. useTask()
 *    Purpose: Access complete task context (state + actions)
 *    Usage:
 *      const { state, actions, isLoading } = useTask()
 *
 *    Returns:
 *      - state: Current task state
 *      - actions: All available actions
 *      - isLoading: Whether state is being initialized
 *
 * 2. useTasks()
 *    Purpose: Access tasks array directly
 *    Usage:
 *      const tasks = useTasks()
 *
 *    Returns:
 *      Task[] - All tasks
 *
 * 3. useTaskLists()
 *    Purpose: Access task lists array
 *    Usage:
 *      const lists = useTaskLists()
 *
 *    Returns:
 *      TaskList[] - All lists
 *
 * 4. useTaskActions()
 *    Purpose: Access all action functions
 *    Usage:
 *      const { addTask, updateTask, deleteTask } = useTaskActions()
 *
 *    Available actions:
 *      - addTask(taskData): Task
 *      - updateTask(id, updates): void
 *      - deleteTask(id): void
 *      - toggleTaskCompletion(id): void
 *      - addList(listData): TaskList
 *      - updateList(id, updates): void
 *      - deleteList(id): void
 *      - setFilter(filter): void
 *      - setSort(sort): void
 *      - getTasksByList(listId): Task[]
 *      - getFilteredAndSortedTasks(): Task[]
 *
 * 5. useTaskLoading()
 *    Purpose: Check if state is loading from storage
 *    Usage:
 *      const isLoading = useTaskLoading()
 *
 *    Useful for showing loading UI during initialization
 *
 * 6. useFilteredTasks()
 *    Purpose: Get filtered and sorted tasks
 *    Usage:
 *      const filteredTasks = useFilteredTasks()
 *
 *    Returns:
 *      Task[] - Filtered and sorted tasks based on current filter/sort
 *
 * ============================================================================
 */

/**
 * PART 5: ADVANCED HOOKS - COMPLEX OPERATIONS
 * ============================================================================
 *
 * 1. useTaskStatistics()
 *    Purpose: Calculate task statistics
 *    Returns:
 *      {
 *        total: number
 *        completed: number
 *        pending: number
 *        completionPercentage: number
 *        byPriority: { high, medium, low }
 *        byList: Record<listId, count>
 *        overdue: number
 *        dueToday: number
 *        dueSoon: number
 *      }
 *
 * 2. useGroupedTasks(groupBy)
 *    Purpose: Group tasks by field
 *    Parameters:
 *      - groupBy: 'listId' | 'priority' | 'completed' | 'dueDate'
 *    Returns:
 *      Record<key, Task[]> - Tasks grouped by specified field
 *
 * 3. useDerivedTaskState()
 *    Purpose: Get computed/derived state
 *    Returns:
 *      {
 *        activeTasks: Task[]
 *        completedTasks: Task[]
 *        overdueTasks: Task[]
 *        tasksByPriority: Record<priority, Task[]>
 *        tasksByList: Record<listId, Task[]>
 *        statistics: TaskStatistics
 *      }
 *
 * 4. useTaskSearch(searchTerm)
 *    Purpose: Search tasks by title or description
 *    Parameters:
 *      - searchTerm: string - Search query
 *    Returns:
 *      Task[] - Matching tasks
 *
 * 5. useTasksByTag(tag)
 *    Purpose: Get all tasks with specific tag
 *    Parameters:
 *      - tag: string - Tag name
 *    Returns:
 *      Task[] - Tasks with tag
 *
 * 6. useTasksByDateRange(from, to)
 *    Purpose: Get tasks within date range
 *    Parameters:
 *      - from: Date
 *      - to: Date
 *    Returns:
 *      Task[] - Tasks with due dates in range
 *
 * 7. useCompletionTrend()
 *    Purpose: Calculate completion trends
 *    Returns:
 *      {
 *        last7Days: number
 *        last30Days: number
 *        last90Days: number
 *      }
 *
 * 8. useTaskValidation()
 *    Purpose: Validate task/list data
 *    Returns:
 *      {
 *        validateTask(task): ValidationResult
 *        validateList(list): ValidationResult
 *      }
 *
 * ============================================================================
 */

/**
 * PART 6: PRACTICAL EXAMPLES
 * ============================================================================
 *
 * Example 1: Create a Task
 * ─────────────────────────────────────────────────────────────────
 *
 *   function TaskForm() {
 *     const { actions } = useTask()
 *
 *     const handleSubmit = (e) => {
 *       e.preventDefault()
 *       const newTask = actions.addTask({
 *         title: 'My task',
 *         completed: false,
 *         priority: 'medium',
 *         listId: 'list-1',
 *         tags: ['work'],
 *         dueDate: new Date('2024-12-31')
 *       })
 *       console.log('Task created:', newTask)
 *     }
 *     return <form onSubmit={handleSubmit}>...</form>
 *   }
 *
 * Example 2: Display Filtered Tasks
 * ─────────────────────────────────────────────────────────────────
 *
 *   function TaskListView() {
 *     const { actions } = useTask()
 *     const filteredTasks = useFilteredTasks()
 *
 *     // Set filter to show only high priority tasks
 *     useEffect(() => {
 *       actions.setFilter({ priority: 'high' })
 *     }, [])
 *
 *     return (
 *       <ul>
 *         {filteredTasks.map(task => (
 *           <li key={task.id}>{task.title}</li>
 *         ))}
 *       </ul>
 *     )
 *   }
 *
 * Example 3: Task Statistics Dashboard
 * ─────────────────────────────────────────────────────────────────
 *
 *   function Dashboard() {
 *     const stats = useTaskStatistics()
 *
 *     return (
 *       <div>
 *         <p>Total: {stats.total}</p>
 *         <p>Completed: {stats.completed}</p>
 *         <p>Completion: {stats.completionPercentage.toFixed(1)}%</p>
 *         <p>Overdue: {stats.overdue}</p>
 *       </div>
 *     )
 *   }
 *
 * Example 4: Search Functionality
 * ─────────────────────────────────────────────────────────────────
 *
 *   function SearchTasks() {
 *     const [query, setQuery] = useState('')
 *     const results = useTaskSearch(query)
 *
 *     return (
 *       <div>
 *         <input
 *           value={query}
 *           onChange={(e) => setQuery(e.target.value)}
 *           placeholder="Search tasks..."
 *         />
 *         <ul>
 *           {results.map(task => (
 *             <li key={task.id}>{task.title}</li>
 *           ))}
 *         </ul>
 *       </div>
 *     )
 *   }
 *
 * Example 5: Group Tasks by Priority
 * ─────────────────────────────────────────────────────────────────
 *
 *   function TasksByPriority() {
 *     const grouped = useGroupedTasks('priority')
 *
 *     return (
 *       <div>
 *         {Object.entries(grouped).map(([priority, tasks]) => (
 *           <div key={priority}>
 *             <h3>{priority}</h3>
 *             <ul>
 *               {tasks.map(task => (
 *                 <li key={task.id}>{task.title}</li>
 *               ))}
 *             </ul>
 *           </div>
 *         ))}
 *       </div>
 *     )
 *   }
 *
 * ============================================================================
 */

/**
 * PART 7: PERFORMANCE OPTIMIZATION
 * ============================================================================
 *
 * The state management system implements several performance optimizations:
 *
 * 1. Memoization with useMemo
 *    - State objects are memoized to prevent unnecessary re-renders
 *    - Derived state (filtered tasks, statistics) is memoized
 *    - Calculations only re-run when dependencies change
 *
 * 2. useCallback Optimization
 *    - All action functions are memoized with useCallback
 *    - Prevents child component re-renders
 *    - Stable function references across renders
 *
 * 3. localStorage Debouncing
 *    - Saves to localStorage with 500ms debounce
 *    - Prevents excessive write operations
 *    - Improves overall app performance
 *
 * 4. Lazy State Initialization
 *    - State loaded from localStorage only on mount
 *    - Subsequent state updates use in-memory storage
 *    - Reduces initial load time
 *
 * 5. Selective Hook Usage
 *    - Use specific hooks (useTasks) instead of full context
 *    - Only re-render when specifically needed data changes
 *    - Example: useTasks only causes re-render when tasks change
 *
 * Best Practices for Performance:
 * ────────────────────────────────────────────────────────
 *
 * ✓ Use specific hooks instead of useTask when possible
 *   Bad:  const { state } = useTask()  // Causes re-render on any state change
 *   Good: const tasks = useTasks()     // Only re-renders if tasks change
 *
 * ✓ Memoize expensive computations
 *   import { useMemo } from 'react'
 *   const expensiveValue = useMemo(() => complexCalculation(), [deps])
 *
 * ✓ Use useCallback for event handlers
 *   const handler = useCallback((e) => { ... }, [deps])
 *
 * ✓ Avoid creating objects in render
 *   Bad:  setFilter({ completed: true })  // Creates new object each render
 *   Good: const filter = useMemo(...)     // Memoize filter object
 *
 * ============================================================================
 */

/**
 * PART 8: STORAGE PERSISTENCE
 * ============================================================================
 *
 * The localStorage integration provides local-first storage:
 *
 * Key: 'quiettask_state'
 *
 * Stored Data:
 * {
 *   tasks: Task[],
 *   lists: TaskList[]
 * }
 *
 * Storage Functions:
 * ────────────────────────────────────────────────────────
 *
 * loadTaskState(): Omit<TaskState, 'filter' | 'sort'>
 *   - Loads state from localStorage
 *   - Returns empty state if no data exists
 *   - Automatically converts date strings back to Date objects
 *
 * saveTaskState(state): void
 *   - Saves state to localStorage
 *   - Automatically serializes dates to ISO strings
 *   - Called with 500ms debounce
 *
 * clearTaskState(): void
 *   - Removes all data from localStorage
 *   - Used for reset or logout
 *
 * exportTasksAsJSON(state): string
 *   - Exports state as downloadable JSON
 *   - Includes version and export date
 *   - Useful for backups
 *
 * importTasksFromJSON(jsonString): Omit<TaskState, 'filter' | 'sort'>
 *   - Imports state from JSON
 *   - Handles both versioned and unversioned imports
 *   - Useful for restoring from backups
 *
 * getStorageStats(): { tasksCount, listsCount, storageSize }
 *   - Returns storage statistics
 *   - Useful for monitoring storage usage
 *
 * ============================================================================
 */

/**
 * PART 9: ERROR HANDLING
 * ============================================================================
 *
 * Error Handling Strategy:
 *
 * 1. Context Not Found
 *    - All hooks throw error if used outside TaskProvider
 *    - Prevents silently failing undefined references
 *    - Clear error message guides developers
 *
 * 2. localStorage Errors
 *    - All storage operations wrapped in try-catch
 *    - Errors logged but don't crash app
 *    - Gracefully falls back to empty state
 *
 * 3. Invalid Data
 *    - Use useTaskValidation hook to validate before mutation
 *    - Type safety prevents most invalid data
 *    - ValidationResult provides detailed error messages
 *
 * Example Error Handling:
 * ────────────────────────────────────────────────────────
 *
 *   function SafeTaskCreation() {
 *     const { actions } = useTask()
 *     const { validateTask } = useTaskValidation()
 *
 *     const handleCreate = (taskData) => {
 *       const validation = validateTask(taskData)
 *       if (!validation.valid) {
 *         console.error('Validation failed:', validation.errors)
 *         return
 *       }
 *       actions.addTask(taskData)
 *     }
 *
 *     return <form onSubmit={handleCreate}>...</form>
 *   }
 *
 * ============================================================================
 */

/**
 * PART 10: TESTING STATE MANAGEMENT
 * ============================================================================
 *
 * Testing Strategy:
 *
 * 1. Unit Tests for Utility Functions
 *    - Test filter/sort logic
 *    - Test state calculations
 *    - Test storage operations
 *
 * 2. Component Tests with Mock Provider
 *    - Wrap components in TaskProvider during tests
 *    - Mock initial state using useState in tests
 *    - Verify state changes after actions
 *
 * 3. Integration Tests
 *    - Test full flow: create → read → update → delete
 *    - Verify localStorage persistence
 *    - Test filter/sort combinations
 *
 * Example Test Setup:
 * ────────────────────────────────────────────────────────
 *
 *   import { render, screen, fireEvent } from '@testing-library/react'
 *   import { TaskProvider } from '@/context/TaskContext'
 *   import { YourComponent } from './YourComponent'
 *
 *   test('creates task', () => {
 *     render(
 *       <TaskProvider>
 *         <YourComponent />
 *       </TaskProvider>
 *     )
 *
 *     const input = screen.getByPlaceholderText('Task title')
 *     fireEvent.change(input, { target: { value: 'New Task' } })
 *     fireEvent.click(screen.getByText('Create'))
 *
 *     expect(screen.getByText('New Task')).toBeInTheDocument()
 *   })
 *
 * ============================================================================
 */

/**
 * PART 11: FUTURE ENHANCEMENTS
 * ============================================================================
 *
 * Potential improvements to the state management system:
 *
 * 1. Undo/Redo Stack
 *    - Maintain history of state changes
 *    - Implement useHistory hook
 *    - Enable time-travel debugging
 *
 * 2. State Middleware
 *    - Track state changes for analytics
 *    - Log important mutations
 *    - Trigger side effects on state changes
 *
 * 3. Async Operations
 *    - Support for background sync
 *    - Handle cloud API calls
 *    - Implement optimistic updates
 *
 * 4. State Persistence Options
 *    - IndexedDB for larger data sets
 *    - Session storage for temporary data
 *    - Cloud sync with conflict resolution
 *
 * 5. Dev Tools Integration
 *    - Redux DevTools support
 *    - Time-travel debugging
 *    - Action history inspection
 *
 * ============================================================================
 */

/**
 * PART 12: QUICK REFERENCE
 * ============================================================================
 *
 * Common Tasks Quick Reference:
 *
 * Add a task:
 *   const { addTask } = useTaskActions()
 *   addTask({ title: '...', priority: 'high', listId: '...', ... })
 *
 * Update a task:
 *   const { updateTask } = useTaskActions()
 *   updateTask(taskId, { title: 'New title', completed: true })
 *
 * Delete a task:
 *   const { deleteTask } = useTaskActions()
 *   deleteTask(taskId)
 *
 * Get all tasks:
 *   const tasks = useTasks()
 *
 * Get filtered tasks:
 *   const filtered = useFilteredTasks()
 *
 * Apply filter:
 *   const { setFilter } = useTaskActions()
 *   setFilter({ priority: 'high', completed: false })
 *
 * Apply sort:
 *   const { setSort } = useTaskActions()
 *   setSort({ sortBy: 'dueDate', order: 'asc' })
 *
 * Get statistics:
 *   const stats = useTaskStatistics()
 *
 * Search tasks:
 *   const results = useTaskSearch('keyword')
 *
 * Get grouped tasks:
 *   const grouped = useGroupedTasks('priority')
 *
 * ============================================================================
 */

export const STATE_MANAGEMENT_DOCUMENTATION = {
  version: '1.0.0',
  lastUpdated: '2024',
  sections: [
    'Core Concepts',
    'Architecture Diagram',
    'State Structure',
    'Core Hooks',
    'Advanced Hooks',
    'Practical Examples',
    'Performance Optimization',
    'Storage Persistence',
    'Error Handling',
    'Testing Strategy',
    'Future Enhancements',
    'Quick Reference',
  ],
}
