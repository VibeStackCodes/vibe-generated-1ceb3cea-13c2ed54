/**
 * QUICK REFERENCE: State Management API
 * =====================================
 *
 * This file provides a quick reference for all imports and usage patterns
 * for the QuietTask state management system.
 *
 *
 * IMPORTS:
 * ========
 *
 * Types:
 * ──────
 * import type { Task, TaskList, TaskFilter, TaskSort, TaskState } from '@/types/task'
 * import type { TaskPriority, RecurrenceType } from '@/types/task'
 *
 * Context:
 * ────────
 * import { TaskProvider } from '@/context/TaskContext'
 *
 * Hooks:
 * ──────
 * import {
 *   useTask,
 *   useTasks,
 *   useTaskLists,
 *   useTaskFilter,
 *   useTaskSort,
 *   useTaskActions,
 *   useTasksByList,
 *   useFilteredTasks,
 * } from '@/hooks/useTask'
 *
 * Utilities:
 * ──────────
 * import {
 *   loadTaskState,
 *   saveTaskState,
 *   clearTaskState,
 *   exportTasksAsJSON,
 *   importTasksFromJSON,
 *   getStorageStats,
 * } from '@/utils/taskStorage'
 *
 * import {
 *   groupTasksByList,
 *   getIncompleteTasks,
 *   getCompletedTasks,
 *   getOverdueTasks,
 *   getTasksDueToday,
 *   getTasksDueThisWeek,
 *   getHighPriorityTasks,
 *   getTasksByTag,
 *   getAllTags,
 *   getSubtasks,
 *   calculateTaskStats,
 *   searchTasks,
 *   formatDueDate,
 *   isTaskOverdue,
 *   isTaskDueSoon,
 * } from '@/utils/taskOperations'
 *
 *
 * SETUP:
 * ======
 *
 * 1. Wrap your app with TaskProvider:
 *    ────────────────────────────────
 *    import { TaskProvider } from '@/context/TaskContext'
 *
 *    function App() {
 *      return (
 *        <TaskProvider>
 *          {/* your app */}
 *        </TaskProvider>
 *      )
 *    }
 *
 *
 * COMMON PATTERNS:
 * ================
 *
 * 1. CREATE A TASK:
 *    ───────────────
 *    const { addTask } = useTaskActions()
 *
 *    addTask({
 *      title: 'Buy groceries',
 *      description: 'Milk, eggs, bread',
 *      priority: 'high',
 *      listId: 'my-list-id',
 *      completed: false,
 *      tags: ['shopping']
 *    })
 *
 *
 * 2. GET ALL TASKS:
 *    ───────────────
 *    const tasks = useTasks()
 *
 *    // Already filtered and sorted
 *    const filteredTasks = useFilteredTasks()\n *
 *\n * 3. UPDATE A TASK:\n *    ──────────────────\n *    const { updateTask } = useTaskActions()\n *\n *    updateTask('task-id', {\n *      title: 'New title',\n *      priority: 'medium',\n *      completed: true\n *    })\n *\n *\n * 4. DELETE A TASK:\n *    ───────────────\n *    const { deleteTask } = useTaskActions()\n *\n *    deleteTask('task-id')\n *\n *\n * 5. FILTER TASKS:\n *    ──────────────\n *    const { filter, setFilter } = useTaskFilter()\n *\n *    setFilter({\n *      priority: 'high',\n *      completed: false,\n *      tags: ['urgent']\n *    })\n *\n *\n * 6. SORT TASKS:\n *    ────────────\n *    const { sort, setSort } = useTaskSort()\n *\n *    setSort({\n *      sortBy: 'dueDate',\n *      order: 'asc'\n *    })\n *\n *\n * 7. GET TASKS FOR A LIST:\n *    ──────────────────────\n *    const tasks = useTasksByList('list-id')\n *\n *\n * 8. MANAGE LISTS:\n *    ──────────────\n *    const { addList, updateList, deleteList } = useTaskActions()\n *    const lists = useTaskLists()\n *\n *    // Create list\n *    addList({\n *      title: 'Work',\n *      order: 0,\n *      taskCount: 0\n *    })\n *\n *    // Update list\n *    updateList('list-id', { title: 'Work Projects' })\n *\n *    // Delete list\n *    deleteList('list-id')\n *\n *\n * 9. SEARCH TASKS:\n *    ──────────────\n *    const tasks = useTasks()\n *    const results = searchTasks(tasks, 'buy')\n *\n *\n * 10. GET OVERDUE TASKS:\n *     ──────────────────\n *     const tasks = useTasks()\n *     const overdue = getOverdueTasks(tasks)\n *\n *\n * 11. CALCULATE STATS:\n *     ─────────────────\n *     const { state } = useTask()\n *     const stats = calculateTaskStats(state.tasks, state.lists)\n *\n *\n * 12. PERSIST TO STORAGE:\n *     ────────────────────\n *     const { state } = useTask()\n *\n *     useEffect(() => {\n *       saveTaskState({\n *         tasks: state.tasks,\n *         lists: state.lists\n *       })\n *     }, [state.tasks, state.lists])\n *\n *\n * HOOK COMPARISON:\n * ================\n *\n * useTask()\n *   ├─ Returns: { state, actions }\n *   ├─ When to use: Need complete control\n *   └─ Re-renders on: Any state change\n *\n * useTasks()\n *   ├─ Returns: Task[]\n *   ├─ When to use: Only need tasks\n *   └─ Re-renders on: Tasks array change\n *\n * useTaskLists()\n *   ├─ Returns: TaskList[]\n *   ├─ When to use: Only need lists\n *   └─ Re-renders on: Lists array change\n *\n * useTaskFilter()\n *   ├─ Returns: { filter, setFilter }\n *   ├─ When to use: Managing filters\n *   └─ Re-renders on: Filter change\n *\n * useTaskSort()\n *   ├─ Returns: { sort, setSort }\n *   ├─ When to use: Managing sort\n *   └─ Re-renders on: Sort change\n *\n * useTaskActions()\n *   ├─ Returns: actions object\n *   ├─ When to use: Only need actions\n *   └─ Re-renders on: Never (stable)\n *\n * useTasksByList(listId)\n *   ├─ Returns: Task[]\n *   ├─ When to use: List-specific tasks\n *   └─ Re-renders on: Tasks for that list change\n *\n * useFilteredTasks()\n *   ├─ Returns: Task[]\n *   ├─ When to use: Display filtered tasks\n *   └─ Re-renders on: Filter/sort or tasks change\n *\n *\n * STATE SHAPE:\n * =============\n *\n * {
 *   tasks: [\n *     {
 *       id: 'string',\n *       title: 'string',\n *       description: 'string?',\n *       completed: boolean,\n *       priority: 'low' | 'medium' | 'high',\n *       dueDate: Date?,\n *       createdAt: Date,\n *       updatedAt: Date,\n *       listId: 'string',\n *       tags: ['string'],\n *       recurrence: 'none' | 'daily' | 'weekly' | 'monthly' | 'custom'?,\n *       parentTaskId: 'string?'\n *     }\n *   ],\n *   lists: [\n *     {\n *       id: 'string',\n *       title: 'string',\n *       description: 'string?',\n *       color: 'string?',\n *       createdAt: Date,\n *       updatedAt: Date,\n *       taskCount: number,\n *       order: number\n *     }\n *   ],\n *   filter: {\n *     completed?: boolean,\n *     priority?: 'low' | 'medium' | 'high',\n *     listId?: 'string',\n *     tags?: ['string'],\n *     dueDateFrom?: Date,\n *     dueDateTo?: Date\n *   },\n *   sort: {\n *     sortBy: 'dueDate' | 'priority' | 'createdAt' | 'title',\n *     order: 'asc' | 'desc'\n *   }\n * }\n *\n *\n * ACTION FUNCTIONS:\n * =================\n *\n * addTask(taskData)\n *   Input:  Omit<Task, 'id' | 'createdAt' | 'updatedAt'>\n *   Output: Task\n *\n * updateTask(id, updates)\n *   Input:  string, Partial<Task>\n *   Output: void\n *\n * deleteTask(id)\n *   Input:  string\n *   Output: void\n *\n * toggleTaskCompletion(id)\n *   Input:  string\n *   Output: void\n *\n * addList(listData)\n *   Input:  Omit<TaskList, 'id' | 'createdAt' | 'updatedAt'>\n *   Output: TaskList\n *\n * updateList(id, updates)\n *   Input:  string, Partial<TaskList>\n *   Output: void\n *\n * deleteList(id)\n *   Input:  string\n *   Output: void\n *\n * setFilter(filter)\n *   Input:  TaskFilter\n *   Output: void\n *\n * setSort(sort)\n *   Input:  TaskSort\n *   Output: void\n *\n * getTasksByList(listId)\n *   Input:  string\n *   Output: Task[]\n *\n * getFilteredAndSortedTasks()\n *   Input:  void\n *   Output: Task[]\n *\n *\n * ERROR HANDLING:\n * ================\n *\n * Hooks must be used within TaskProvider:\n * ────────────────────────────────────────\n * function MyComponent() {\n *   // ✗ This will throw an error\n *   const { state } = useTask()\n * }\n *\n * export default MyComponent // Not wrapped in TaskProvider\n *\n * ✓ Correct:\n * import { TaskProvider } from '@/context/TaskContext'\n *\n * function App() {\n *   return (\n *     <TaskProvider>\n *       <MyComponent />\n *     </TaskProvider>\n *   )\n * }\n *\n *\n * PERFORMANCE TIPS:\n * =================\n *\n * 1. Use specific hooks:\n *    ✓ const tasks = useTasks()         // Good\n *    ✗ const { state } = useTask()      // Re-renders on any state change\n *\n * 2. Memoize computed values:\n *    const stats = useMemo(\n *      () => calculateTaskStats(tasks, lists),\n *      [tasks, lists]\n *    )\n *\n * 3. Use useCallback for event handlers:\n *    const handleComplete = useCallback((id) => {\n *      toggleTaskCompletion(id)\n *    }, [toggleTaskCompletion])\n *\n * 4. Avoid inline objects in filters:\n *    ✗ setFilter({ priority: 'high' })  // New object each time\n *    ✓ const filter = { priority: 'high' }  // Reuse same object\n *       setFilter(filter)\n *\n * 5. Split state subscriptions:\n *    ✓ const tasks = useTasks()\n *    ✓ const lists = useTaskLists()\n *    ✗ const { state } = useTask()      // Don't do this\n *\n */\n\nexport {}\n