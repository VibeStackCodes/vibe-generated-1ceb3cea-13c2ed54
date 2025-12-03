# localStorage Integration - Quick Reference

## ✅ What's Implemented

- **Automatic Save/Load**: Tasks automatically saved to localStorage on every change
- **App Initialization**: Tasks loaded from storage on app startup
- **Debounce Optimization**: 500ms debounce prevents excessive writes
- **Error Recovery**: Automatic backup and restore on corruption
- **Export/Import**: JSON export/import for backups and sharing
- **Storage Diagnostics**: Monitor usage and available space
- **Full Type Safety**: Complete TypeScript support

## 🚀 Quick Start (Developers)

### Use Case 1: Display Tasks (Most Common)
```typescript
import { useTask } from '@/hooks/useTask'

function TasksComponent() {
  const { state } = useTask()
  // Tasks are already loaded from localStorage!
  return <div>{state.tasks.length} tasks</div>
}
```

### Use Case 2: Add/Update Tasks
```typescript
import { useTask } from '@/hooks/useTask'

function AddTaskForm() {
  const { actions } = useTask()

  const handleAdd = () => {
    actions.addTask({
      title: 'My Task',
      completed: false,
      priority: 'medium',
      listId: 'default',
      tags: [],
    })
    // Automatically persisted to localStorage!
  }

  return <button onClick={handleAdd}>Add Task</button>
}
```

### Use Case 3: Show Loading State
```typescript
import { useTaskLoading } from '@/hooks/useTask'

function App() {
  const isLoading = useTaskLoading()

  if (isLoading) {
    return <p>Loading your tasks...</p>
  }

  return <TasksList />
}
```

### Use Case 4: Export Backup
```typescript
import { useTask } from '@/hooks/useTask'
import { exportTasksAsJSON } from '@/utils/taskStorage'

function BackupButton() {
  const { state } = useTask()

  const handleBackup = () => {
    const json = exportTasksAsJSON({
      tasks: state.tasks,
      lists: state.lists,
    })

    // Download file
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `backup-${Date.now()}.json`
    a.click()
  }

  return <button onClick={handleBackup}>Backup</button>
}
```

## 📊 Storage Statistics

```typescript
import { getStorageStats } from '@/utils/taskStorage'

const stats = getStorageStats()
console.log(`${stats.tasksCount} tasks, ${stats.listsCount} lists`)
console.log(`Using ${(stats.storageSize / 1024).toFixed(2)} KB`)
```

## 🧪 Browser Console Debugging

```javascript
// View all stored tasks
JSON.parse(localStorage.getItem('quiettask_state'))

// Check storage size
new Blob([localStorage.getItem('quiettask_state')]).size + ' bytes'

// Check if available
localStorage.getItem('quiettask_state') ? 'OK' : 'Empty'

// Clear (WARNING: deletes all tasks!)
localStorage.removeItem('quiettask_state')
localStorage.removeItem('quiettask_version')
localStorage.removeItem('quiettask_backup')
```

## 📁 File Structure

```
src/
├── context/
│   └── TaskContext.tsx           # Main state provider
├── hooks/
│   ├── useTask.ts               # Task state hooks
│   ├── useLocalStorage.ts        # Basic localStorage hook
│   ├── useStoragePersistence.ts  # Advanced persistence hook
│   └── index.ts                 # Hook exports
├── utils/
│   ├── taskStorage.ts           # Storage utilities
│   ├── appInitializer.ts        # App initialization
│   └── index.ts                 # Utility exports
└── main.tsx                     # App entry (calls initializeApp)
```

## 🔧 Key Utilities

### Core Storage Functions
```typescript
import {
  loadTaskState,          // Load from localStorage
  saveTaskState,          // Save to localStorage
  clearTaskState,         // Clear all data
  exportTasksAsJSON,      // Export as JSON
  importTasksFromJSON,    // Import from JSON
  getStorageStats,        // Get usage stats
  isLocalStorageAvailable,// Check availability
  getAvailableStorageSpace, // Check available space
  restoreFromBackup,      // Recover from backup
} from '@/utils/taskStorage'
```

### App Initialization
```typescript
import {
  initializeApp,              // Check storage on startup
  logInitializationStatus,    // Log init details
  canSyncToStorage,           // Check if sync available
  getStorageUsageSummary,     // Get usage summary
} from '@/utils/appInitializer'
```

