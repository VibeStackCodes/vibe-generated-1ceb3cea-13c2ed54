/**
 * QuickCapture Component
 * Fast, minimalist text input form for capturing tasks
 * - Single-tap text entry
 * - Basic validation
 * - Default to "Inbox" list
 * - Auto-focus for fast capture
 * - Enter key to submit
 */

import { useState, useRef, useEffect } from 'react'
import { useTaskActions, useTaskLists } from '@/hooks/useTask'

interface QuickCaptureProps {
  /**
   * Optional callback after successful task creation
   */
  onTaskCreated?: () => void
  /**
   * Optional CSS classes for customization
   */
  className?: string
}

interface ValidationError {
  field: 'title' | 'list'
  message: string
}

/**
 * Validates the quick capture input
 * @param title The task title to validate
 * @param listId The selected list ID
 * @returns Array of validation errors, empty if valid
 */
function validateInput(title: string, listId: string): ValidationError[] {
  const errors: ValidationError[] = []

  const trimmedTitle = title.trim()
  if (!trimmedTitle) {
    errors.push({
      field: 'title',
      message: 'Task title is required',
    })
  } else if (trimmedTitle.length > 500) {
    errors.push({
      field: 'title',
      message: 'Task title must be less than 500 characters',
    })
  }

  if (!listId) {
    errors.push({
      field: 'list',
      message: 'Please select a list',
    })
  }

  return errors
}

export function QuickCapture({ onTaskCreated, className }: QuickCaptureProps) {
  const lists = useTaskLists()
  const { addTask } = useTaskActions()

  const [title, setTitle] = useState('')
  const [listId, setListId] = useState('')
  const [errors, setErrors] = useState<ValidationError[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const titleInputRef = useRef<HTMLInputElement>(null)

  // Auto-focus the input when component mounts or when lists change
  useEffect(() => {
    if (titleInputRef.current && lists.length > 0) {
      titleInputRef.current.focus()
    }
  }, [lists.length])

  // Set default list on first load
  useEffect(() => {
    if (lists.length > 0 && !listId) {
      // Try to find "Inbox" list, otherwise use first list
      const inboxList = lists.find(list => list.title.toLowerCase() === 'inbox')
      setListId(inboxList?.id || lists[0].id)
    }
  }, [lists, listId])

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value)
    // Clear errors when user starts typing
    if (errors.length > 0) {
      setErrors([])
    }
  }

  const handleListChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setListId(e.target.value)
    // Clear list-related errors
    if (errors.some(err => err.field === 'list')) {
      setErrors(errors.filter(err => err.field !== 'list'))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate input
    const validationErrors = validateInput(title, listId)
    if (validationErrors.length > 0) {
      setErrors(validationErrors)
      return
    }

    try {
      setIsSubmitting(true)
      setErrors([])

      // Create the task
      addTask({
        title: title.trim(),
        listId,
        completed: false,
        priority: 'medium',
        tags: [],
      })

      // Show success message
      setSuccessMessage(`✓ Task added: "${title.trim()}"`)
      setTitle('')

      // Clear success message after 2 seconds
      setTimeout(() => {
        setSuccessMessage('')
      }, 2000)

      // Call optional callback
      onTaskCreated?.()

      // Re-focus the input for fast capture
      titleInputRef.current?.focus()
    } catch (error) {
      setErrors([
        {
          field: 'title',
          message:
            error instanceof Error ? error.message : 'Failed to create task',
        },
      ])
    } finally {
      setIsSubmitting(false)
    }
  }

  if (lists.length === 0) {
    return (
      <div className={`rounded-lg border border-yellow-300 bg-yellow-50 p-4 ${className || ''}`}>
        <p className="text-sm text-yellow-800">
          📋 Create a list first to start capturing tasks
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className={`space-y-3 ${className || ''}`}>
      {/* Quick Capture Input */}
      <div className="space-y-2">
        <div className="flex gap-2">
          <div className="flex-1">
            <input
              ref={titleInputRef}
              type="text"
              value={title}
              onChange={handleTitleChange}
              placeholder="What needs to be done?"
              maxLength={500}
              disabled={isSubmitting}
              className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-base placeholder-gray-400 transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:bg-gray-50 disabled:text-gray-500"
              aria-label="Quick task capture"
              aria-invalid={errors.some(e => e.field === 'title')}
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting || !title.trim()}
            className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white shadow-md transition-all hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-gray-400 disabled:shadow-none"
            aria-label="Submit task"
            style={{
              backgroundColor: !isSubmitting && title.trim() ? '#003D82' : undefined,
            }}
          >
            {isSubmitting ? '⏳' : '✨'}
          </button>
        </div>

        {/* List Selection */}
        {lists.length > 1 && (
          <select
            value={listId}
            onChange={handleListChange}
            disabled={isSubmitting}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:bg-gray-50 disabled:text-gray-500"
            aria-label="Select list for task"
            aria-invalid={errors.some(e => e.field === 'list')}
          >
            {lists.map(list => (
              <option key={list.id} value={list.id}>
                {list.title}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Error Messages */}
      {errors.length > 0 && (
        <div
          className="space-y-2 rounded-lg border border-red-200 bg-red-50 p-3"
          role="alert"
        >
          {errors.map(error => (
            <p key={`${error.field}-${error.message}`} className="text-sm text-red-700">
              ⚠️ {error.message}
            </p>
          ))}
        </div>
      )}

      {/* Success Message */}
      {successMessage && (
        <div
          className="rounded-lg border border-green-200 bg-green-50 p-3"
          role="status"
        >
          <p className="text-sm text-green-700">{successMessage}</p>
        </div>
      )}

      {/* Character Counter */}
      {title.length > 0 && (
        <p className="text-right text-xs text-gray-500">
          {title.length}/500 characters
        </p>
      )}
    </form>
  )
}
