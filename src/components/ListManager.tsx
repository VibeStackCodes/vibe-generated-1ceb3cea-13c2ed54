/**
 * ListManager Component
 * Manage task lists/projects
 */

import { useState } from 'react'
import { useTaskLists, useTaskActions, useFilteredTasks } from '@/hooks/useTask'

export function ListManager() {
  const lists = useTaskLists()
  const { addList, deleteList, updateList } = useTaskActions()
  const tasks = useFilteredTasks()

  const [newListTitle, setNewListTitle] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')

  const handleAddList = () => {
    if (!newListTitle.trim()) {
      alert('Please enter a list title')
      return
    }

    addList({
      title: newListTitle.trim(),
      order: lists.length,
      taskCount: 0,
    })

    setNewListTitle('')
  }

  const startEdit = (id: string, title: string) => {
    setEditingId(id)
    setEditTitle(title)
  }

  const saveEdit = (id: string) => {
    if (editTitle.trim()) {
      updateList(id, { title: editTitle })
    }
    setEditingId(null)
  }

  const getTaskCountForList = (listId: string) => {
    return tasks.filter((task) => task.listId === listId).length
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          My Lists
        </h2>

        {/* Add List Form */}
        <div className="mb-6 flex gap-2">
          <input
            type="text"
            value={newListTitle}
            onChange={(e) => setNewListTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAddList()
            }}
            placeholder="New list name..."
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
          <button
            onClick={handleAddList}
            className="rounded-lg bg-green-600 px-4 py-2 font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            Add List
          </button>
        </div>

        {/* Lists */}
        {lists.length === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-4 text-center">
            <p className="text-sm text-gray-600">
              No lists yet. Create one to get started!
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {lists.map((list) => (
              <li
                key={list.id}
                className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-4 hover:bg-gray-100"
              >
                {editingId === list.id ? (
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onBlur={() => saveEdit(list.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') saveEdit(list.id)
                      if (e.key === 'Escape') setEditingId(null)
                    }}
                    autoFocus
                    className="flex-1 rounded border border-blue-500 px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <div
                    className="flex-1 cursor-pointer"
                    onDoubleClick={() => startEdit(list.id, list.title)}
                  >
                    <p className="font-medium text-gray-900">{list.title}</p>
                    <p className="text-xs text-gray-600">
                      {getTaskCountForList(list.id)} task
                      {getTaskCountForList(list.id) !== 1 ? 's' : ''}
                    </p>
                  </div>
                )}

                <button
                  onClick={() => deleteList(list.id)}
                  className="ml-4 rounded p-1 text-red-600 hover:bg-red-50"
                  aria-label="Delete list"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