### Persistence Hooks
```typescript
import {
  useStoragePersistence,      // Advanced persistence control
  useStorageDiagnostics,      // Monitor storage
  useLocalStorage,            // Basic persistence
  useLoadLocalStorage,        // Just load from storage
} from '@/hooks/useStoragePersistence'
```

## 🎯 Common Tasks

| Task | Code |
|------|------|
| Get all tasks | `const { state } = useTask()` |
| Get filtered tasks | `const tasks = useFilteredTasks()` |
| Add task | `actions.addTask({...})` |
| Update task | `actions.updateTask(id, {...})` |
| Delete task | `actions.deleteTask(id)` |
| Toggle completion | `actions.toggleTaskCompletion(id)` |
| Check loading | `const loading = useTaskLoading()` |
| Export backup | `exportTasksAsJSON({tasks, lists})` |
| Import backup | `importTasksFromJSON(jsonString)` |
| Get stats | `getStorageStats()` |

## ⚙️ Configuration

### Debounce Timing
Default: 500ms (in `TaskContext.tsx`)
```typescript
// Change debounce time if needed
const timeoutId = setTimeout(() => {
  saveTaskState({ tasks, lists })
}, 500) // Adjust this value
```

### Advanced Persistence Options
```typescript
const persistence = useStoragePersistence(
  tasks,
  lists,
  onLoad,
  {
    autoSync: true,              // Auto-save changes
    debounceMs: 500,            // Delay before saving
    enableDiagnostics: true,    // Log debug info
    maxRetries: 3,              // Retry failed saves
    onSyncError: (err) => {},   // Error callback
    onSyncSuccess: () => {},    // Success callback
  }
)
```

## 🔒 Data Privacy

- All data stored locally in browser
- No cloud sync by default
- User controls all data
- Export/backup for portability
- Clear option removes all data

## 📱 Browser Support

| Browser | localStorage | Max Size |
|---------|---|---|
| Chrome | ✅ | ~10MB |
| Firefox | ✅ | ~10MB |
| Safari | ✅ | ~5MB |
| Edge | ✅ | ~10MB |
| IE | ✅ | ~10MB |

## 🚨 Troubleshooting

### Tasks Not Persisting
1. Check console for errors: `[TaskProvider]` or `[TaskStorage]`
2. Verify localStorage is available: `isLocalStorageAvailable()`
3. Check browser private/incognito mode (no storage)
4. Check storage quota not exceeded

### Tasks Lost After Refresh
1. Check `quiet_state` in DevTools → Application → Storage
2. Try restore from backup: `restoreFromBackup()`
3. Import from JSON backup if available
4. Check error logs

### Storage Full
1. Get stats: `getStorageStats()`
2. Export old tasks as backup
3. Delete old completed tasks
4. Clear storage if needed: `clearTaskState()`

## 📚 Related Files

- Implementation Guide: `LOCALSTORAGE_IMPLEMENTATION_GUIDE.md`
- Test Suite: `src/utils/taskStorage.test.ts`
- Type Definitions: `src/types/task.ts`
- Context: `src/context/TaskContext.tsx`

## 🎓 Learn More

### Architecture Overview
1. App starts → `main.tsx` calls `initializeApp()`
2. TaskProvider mounts → loads from localStorage
3. User changes task → state updates
4. Effect triggers → debounced save
5. Data persisted → localStorage written

### Data Flow
```
User Action
    ↓
Component Handler
    ↓
Action Call (addTask, updateTask, etc)
    ↓
State Update (React)
    ↓
useEffect Triggered (tasks/lists change)
    ↓
500ms Debounce Wait
    ↓
localStorage.setItem()
    ↓
Data Persisted ✅
```

## ✨ Features Summary

- ✅ **Automatic** - No manual save needed
- ✅ **Offline** - Works without internet
- ✅ **Fast** - Debounced for performance
- ✅ **Safe** - Automatic backups
- ✅ **Exportable** - JSON format
- ✅ **Importable** - Restore from backups
- ✅ **Diagnosed** - Get storage stats
- ✅ **Recoverable** - Backup restoration
- ✅ **Type-safe** - Full TypeScript support
- ✅ **Debuggable** - Console logging

---

**Questions?** See `LOCALSTORAGE_IMPLEMENTATION_GUIDE.md` for detailed documentation.
