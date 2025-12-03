# localStorage Integration Guide

This document provides comprehensive information about the localStorage persistence layer in QuietTask.

## Overview

The QuietTask application implements a robust local-first storage strategy using browser localStorage. This enables:

- **Offline-first functionality** - Tasks persist locally and sync when online
- **Fast application startup** - Data loads instantly from localStorage
- **Private by default** - All data stored locally on user's device
- **Automatic persistence** - Changes automatically saved (with debouncing)
- **Data recovery** - Backup system for accidental data loss

## Architecture

### Core Components

1. **taskStorage.ts** (`src/utils/taskStorage.ts`)
   - Low-level storage operations (load, save, backup, export/import)
   - Version migration support
   - Quota management and cleanup

2. **TaskContext** (`src/context/TaskContext.tsx`)
   - React Context for global state management
   - Automatic load on app startup
   - Debounced save on state changes

3. **Storage Manager** (`src/utils/storageManager.ts`)
   - High-level API for storage operations
   - Event system for storage events
   - Quota monitoring and diagnostics

4. **Hooks**
   - `useLocalStorage` - Basic localStorage hook
   - `useStoragePersistence` - Advanced persistence with retry logic
   - `useStorageManager` - High-level storage operations
   - `useStorageQuota` - Storage usage monitoring
   - `useStorageEvents` - Storage event handling

### Data Flow

```
User Action
    ↓
Task Context (React state)
    ↓ (debounced 500ms)
Task Storage (taskStorage.ts)
    ↓
localStorage (browser storage)
    ↓ (on app restart)
Task Storage (load)
    ↓
Task Context (initialize state)
    ↓
App Renders with persisted data
```

## Usage

### Basic Usage - Automatic Persistence

The app automatically persists tasks to localStorage. No additional setup required:

```typescript
import { useTask } from '@/hooks/useTask'

function MyComponent() {
  const { state, actions } = useTask()

  const handleAddTask = () => {
    actions.addTask({
      title: 'New Task',
      completed: false,
      priority: 'medium',
      listId: 'default',
      tags: [],
    })
    // Task is automatically saved to localStorage
  }

  return (
    // Component JSX
  )
}
```

### Storage Manager Usage

For advanced storage operations:

```typescript
import { useStorageManager } from '@/hooks/useStorageManager'

function SettingsComponent() {
  const {
    stats,
    sync,
    load,
    clear,
    restore,
    exportData,
    importData,
    isAvailable,
    isQuotaLow,
  } = useStorageManager()

  return (
    <div>
      {/* Display storage stats */}
      <p>Storage used: {(stats.storageSize / 1024).toFixed(2)} KB</p>
      <p>Available: {(stats.availableSpace / 1024 / 1024).toFixed(2)} MB</p>

      {/* Quota warning */}
      {isQuotaLow && <WarningBanner>Storage quota low</WarningBanner>}

      {/* Export button */}
      <button
        onClick={() => {
          const json = exportData(state)
          downloadJSON(json, 'tasks-backup.json')
        }}
      >
        Export Backup
      </button>

      {/* Clear button */}
      <button onClick={() => clear(true)}>Clear Data (keep backup)</button>

      {/* Restore button */}
      <button onClick={restore}>Restore from Backup</button>
    </div>
  )
}
```

### Monitoring Storage Quota

```typescript
import { useStorageQuota } from '@/hooks/useStorageManager'

function QuotaIndicator() {
  const quota = useStorageQuota()

  const colors = {
    low: 'green',
    warning: 'orange',
    critical: 'red',
  }

  const status = quota.percent > 95 ? 'critical' : quota.percent > 80 ? 'warning' : 'low'

  return (
    <div>
      <progress value={quota.percent} max="100" />
      <span style={{ color: colors[status] }}>
        {Math.round(quota.percent)}% full
      </span>
    </div>
  )
}
```

### Handling Storage Events

