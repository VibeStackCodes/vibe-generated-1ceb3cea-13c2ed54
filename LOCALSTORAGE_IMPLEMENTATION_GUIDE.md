# localStorage Integration Implementation Guide

## Overview

The QuietTask application has comprehensive localStorage integration for local-first data persistence. Tasks and lists are automatically saved to the browser's localStorage on every change and loaded on app startup.

## Architecture

### Core Components

#### 1. **TaskProvider Context** (`src/context/TaskContext.tsx`)
- Manages global task state using React Context API
- Automatically loads tasks from localStorage on mount
- Persists all changes to localStorage with 500ms debounce
- Provides actions for CRUD operations on tasks and lists
- Handles loading state during initialization

**Key Features:**
- Debounced persistence (500ms) to avoid excessive writes
- Auto-initialization from localStorage
- Error handling with console logging
- Optimized memoization for performance

#### 2. **Task Storage Utilities** (`src/utils/taskStorage.ts`)
Comprehensive utility functions for localStorage operations:

- `loadTaskState()` - Load tasks/lists from storage
- `saveTaskState()` - Save state to storage with serialization
- `clearTaskState()` - Clear all data with optional backup
- `restoreFromBackup()` - Recover from backup
- `exportTasksAsJSON()` - Export data as JSON string
- `importTasksFromJSON()` - Import data from JSON
- `getStorageStats()` - Get storage usage statistics
- `isLocalStorageAvailable()` - Check storage availability
- `getAvailableStorageSpace()` - Estimate available space

**Features:**
- Date serialization/deserialization
- Version migration support
- Backup before save for recovery
- Quota exceeded handling
- Storage space pruning for old completed tasks

#### 3. **App Initializer** (`src/utils/appInitializer.ts`)
Startup initialization module for storage diagnostics:

- `initializeApp()` - Run initialization checks
- `logInitializationStatus()` - Log detailed initialization info
- `canSyncToStorage()` - Check if storage is available
- `getStorageUsageSummary()` - Human-readable storage info

**Features:**
- Detects storage availability
- Checks for existing data
- Calculates storage usage
- Warns when usage exceeds 80%
- Performance timing

#### 4. **Storage Persistence Hook** (`src/hooks/useStoragePersistence.ts`)
Advanced React hook for custom persistence control:

- `useStoragePersistence()` - Advanced persistence with full control
- `useStorageDiagnostics()` - Storage monitoring hook

**Features:**
- Auto-sync with debounce control
- Retry logic (up to 3 retries by default)
- Sync callbacks (onSyncError, onSyncSuccess)
- Force save/load operations
- Export/import functionality
- Detailed sync statistics
- Optional diagnostics logging

## Data Flow

### Startup (App Load)
```
1. App starts (main.tsx)
   ↓
2. initializeApp() checks localStorage availability
   ↓
3. TaskProvider mounts
   ↓
4. loadTaskState() retrieves saved data
   ↓
5. State initialized with loaded data
   ↓
6. isLoading set to false
   ↓
7. App renders with loaded data
```

### Task Operation (Create/Update/Delete)
```
1. User action triggers task change
   ↓
2. Component calls action (addTask, updateTask, etc.)
   ↓
3. State updated in TaskProvider
   ↓
4. useEffect triggered (tasks/lists dependency)
   ↓
5. Debounce timer starts (500ms)
   ↓
6. If no changes in 500ms → saveTaskState() called
   ↓
7. State serialized and written to localStorage
   ↓
8. Console log confirms save
```

### Data Format

**Storage Key:** `quiettask_state`
**Storage Version Key:** `quiettask_version`
**Backup Key:** `quiettask_backup`

**JSON Structure:**
```json
{
  "tasks": [
    {
      "id": "1234567890-abc123def",
      "title": "Task Title",
      "description": "Optional description",
      "completed": false,
      "priority": "medium",
      "dueDate": "2024-12-31T23:59:59.000Z",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "listId": "list-id",
      "tags": ["tag1", "tag2"],
      "recurrence": "none",
      "parentTaskId": null
    }
  ],
  "lists": [
    {
      "id": "list-1234567890",
      "title": "My List",
      "description": "List description",
      "color": "#FF6B35",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "taskCount": 5,
      "order": 0
    }
  ]
}
```

## Browser Storage Limits

