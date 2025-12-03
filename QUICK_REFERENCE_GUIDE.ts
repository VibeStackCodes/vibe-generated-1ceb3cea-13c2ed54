/**
 * QUICK REFERENCE: CLIENT-SIDE STATE MANAGEMENT
 * ==============================================
 *
 * Fast lookup guide for the most common patterns and APIs
 */

// ============================================================================
// IMPORT STATEMENTS
// ============================================================================

export const COMMON_IMPORTS = {
  // Basic hooks
  basic: `
    import {
      useTask,
      useTasks,
      useTaskLists,
      useTaskActions,
      useFilteredTasks,
      useTaskFilter,
      useTaskSort,
      useTaskLoading,
    } from '@/hooks/useTask'
  `,

  // Advanced hooks
  advanced: `
    import {
      useTaskStatistics,
      useGroupedTasks,
      useTaskSearch,
      useBulkTaskOperations,
      useCompletionTrend,
      useTaskUndoRedoState,
    } from '@/hooks'
  `,

  // Storage
  storage: `
    import {
      loadTaskState,
      saveTaskState,
      exportTasksAsJSON,
      importTasksFromJSON,
      getStorageStats,
    } from '@/utils/taskStorage'
  `,

  // Types
  types: `
    import type {
      Task,
      TaskList,
      TaskFilter,
      TaskSort,
      TaskPriority,
    } from '@/types/task'
  `,
}

// ============================================================================
// API QUICK REFERENCE
// ============================================================================

export const API_REFERENCE = {
  // TASKS
  'addTask()': 'Create new task, returns Task with id set',
  'updateTask(id, updates)': 'Update existing task fields',
  'deleteTask(id)': 'Delete task by id',
  'toggleTaskCompletion(id)': 'Toggle completed status',

  // LISTS
  'addList(listData)': 'Create new list, returns TaskList',
  'updateList(id, updates)': 'Update list properties',
  'deleteList(id)': 'Delete list and all its tasks',

  // FILTERING & SORTING
  'setFilter(filter)': 'Apply filter to tasks',
  'setSort(sort)': 'Set sort order for tasks',
  'getFilteredAndSortedTasks()': 'Get filtered/sorted tasks',

  // QUERYING
  'useTasks()': 'Get all tasks',
  'useTaskLists()': 'Get all lists',
  'useTasksByList(listId)': 'Get tasks in specific list',
  'useFilteredTasks()': 'Get filtered and sorted tasks',

  // STATE
  'useTask()': 'Get state and actions',
  'useTaskLoading()': 'Check if loading from storage',

  // ADVANCED
  'useTaskStatistics()': 'Get task statistics',
  'useGroupedTasks(groupBy)': 'Group tasks by field',
  'useTaskSearch(keyword)': 'Search for tasks',
  'useBulkTaskOperations()': 'Batch operations',
}

// ============================================================================
// FILTER EXAMPLES
// ============================================================================

export const FILTER_PATTERNS = {
  // By completion
  incomplete: { completed: false },
  complete: { completed: true },

  // By priority
  highPriority: { priority: 'high' },
  mediumPriority: { priority: 'medium' },
  lowPriority: { priority: 'low' },

  // By list
  inList: (listId: string) => ({ listId }),

  // By tags
  withTag: (tag: string) => ({ tags: [tag] }),

  // Combined
  urgent: {
    completed: false,
    priority: 'high',
  },
}

// ============================================================================
// SORT PATTERNS
// ============================================================================

export const SORT_PATTERNS = {
  byDueDateAsc: { sortBy: 'dueDate' as const, order: 'asc' as const },
  byDueDateDesc: { sortBy: 'dueDate' as const, order: 'desc' as const },
  byPriorityHigh: { sortBy: 'priority' as const, order: 'asc' as const },
  byCreatedNewest: { sortBy: 'createdAt' as const, order: 'desc' as const },
  byCreatedOldest: { sortBy: 'createdAt' as const, order: 'asc' as const },
  byTitleA_Z: { sortBy: 'title' as const, order: 'asc' as const },
  byTitleZ_A: { sortBy: 'title' as const, order: 'desc' as const },
}

// ============================================================================
// HOOK USAGE PATTERNS
// ============================================================================

export const HOOK_PATTERNS = {
  // Get everything
  fullContext: `
    const { state, actions, isLoading } = useTask()
  `,

  // Get specific state
  tasksOnly: `
    const tasks = useTasks()
  `,

  // Get and use actions
  withActions: `
    const { addTask, updateTask, deleteTask } = useTaskActions()
  `,

  // Get filtered results
  filtered: `
    const tasks = useFilteredTasks()
    tasks.forEach(task => console.log(task.title))
  `,

  // Get statistics
  stats: `
    const { total, completed, byPriority } = useTaskStatistics()
  `,

  // Group tasks
  grouped: `
    const byPriority = useGroupedTasks('priority')
    const high = byPriority.high
  `,

  // Search
  search: `
    const results = useTaskSearch('buy groceries')
  `,

  // Check loading
  loading: `
    const isLoading = useTaskLoading()
    if (isLoading) return <Spinner />
  `,
}

// ============================================================================
// COMMON OPERATIONS
// ============================================================================

