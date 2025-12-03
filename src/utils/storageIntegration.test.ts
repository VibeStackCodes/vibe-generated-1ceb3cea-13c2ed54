/**
 * Storage Integration Tests
 * Verifies localStorage persistence functionality
 * Run tests to ensure all storage operations work correctly
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import {
  loadTaskState,
  saveTaskState,
  clearTaskState,
  restoreFromBackup,
  exportTasksAsJSON,
  importTasksFromJSON,
  isLocalStorageAvailable,
  getStorageStats,
} from './taskStorage'
import type { Task, TaskList } from '@/types/task'

// Mock localStorage for testing
const localStorageMock = (() => {
  let store: Record<string, string> = {}

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString()
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
  }
})()

// Replace global localStorage with mock
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

describe('Storage Integration Tests', () => {
  beforeEach(() => {
    localStorageMock.clear()
  })

  afterEach(() => {
    localStorageMock.clear()
  })

  describe('Basic Save/Load', () => {
    it('should save and load empty state', () => {
      const state = { tasks: [], lists: [] }
      saveTaskState(state)

      const loaded = loadTaskState()
      expect(loaded.tasks).toEqual([])
      expect(loaded.lists).toEqual([])
    })

    it('should save and load tasks with correct structure', () => {
      const task: Task = {
        id: '1',
        title: 'Test Task',
        description: 'Test Description',
        completed: false,
        priority: 'high',
        dueDate: new Date('2024-12-31'),
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        listId: 'list-1',
        tags: ['test', 'urgent'],
      }

      const state = { tasks: [task], lists: [] }
      saveTaskState(state)

      const loaded = loadTaskState()
      expect(loaded.tasks).toHaveLength(1)
      expect(loaded.tasks[0].title).toBe('Test Task')
      expect(loaded.tasks[0].priority).toBe('high')
      expect(loaded.tasks[0].tags).toEqual(['test', 'urgent'])
    })

    it('should save and load lists', () => {
      const list: TaskList = {
        id: 'list-1',
        title: 'My List',
        description: 'Test list',
        color: '#FF6B35',
        createdAt: new Date(),
        updatedAt: new Date(),
        taskCount: 5,
        order: 1,
      }

      const state = { tasks: [], lists: [list] }
      saveTaskState(state)

      const loaded = loadTaskState()
      expect(loaded.lists).toHaveLength(1)
      expect(loaded.lists[0].title).toBe('My List')
      expect(loaded.lists[0].color).toBe('#FF6B35')
    })

    it('should convert date strings back to Date objects', () => {
      const task: Task = {
        id: '1',
        title: 'Test Task',
        completed: false,
        priority: 'medium',
        createdAt: new Date('2024-01-15T10:00:00Z'),
        updatedAt: new Date('2024-01-15T11:00:00Z'),
        dueDate: new Date('2024-12-31T23:59:59Z'),
        listId: 'list-1',
        tags: [],
      }

      const state = { tasks: [task], lists: [] }
      saveTaskState(state)

      const loaded = loadTaskState()
      expect(loaded.tasks[0].createdAt).toBeInstanceOf(Date)
      expect(loaded.tasks[0].updatedAt).toBeInstanceOf(Date)
      expect(loaded.tasks[0].dueDate).toBeInstanceOf(Date)
    })
  })

  describe('Backup and Recovery', () => {
    it('should create backup before saving', () => {
      const state1 = { tasks: [], lists: [] }
      saveTaskState(state1)

      const task: Task = {
        id: '1',
        title: 'New Task',
        completed: false,
        priority: 'low',
        createdAt: new Date(),
        updatedAt: new Date(),
        listId: 'list-1',
        tags: [],
      }

      const state2 = { tasks: [task], lists: [] }
      saveTaskState(state2)

      // Restore from backup should restore first state
      const restored = restoreFromBackup()
      expect(restored).toBe(true)

      const loaded = loadTaskState()
      expect(loaded.tasks).toHaveLength(0)
    })

    it('should return false when no backup exists', () => {
      const restored = restoreFromBackup()
      expect(restored).toBe(false)
    })
  })

  describe('Clear Storage', () => {
    it('should clear all storage', () => {
      const task: Task = {
        id: '1',
        title: 'Test Task',
        completed: false,
        priority: 'low',
        createdAt: new Date(),
        updatedAt: new Date(),
        listId: 'list-1',
        tags: [],
      }

      const state = { tasks: [task], lists: [] }
      saveTaskState(state)

      clearTaskState(false)

      const loaded = loadTaskState()
      expect(loaded.tasks).toHaveLength(0)
      expect(loaded.lists).toHaveLength(0)
    })

    it('should keep backup when keepBackup is true', () => {
      const task: Task = {
        id: '1',
        title: 'Test Task',
        completed: false,
        priority: 'low',
        createdAt: new Date(),
        updatedAt: new Date(),
        listId: 'list-1',
        tags: [],
      }

      const state = { tasks: [task], lists: [] }
      saveTaskState(state)

      clearTaskState(true)

      const restored = restoreFromBackup()
      expect(restored).toBe(true)
    })
  })

  describe('Export/Import', () => {
    it('should export tasks as JSON', () => {
      const task: Task = {
        id: '1',
        title: 'Test Task',
        completed: false,
        priority: 'high',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        listId: 'list-1',
        tags: ['test'],
      }

      const state = { tasks: [task], lists: [] }
      const json = exportTasksAsJSON(state)

      expect(json).toContain('"title":"Test Task"')
      expect(json).toContain('"priority":"high"')
      expect(json).toContain('"tags":["test"]')
    })

    it('should import tasks from JSON', () => {
      const task: Task = {
        id: '1',
        title: 'Test Task',
        completed: false,
        priority: 'high',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        listId: 'list-1',
        tags: ['test'],
      }

      const state = { tasks: [task], lists: [] }
      const json = exportTasksAsJSON(state)

      const imported = importTasksFromJSON(json)
      expect(imported.tasks).toHaveLength(1)
      expect(imported.tasks[0].title).toBe('Test Task')
    })

    it('should throw error on invalid JSON import', () => {
      expect(() => {
        importTasksFromJSON('invalid json')
      }).toThrow()
    })
  })

  describe('Storage Statistics', () => {
    it('should return correct storage stats', () => {
      const task: Task = {
        id: '1',
        title: 'Test Task',
        completed: false,
        priority: 'low',
        createdAt: new Date(),
        updatedAt: new Date(),
        listId: 'list-1',
        tags: [],
      }

      const list: TaskList = {
        id: 'list-1',
        title: 'My List',
        createdAt: new Date(),
        updatedAt: new Date(),
        taskCount: 1,
        order: 1,
      }

      const state = { tasks: [task], lists: [list] }
      saveTaskState(state)

      const stats = getStorageStats()
      expect(stats.tasksCount).toBe(1)
      expect(stats.listsCount).toBe(1)
      expect(stats.storageSize).toBeGreaterThan(0)
    })
  })

  describe('Storage Availability', () => {
    it('should detect localStorage availability', () => {
      const available = isLocalStorageAvailable()
      expect(available).toBe(true)
    })
  })

  describe('Error Handling', () => {
    it('should handle corrupted data gracefully', () => {
      localStorageMock.setItem('quiettask_state', 'corrupted data')

      const loaded = loadTaskState()
      expect(loaded.tasks).toEqual([])
      expect(loaded.lists).toEqual([])
    })

    it('should handle missing dates gracefully', () => {
      const corrupted = {
        tasks: [
          {
            id: '1',
            title: 'Test',
            completed: false,
            priority: 'low',
            listId: 'list-1',
            tags: [],
          },
        ],
        lists: [],
      }

      localStorageMock.setItem('quiettask_state', JSON.stringify(corrupted))

      const loaded = loadTaskState()
      expect(loaded.tasks).toHaveLength(1)
      expect(loaded.tasks[0].createdAt).toBeInstanceOf(Date)
    })
  })

  describe('Data Serialization', () => {
    it('should properly serialize complex task data', () => {
      const task: Task = {
        id: 'task-123',
        title: 'Complex Task',
        description: 'Multi-line\ndescription',
        completed: true,
        priority: 'high',
        dueDate: new Date('2024-12-31T23:59:59Z'),
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: new Date('2024-01-15T12:30:45Z'),
        listId: 'list-456',
        tags: ['work', 'urgent', 'important'],
        recurrence: 'weekly',
        parentTaskId: 'parent-789',
      }

      const state = { tasks: [task], lists: [] }
      saveTaskState(state)

      const loaded = loadTaskState()
      const loadedTask = loaded.tasks[0]

      expect(loadedTask.id).toBe('task-123')
      expect(loadedTask.description).toBe('Multi-line\ndescription')
      expect(loadedTask.completed).toBe(true)
      expect(loadedTask.tags).toEqual(['work', 'urgent', 'important'])
      expect(loadedTask.recurrence).toBe('weekly')
      expect(loadedTask.parentTaskId).toBe('parent-789')
    })
  })
})