| Browser | Limit |
|---------|-------|
| Chrome | ~10MB |
| Firefox | ~10MB |
| Safari | ~5MB |
| Edge | ~10MB |

**Impact on QuietTask:**
- Average task: ~300-500 bytes
- Can store 20,000+ tasks before hitting limits
- Automatic pruning of old completed tasks when quota exceeded

## Usage Examples

### Basic Usage (Automatic)
```typescript
import { useTask } from '@/hooks/useTask'

function MyComponent() {
  const { state, actions } = useTask()

  // Tasks automatically loaded from storage on mount
  // and saved whenever they change

  const handleAddTask = () => {
    actions.addTask({
      title: 'New Task',
      completed: false,
      priority: 'medium',
      listId: 'default',
      tags: [],
    })
    // Automatically persisted to localStorage
  }

  return <div>{state.tasks.length} tasks</div>
}
```

### Check Loading State
```typescript
import { useTaskLoading } from '@/hooks/useTask'

function MyComponent() {
  const isLoading = useTaskLoading()

  if (isLoading) {
    return <div>Loading your tasks...</div>
  }

  return <div>Tasks loaded!</div>
}
```

### Force Immediate Save
```typescript
import { useTask } from '@/hooks/useTask'
import { saveTaskState } from '@/utils/taskStorage'

function CriticalSave() {
  const { state } = useTask()

  const handleCriticalOperation = () => {
    // Do something important

    // Force immediate save (bypass 500ms debounce)
    saveTaskState({ tasks: state.tasks, lists: state.lists })
  }

  return <button onClick={handleCriticalOperation}>Save Now</button>
}
```

### Export Tasks as Backup
```typescript
import { useTask } from '@/hooks/useTask'
import { exportTasksAsJSON } from '@/utils/taskStorage'

function ExportButton() {
  const { state } = useTask()

  const handleExport = () => {
    const json = exportTasksAsJSON({
      tasks: state.tasks,
      lists: state.lists,
    })

    // Create download
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `tasks-backup-${Date.now()}.json`
    link.click()
  }

  return <button onClick={handleExport}>Backup</button>
}
```

### Import Tasks from Backup
```typescript
import { importTasksFromJSON } from '@/utils/taskStorage'
import { useTask } from '@/hooks/useTask'

function ImportButton() {
  const { actions } = useTask()

  const handleImport = (fileContent: string) => {
    try {
      const imported = importTasksFromJSON(fileContent)

      // Add imported tasks
      for (const task of imported.tasks) {
        actions.addTask(task)
      }

      // Add imported lists
      for (const list of imported.lists) {
        actions.addList(list)
      }
    } catch (error) {
      console.error('Import failed:', error)
    }
  }

  return (
    <input
      type="file"
      accept=".json"
      onChange={(e) => {
        const file = e.target.files?.[0]
        if (file) {
          const reader = new FileReader()
          reader.onload = (event) => {
            handleImport(event.target?.result as string)
          }
          reader.readAsText(file)
        }
      }}
    />
  )
}
```

### Check Storage Stats
```typescript
import { getStorageStats } from '@/utils/taskStorage'

function StorageInfo() {
  const stats = getStorageStats()

  return (
    <div>
      <p>Tasks: {stats.tasksCount}</p>
      <p>Lists: {stats.listsCount}</p>
      <p>Size: {(stats.storageSize / 1024).toFixed(2)} KB</p>
    </div>
  )
}
```

### Advanced: Custom Persistence Hook
```typescript
import { useStoragePersistence } from '@/hooks/useStoragePersistence'

function MyComponent() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [lists, setLists] = useState<TaskList[]>([])

  const persistence = useStoragePersistence(
    tasks,
    lists,
    (loadedTasks, loadedLists) => {
      setTasks(loadedTasks)
      setLists(loadedLists)
    },
    {
      autoSync: true,
      debounceMs: 1000,
      enableDiagnostics: true,
      onSyncError: (error) => {
        console.error('Sync failed:', error)
      },
      onSyncSuccess: () => {
        console.log('Sync successful!')
      },
    }
  )

  return (
    <div>
      <p>Syncing: {persistence.stats.isSyncing}</p>
      <p>Syncs: {persistence.stats.syncCount}</p>
      <p>Errors: {persistence.stats.errorCount}</p>
      <button onClick={() => persistence.forceSave()}>Save Now</button>
      <button onClick={() => persistence.clear()}>Clear All</button>
    </div>
  )
}
```