```typescript
import { useStorageEvents } from '@/hooks/useStorageManager'

function StorageMonitor() {
  const { events, lastError, lastWarning, clearEvents } = useStorageEvents()

  useEffect(() => {
    if (lastError) {
      showErrorNotification(lastError.message)
    }
  }, [lastError])

  useEffect(() => {
    if (lastWarning) {
      showWarningNotification(lastWarning.message)
    }
  }, [lastWarning])

  return (
    <div>
      {/* Recent storage events */}
      {events.map((event) => (
        <div key={event.timestamp.getTime()}>
          {event.type}: {event.message}
        </div>
      ))}
    </div>
  )
}
```

## Configuration

Storage configuration is centralized in `src/config/storageConfig.ts`:

```typescript
export const STORAGE_CONFIG = {
  // Storage keys
  STORAGE_KEY: 'quiettask_state',
  STORAGE_VERSION: 2,

  // Debounce time (500ms prevents excessive writes)
  DEBOUNCE_MS: 500,

  // Auto-save enabled by default
  AUTO_SYNC_ENABLED: true,

  // Old tasks older than 30 days are cleaned up
  OLD_TASK_RETENTION_DAYS: 30,

  // Quota warnings at 80%
  QUOTA_WARNING_PERCENT: 80,
}
```

### Feature Flags

```typescript
export const STORAGE_FEATURES = {
  AUTO_BACKUP: true, // Backup before each save
  COMPRESSION_ENABLED: false, // For future use
  ENCRYPTION_ENABLED: false, // For future use
  DIAGNOSTICS_ENABLED: true, // In development
  MONITOR_USAGE: true, // Track storage usage
  AUTO_CLEANUP: true, // Auto-cleanup old tasks
  AUTO_RECOVERY: true, // Auto-recovery on load failure
  IMPORT_EXPORT: true, // Allow export/import
}
```

## API Reference

### taskStorage.ts

```typescript
// Load state from localStorage
loadTaskState(): Omit<TaskState, 'filter' | 'sort'>

// Save state to localStorage
saveTaskState(state: Pick<TaskState, 'tasks' | 'lists'>): void

// Clear all storage
clearTaskState(keepBackup?: boolean): void

// Restore from backup
restoreFromBackup(): boolean

// Export as JSON
exportTasksAsJSON(state: Pick<TaskState, 'tasks' | 'lists'>): string

// Import from JSON
importTasksFromJSON(jsonString: string): Pick<TaskState, 'tasks' | 'lists'>

// Get storage statistics
getStorageStats(): StorageStats

// Check if localStorage is available
isLocalStorageAvailable(): boolean

// Get available storage space
getAvailableStorageSpace(): number
```

### storageManager.ts

```typescript
// Get singleton instance
getStorageManager(): StorageManager

// Sync to storage
sync(state: Pick<TaskState, 'tasks' | 'lists'>): boolean

// Load from storage
load(): Pick<TaskState, 'tasks' | 'lists'> | null

// Clear storage
clear(keepBackup?: boolean): boolean

// Restore from backup
restoreBackup(): boolean

// Export as JSON
export(state: Pick<TaskState, 'tasks' | 'lists'>): string | null

// Import from JSON
import(jsonString: string): Pick<TaskState, 'tasks' | 'lists'> | null

// Get statistics
getStats(): StorageManagerStats

// Check availability
isAvailable(): boolean
isOnline(): boolean
isQuotaLow(): boolean
isQuotaCritical(): boolean

// Event listeners
addEventListener(listener: (event: StorageEvent) => void): () => void
```

### Hooks

#### useStorageManager()

```typescript
const {
  // Stats
  stats,
  lastEvent,

  // Operations
  sync,
  load,
  clear,
  restore,
  exportData,
  importData,

  // Status
  isAvailable,
  isOnline,
  isQuotaLow,
  isQuotaCritical,

  // Utils
  updateStats,
  resetStats,
} = useStorageManager()
```

#### useStorageQuota()

```typescript
const quota = useStorageQuota()
// Returns: { used, available, total, percent }
```

#### useStorageEvents()

