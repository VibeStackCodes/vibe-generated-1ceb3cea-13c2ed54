/**
 * TaskFilters Component
 * Filter and sort tasks
 */

import { useTaskFilter, useTaskSort } from '@/hooks/useTask'
import type { TaskPriority, TaskSortBy, SortOrder } from '@/types/task'

export function TaskFilters() {
  const { filter, setFilter } = useTaskFilter()
  const { sort, setSort } = useTaskSort()

  const handlePriorityChange = (priority: TaskPriority | '') => {
    setFilter({
      ...filter,
      priority: priority === '' ? undefined : priority,
    })
  }

  const handleCompletedChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const value = e.target.value
    setFilter({
      ...filter,
      completed: value === '' ? undefined : value === 'completed',
    })
  }

  const handleSortByChange = (sortBy: TaskSortBy) => {
    setSort({ ...sort, sortBy })
  }

  const handleSortOrderChange = (order: SortOrder) => {
    setSort({ ...sort, order })
  }

  const handleResetFilters = () => {
    setFilter({})
    setSort({ sortBy: 'dueDate', order: 'asc' })
  }

  return (
    <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Filters & Sort</h2>
        <button
          onClick={handleResetFilters}
          className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
        >
          Reset
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Priority Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Priority
          </label>
          <select
            value={filter.priority || ''}
            onChange={(e) => handlePriorityChange(e.target.value as TaskPriority | '')}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="">All Priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Status
          </label>
          <select
            value={
              filter.completed === undefined
                ? ''
                : filter.completed
                  ? 'completed'
                  : 'incomplete'
            }
            onChange={handleCompletedChange}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="">All Tasks</option>
            <option value="incomplete">Incomplete</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        {/* Sort By */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Sort By
          </label>
          <select
            value={sort.sortBy}
            onChange={(e) => handleSortByChange(e.target.value as TaskSortBy)}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="dueDate">Due Date</option>
            <option value="priority">Priority</option>
            <option value="createdAt">Created Date</option>
            <option value="title">Title</option>
          </select>
        </div>

        {/* Sort Order */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Order
          </label>
          <select
            value={sort.order}
            onChange={(e) => handleSortOrderChange(e.target.value as SortOrder)}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </div>
      </div>
    </div>
  )
}
