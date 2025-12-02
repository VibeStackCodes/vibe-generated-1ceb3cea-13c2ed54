/**
 * TaskList Component
 * Displays a list of tasks with actions
 */

import { useState } from 'react'
import { useFilteredTasks, useTaskActions } from '@/hooks/useTask'
import type { Task } from '@/types/task'

export function TaskList() {
  const filteredTasks = useFilteredTasks()
  const {
    toggleTaskCompletion,
    deleteTask,
    updateTask,
  } = useTaskActions()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')

  const startEdit = (task: Task) => {
    setEditingId(task.id)
    setEditTitle(task.title)
  }

  const saveEdit = (taskId: string) => {
    if (editTitle.trim()) {
      updateTask(taskId, { title: editTitle })
    }
    setEditingId(null)
  }

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-300'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'low':
        return 'bg-green-100 text-green-800 border-green-300'
    }
  }

  if (filteredTasks.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center">
        <p className="text-gray-500">No tasks yet. Create one to get started!</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {filteredTasks.map((task) => (
        <div
          key={task.id}
          className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4 hover:bg-gray-50"
        >
          {/* Checkbox */}
          <input
            type="checkbox"
            checked={task.completed}
            onChange={() => toggleTaskCompletion(task.id)}
            className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            aria-label={`Complete task: ${task.title}`}
          />

          {/* Task content */}
          <div className="flex-1">
            {editingId === task.id ? (
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onBlur={() => saveEdit(task.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') saveEdit(task.id)
                  if (e.key === 'Escape') setEditingId(null)
                }}
                autoFocus
                className="w-full rounded border border-blue-500 px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <div className="flex items-center gap-2">
                <span
                  className={`flex-1 ${
                    task.completed
                      ? 'line-through text-gray-400'
                      : 'text-gray-900'
                  }`}
                  onDoubleClick={() => startEdit(task)}
                >
                  {task.title}
                </span>
                {task.description && (
                  <span className="text-sm text-gray-600">
                    {task.description}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Priority badge */}
          <span
            className={`rounded-full border px-3 py-1 text-xs font-medium ${getPriorityColor(
              task.priority
            )}`}
          >
            {task.priority}
          </span>

          {/* Tags */}
          {task.tags.length > 0 && (
            <div className="flex gap-1">
              {task.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Due date */}
          {task.dueDate && (
            <span className="text-xs text-gray-600">
              {new Date(task.dueDate).toLocaleDateString()}
            </span>
          )}

          {/* Actions */}
          <button
            onClick={() => deleteTask(task.id)}
            className="ml-2 rounded p-1 text-red-600 hover:bg-red-50"
            aria-label="Delete task"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  )
}