```typescript
const {
  events, // All recent storage events
  lastError, // Last error event
  lastWarning, // Last warning event
  clearEvents, // Clear event history
} = useStorageEvents()
```

## Data Persistence Flow

### On App Startup

1. `appInitializer.ts` checks localStorage availability
2. `TaskProvider` loads persisted state from localStorage
3. State is restored to React Context
4. UI renders with persisted data

### On User Action

1. User creates/updates/deletes task
2. React state updates immediately
3. Change is debounced (500ms default)
4. Debounce timer expires
5. State is saved to localStorage
6. Backup created before save
7. Storage stats updated

### On Load Failure

1. Attempt to parse stored JSON
2. If parse fails, attempt to restore from backup
3. If backup restore fails, return empty state
4. App continues with empty state (can recover later)

## Error Handling

### Quota Exceeded

When localStorage quota is exceeded:

1. Old completed tasks are pruned (30+ days old)
2. If still over quota, error is thrown to UI
3. User notified to clear old tasks or export backup

### Corrupted Data

When stored data is corrupted:

1. Attempted to parse JSON
2. If parse fails, backup is loaded
3. If backup load fails, empty state returned
4. Data can be recovered via restore feature

### Storage Unavailable

When localStorage is unavailable (private browsing):

1. All storage operations skip
2. App works in-memory only
3. Data is not persisted
4. User can still use app normally

## Performance Optimization

### Debouncing

Saves are debounced to 500ms to prevent:
- Excessive localStorage writes
- Browser performance degradation
- Battery drain on mobile devices

### Versioning

Storage versioning enables:
- Future schema changes
- Automatic data migration
- Backward compatibility

### Backup System

Automatic backup enables:
- Recovery from accidental deletion
- Data integrity protection
- Non-destructive operations

## Security Considerations

### Current Implementation

- Data stored in plaintext (browser security model)
- Accessible only from same origin
- Protected by browser Same-Origin Policy

### Future Enhancement

Planned encryption support:
- End-to-end encryption option
- Client-side encryption/decryption
- Optional encryption enabled via config

## Browser Compatibility

- **Modern Browsers**: Full support (Chrome, Firefox, Safari, Edge)
- **Private Browsing**: Limited (in-memory only)
- **Storage Limit**: Typically 5-10MB per domain

## Troubleshooting

### Tasks Not Persisting

1. Check browser console for errors
2. Verify localStorage is available
3. Check browser storage quota
4. Clear browser cache and retry

### Quota Exceeded Error

1. Export backup via settings
2. Clear old completed tasks
3. Import backup after cleanup

### Corrupted Data

1. Use "Restore from Backup" option
2. If backup unavailable, export and re-import clean data
3. Contact support if data loss occurs

## Testing

Run storage integration tests:

```bash
npm run test src/utils/storageIntegration.test.ts
```

Tests verify:
- Save/load operations
- Data serialization
- Backup/restore functionality
- Export/import operations
- Error handling
- Storage statistics

## Best Practices

1. **Always have a backup** - Regularly export data
2. **Monitor quota** - Watch storage usage
3. **Handle errors gracefully** - Show user notifications
4. **Test offline** - Verify offline functionality
5. **Avoid large tasks** - Keep descriptions reasonable
6. **Clean old data** - Archive completed tasks

## Migration Path

If migrating from cloud storage:

1. Export data from old system as JSON
2. Import JSON via QuietTask settings
3. Verify data imported correctly
4. Delete data from old system

## Support

For issues with localStorage persistence:

1. Check browser console for error messages
2. Verify localStorage is enabled in browser
3. Check storage quota usage
4. Try exporting and re-importing data
5. Clear browser cache and retry

## Related Files

- `src/utils/taskStorage.ts` - Core storage operations
- `src/utils/storageManager.ts` - High-level API
- `src/config/storageConfig.ts` - Configuration
- `src/context/TaskContext.tsx` - State management
- `src/utils/appInitializer.ts` - App initialization
- `src/hooks/useStorageManager.ts` - Storage hooks
