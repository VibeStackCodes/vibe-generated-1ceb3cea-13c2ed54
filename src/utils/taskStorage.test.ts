/**
 * Test Suite for Task Storage (localStorage) Integration
 * Verifies all save/load operations and error handling
 */

import {
  saveTaskState,
  loadTaskState,
  clearTaskState,
  restoreFromBackup,
  exportTasksAsJSON,
  importTasksFromJSON,
  getStorageStats,
  isLocalStorageAvailable,
  getAvailableStorageSpace,
} from './taskStorage'
import type { Task, TaskList } from '@/types/task'

// Mock localStorage for testing
class MockLocalStorage {
  private store: Record<string, string> = {}

  getItem(key: string): string | null {
    return this.store[key] ?? null
  }

  setItem(key: string, value: string): void {
    this.store[key] = value.toString()
  }

  removeItem(key: string): void {
    delete this.store[key]
  }

  clear(): void {
    this.store = {}
  }

  get length(): number {
    return Object.keys(this.store).length
  }

  key(index: number): string | null {
    return Object.keys(this.store)[index] ?? null
  }
}

/**
 * Test utility: Create a sample task
 */
function createSampleTask(id: string = '1'): Task {
  return {
    id,
    title: 'Test Task',
    description: 'Test Description',
    completed: false,
    priority: 'medium',
    dueDate: new Date('2025-12-31'),
    createdAt: new Date(),
    updatedAt: new Date(),
    listId: 'list-1',
    tags: ['test'],
  }
}

/**
 * Test utility: Create a sample list
 */
function createSampleList(id: string = 'list-1'): TaskList {
  return {
    id,
    title: 'Test List',
    description: 'Test List Description',
    color: '#FF6B35',
    createdAt: new Date(),
    updatedAt: new Date(),
    taskCount: 1,
    order: 1,
  }
}

/**
 * Test Suite
 */