export const COMMON_OPERATIONS = {
  // Create task
  createTask: `
    const { addTask } = useTaskActions()
    const newTask = addTask({
      title: 'Buy milk',
      priority: 'medium',
      listId: 'inbox',
      completed: false,
    })
  `,

  // Complete task
  completeTask: `
    const { toggleTaskCompletion } = useTaskActions()
    toggleTaskCompletion(taskId)
  `,

  // Filter incomplete high-priority
  filterUrgent: `
    const { setFilter } = useTaskActions()
    setFilter({
      completed: false,
      priority: 'high',
    })
  `,

  // Sort by due date
  sortByDate: `
    const { setSort } = useTaskActions()
    setSort({
      sortBy: 'dueDate',
      order: 'asc',
    })
  `,

  // Get filtered tasks
  getFiltered: `
    const tasks = useFilteredTasks()
    tasks.forEach(t => console.log(t.title))
  `,

  // Bulk complete
  completeAll: `
    const { completeAll } = useBulkTaskOperations()
    completeAll()
  `,

  // Export data
  exportData: `
    import { exportTasksAsJSON } from '@/utils/taskStorage'
    const json = exportTasksAsJSON({ tasks, lists })
  `,
}

// ============================================================================
// TASK OBJECT STRUCTURE
// ============================================================================

export const TASK_EXAMPLE = {
  id: 'task-123',
  title: 'Buy groceries',
  description: 'Milk, eggs, bread',
  completed: false,
  priority: 'medium' as const,
  dueDate: new Date('2024-12-25'),
  createdAt: new Date(),
  updatedAt: new Date(),
  listId: 'inbox-123',
  tags: ['shopping', 'groceries'],
  recurrence: 'none' as const,
  parentTaskId: undefined,
}

// ============================================================================
// STATISTICS OBJECT STRUCTURE
// ============================================================================

export const STATS_EXAMPLE = {
  total: 42,
  completed: 15,
  pending: 27,
  completionPercentage: 35.7,
  byPriority: {
    high: 10,
    medium: 20,
    low: 12,
  },
  overdue: 3,
  dueToday: 2,
  dueThisWeek: 8,
  completedThisWeek: 5,
}

// ============================================================================
// GROUPED TASKS STRUCTURE
// ============================================================================

export const GROUPED_EXAMPLE = {
  high: [/* tasks with priority high */],
  medium: [/* tasks with priority medium */],
  low: [/* tasks with priority low */],
}

// ============================================================================
// STORAGE STATS STRUCTURE
// ============================================================================

export const STORAGE_STATS_EXAMPLE = {
  tasksCount: 42,
  listsCount: 5,
  storageSize: 12345, // bytes
  backupSize: 12345, // bytes
  totalSize: 24690, // bytes
}

// ============================================================================
// ERROR HANDLING PATTERNS
// ============================================================================

export const ERROR_PATTERNS = {
  // Check if hook is within provider
  safeUse: `
    try {
      const { state, actions } = useTask()
    } catch (e) {
      console.error('useTask must be used within TaskProvider')
    }
  `,

  // Handle storage errors
  storageError: `
    try {
      const data = loadTaskState()
    } catch (error) {
      console.error('Failed to load state:', error)
      // Fallback to empty state
    }
  `,

  // Check loading
  withLoading: `
    const isLoading = useTaskLoading()
    if (isLoading) {
      return <div>Loading tasks...</div>
    }
  `,
}

// ============================================================================
// PERFORMANCE TIPS
// ============================================================================

export const PERFORMANCE_TIPS = [
  'Use specific hooks (useTasks) instead of useTask when possible',
  'Memoize expensive computations with useMemo',
  'Use useCallback for event handlers in components',
  'Filter and sort are already memoized in hooks',
  'localStorage writes are debounced (500ms)',
  'Use useFilteredTasks instead of manual filtering',
  'Bulk operations are more efficient than individual updates',
  'Export/import for moving large datasets',
]

// ============================================================================
// DEBUGGING TIPS
// ============================================================================

export const DEBUGGING_TIPS = [
  'Check browser console for [TaskProvider], [TaskStorage] logs',
  'Check localStorage directly: console.log(localStorage.quiettask_state)',
  'Use useTaskLoading() to verify initialization',
  'Check getStorageStats() for storage usage',
  'Verify TaskProvider wraps your component',
  'Use TypeScript strict mode for type safety',
  'Enable React Strict Mode for development',
]

// ============================================================================
// TROUBLESHOOTING
// ============================================================================

export const TROUBLESHOOTING = {
  'Hook throws error about TaskProvider': 'Wrap component with TaskProvider in App.tsx',
  'Data not persisting': 'Check localStorage is enabled and has quota',
  'Tasks not filtering': 'Verify filter is set correctly and use useFilteredTasks()',
  'Slow performance': 'Check for unnecessary re-renders, use DevTools profiler',
  'localStorage quota exceeded': 'Old completed tasks are auto-pruned, data is preserved',
  'Data corrupted': 'Automatic backup recovery kicks in on corruption',
}

// ============================================================================
// BEST PRACTICES
// ============================================================================

export const BEST_PRACTICES = [
  'Always use typed hooks instead of useContext directly',
  'Check isLoading state before rendering task data',
  'Use setFilter and setSort for UI changes',
  'Validate input before calling action functions',
  'Use bulk operations for multiple changes',
  'Export data regularly for backup',
  'Test with React Strict Mode enabled',
  'Monitor localStorage quota usage',
  'Use TypeScript strict mode',
  'Provide error boundaries around components',
]

// ============================================================================
// FILE LOCATIONS QUICK MAP
// ============================================================================

export const FILE_LOCATIONS = {
  context: 'src/context/TaskContext.tsx',
  basicHooks: 'src/hooks/useTask.ts',
  advancedHooks: 'src/hooks/useTaskAdvanced.ts',
  types: 'src/types/task.ts',
  storage: 'src/utils/taskStorage.ts',
  components: 'src/components/',
}

export const QUICK_REFERENCE_READY = true