### Storage Diagnostics
```typescript
import { useStorageDiagnostics } from '@/hooks/useStoragePersistence'

function StorageDashboard() {
  const diag = useStorageDiagnostics()

  return (
    <div>
      <p>Available: {diag.isAvailable}</p>
      <p>Tasks: {diag.stats.tasksCount}</p>
      <p>Lists: {diag.stats.listsCount}</p>
      <p>Usage: {diag.usagePercent.toFixed(1)}%</p>
      <button onClick={() => diag.refresh()}>Refresh Stats</button>
    </div>
  )
}
```

## Debugging in Browser Console

```javascript
// View stored data
JSON.parse(localStorage.getItem('quiettask_state'))

// Check storage size
new Blob([localStorage.getItem('quiettask_state')]).size + ' bytes'

// Check version
localStorage.getItem('quiettask_version')

// Clear all data (WARNING: deletes all tasks!)
localStorage.clear()

// Import and check stats
const { getStorageStats } = await import('@/utils/taskStorage')
getStorageStats()

// Check available space
const { getAvailableStorageSpace } = await import('@/utils/taskStorage')
getAvailableStorageSpace() + ' bytes available'
```

## Error Handling

### QuotaExceededError
When localStorage quota is exceeded:
1. Browser throws `QuotaExceededError`
2. TaskProvider catches the error
3. Auto-pruning of old completed tasks triggered
4. Retry save operation
5. Console logs error for debugging

### Corrupted Data Recovery
1. Load fails with parse error
2. Backup recovery attempted
3. If backup exists, restore and reload
4. If no backup, starts with empty state

### Storage Not Available
1. `isLocalStorageAvailable()` returns false
2. App continues with in-memory state
3. Changes not persisted (e.g., private browsing)
4. Console warning logged

## Performance Optimization

### Debouncing Strategy
- 500ms debounce prevents excessive localStorage writes
- Multiple rapid changes coalesced into single write
- Reduces CPU usage and extends storage lifespan

### Serialization
- Date objects converted to ISO strings for storage
- Automatic deserialization on load
- Type-safe serialization/deserialization

### Memoization
- Context memoization prevents unnecessary re-renders
- Actions memoized to prevent component re-renders
- Selective updates via useCallback

## Testing

Run the test suite:
```bash
# Tests located in src/utils/taskStorage.test.ts
# Import and run: storageTests.runAll()
```

Tests cover:
- Save/load operations
- Clear and restore
- Export/import JSON
- Date serialization
- Storage statistics
- Availability checks

## Migration Strategy

For future storage format changes:
1. Increment `STORAGE_VERSION` in `taskStorage.ts`
2. Add migration logic to `migrateTaskState()`
3. Version detection in `loadTaskState()`
4. Automatic migration on load

## Best Practices

1. **Always use TaskProvider** for state management
2. **Don't bypass persistence** - let TaskProvider handle saves
3. **Check isLoading** before rendering critical UI
4. **Export backups** regularly for important data
5. **Monitor storage stats** in development
6. **Handle errors gracefully** in components
7. **Use const for imports** to enable tree-shaking
8. **Never directly access localStorage** - use utilities

## Architecture Diagram

```
main.tsx
  ↓
App Component
  ↓
TaskProvider (initializes on mount)
  ├─ loadTaskState() → localStorage
  ├─ State management (tasks, lists, filter, sort)
  └─ Persistence effect (on task/list changes)
      └─ saveTaskState() → localStorage (500ms debounce)
          ↓
      localStorage["quiettask_state"]

Components
  ↓
Hooks (useTask, useFilteredTasks, etc.)
  ↓
Actions & State from TaskProvider
  └─ Trigger state updates
      ↓
  Persistence effect catches change
      ↓
  Debounced save to localStorage
```

## Summary

The localStorage integration provides:
- ✅ Automatic persistence on every change
- ✅ Efficient debounced writes
- ✅ Backup and recovery
- ✅ Export/import functionality
- ✅ Storage management and diagnostics
- ✅ Error handling and recovery
- ✅ Version migration support
- ✅ Type-safe operations
- ✅ Developer-friendly debugging
- ✅ Full offline support

All persistence operations are transparent to components - just use the TaskProvider hooks and everything is automatically saved!