export const storageTests = {
  /**
   * Test 1: Save and load tasks
   */
  testSaveAndLoad(): { passed: boolean; message: string } {
    try {
      const task = createSampleTask()
      const list = createSampleList()

      saveTaskState({
        tasks: [task],
        lists: [list],
      })

      const loaded = loadTaskState()

      if (loaded.tasks.length !== 1 || loaded.lists.length !== 1) {
        return { passed: false, message: 'Save/Load: Data count mismatch' }
      }

      if (loaded.tasks[0].title !== task.title) {
        return { passed: false, message: 'Save/Load: Task title mismatch' }
      }

      return { passed: true, message: 'Save/Load: ✓ Passed' }
    } catch (error) {
      return {
        passed: false,
        message: `Save/Load: Failed with error: ${error}`,
      }
    }
  },

  /**
   * Test 2: Clear storage
   */
  testClear(): { passed: boolean; message: string } {
    try {
      const task = createSampleTask()
      saveTaskState({ tasks: [task], lists: [] })

      clearTaskState(false)

      const loaded = loadTaskState()

      if (loaded.tasks.length !== 0 || loaded.lists.length !== 0) {
        return { passed: false, message: 'Clear: Storage not cleared' }
      }

      return { passed: true, message: 'Clear: ✓ Passed' }
    } catch (error) {
      return { passed: false, message: `Clear: Failed with error: ${error}` }
    }
  },

  /**
   * Test 3: Backup and restore
   */
  testBackupRestore(): { passed: boolean; message: string } {
    try {
      const task = createSampleTask()
      saveTaskState({ tasks: [task], lists: [] })

      const beforeClear = loadTaskState()
      if (beforeClear.tasks.length === 0) {
        return {
          passed: false,
          message: 'Backup/Restore: Failed to save initial state',
        }
      }

      clearTaskState(true) // Keep backup

      const loaded = loadTaskState()
      if (loaded.tasks.length !== 0) {
        return { passed: false, message: 'Backup/Restore: Clear failed' }
      }

      const restored = restoreFromBackup()
      if (!restored) {
        return { passed: false, message: 'Backup/Restore: Restore failed' }
      }

      const afterRestore = loadTaskState()
      if (afterRestore.tasks.length !== 1) {
        return {
          passed: false,
          message: 'Backup/Restore: Data not restored',
        }
      }

      return { passed: true, message: 'Backup/Restore: ✓ Passed' }
    } catch (error) {
      return {
        passed: false,
        message: `Backup/Restore: Failed with error: ${error}`,
      }
    }
  },

  /**
   * Test 4: Export as JSON
   */
  testExportJSON(): { passed: boolean; message: string } {
    try {
      const task = createSampleTask()
      const list = createSampleList()

      const json = exportTasksAsJSON({
        tasks: [task],
        lists: [list],
      })

      if (typeof json !== 'string' || json.length === 0) {
        return { passed: false, message: 'Export JSON: Invalid output' }
      }

      const parsed = JSON.parse(json)
      if (!parsed.version || !parsed.exportDate) {
        return {
          passed: false,
          message: 'Export JSON: Missing metadata',
        }
      }

      if (parsed.tasks.length !== 1 || parsed.lists.length !== 1) {
        return { passed: false, message: 'Export JSON: Data mismatch' }
      }

      return { passed: true, message: 'Export JSON: ✓ Passed' }
    } catch (error) {
      return {
        passed: false,
        message: `Export JSON: Failed with error: ${error}`,
      }
    }
  },

  /**
   * Test 5: Import from JSON
   */
  testImportJSON(): { passed: boolean; message: string } {
    try {
      const task = createSampleTask()
      const list = createSampleList()

      const json = exportTasksAsJSON({
        tasks: [task],
        lists: [list],
      })

      const imported = importTasksFromJSON(json)

      if (imported.tasks.length !== 1 || imported.lists.length !== 1) {
        return { passed: false, message: 'Import JSON: Data count mismatch' }
      }

      if (imported.tasks[0].title !== task.title) {
        return { passed: false, message: 'Import JSON: Task title mismatch' }
      }

      return { passed: true, message: 'Import JSON: ✓ Passed' }
    } catch (error) {
      return {
        passed: false,
        message: `Import JSON: Failed with error: ${error}`,
      }
    }
  },

  /**
   * Test 6: Storage statistics
   */
  testStorageStats(): { passed: boolean; message: string } {
    try {
      const task = createSampleTask()
      saveTaskState({ tasks: [task], lists: [] })

      const stats = getStorageStats()

      if (stats.tasksCount !== 1) {
        return {
          passed: false,
          message: `Storage Stats: Expected 1 task, got ${stats.tasksCount}`,
        }
      }

      if (stats.storageSize <= 0) {
        return {
          passed: false,
          message: 'Storage Stats: Invalid storage size',
        }
      }

      return { passed: true, message: 'Storage Stats: ✓ Passed' }
    } catch (error) {
      return {
        passed: false,
        message: `Storage Stats: Failed with error: ${error}`,
      }
    }
  },

  /**
   * Test 7: localStorage availability check
   */
  testStorageAvailability(): { passed: boolean; message: string } {
    try {
      const available = isLocalStorageAvailable()

      if (typeof available !== 'boolean') {
        return {
          passed: false,
          message: 'Storage Availability: Invalid return type',
        }
      }

      return {
        passed: true,
        message: `Storage Availability: ✓ Passed (available: ${available})`,
      }
    } catch (error) {
      return {
        passed: false,
        message: `Storage Availability: Failed with error: ${error}`,
      }
    }
  },

  /**
   * Test 8: Date serialization
   */
  testDateSerialization(): { passed: boolean; message: string } {
    try {
      const task = createSampleTask()
      const originalDate = task.dueDate

      saveTaskState({ tasks: [task], lists: [] })
      const loaded = loadTaskState()

      if (!loaded.tasks[0].dueDate) {
        return {
          passed: false,
          message: 'Date Serialization: Due date not preserved',
        }
      }

      const loadedDate = new Date(loaded.tasks[0].dueDate)
      const originalTime = originalDate?.getTime()
      const loadedTime = loadedDate.getTime()

      if (originalTime !== loadedTime) {
        return {
          passed: false,
          message: 'Date Serialization: Date mismatch',
        }
      }

      return { passed: true, message: 'Date Serialization: ✓ Passed' }
    } catch (error) {
      return {
        passed: false,
        message: `Date Serialization: Failed with error: ${error}`,
      }
    }
  },

  /**
   * Run all tests
   */
  runAll(): void {
    console.group('🧪 Task Storage Tests')

    const tests = [
      this.testSaveAndLoad(),
      this.testClear(),
      this.testBackupRestore(),
      this.testExportJSON(),
      this.testImportJSON(),
      this.testStorageStats(),
      this.testStorageAvailability(),
      this.testDateSerialization(),
    ]

    tests.forEach((test) => {
      const emoji = test.passed ? '✅' : '❌'
      console.log(`${emoji} ${test.message}`)
    })

    const passed = tests.filter((t) => t.passed).length
    const total = tests.length

    console.log(`\n📊 Results: ${passed}/${total} tests passed`)
    console.groupEnd()
  },
}

/**
 * Run tests in development environment
 */
if (import.meta.env.DEV) {
  // Uncomment to run tests automatically in development
  // storageTests.runAll()
}
