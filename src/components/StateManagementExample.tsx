/**
 * StateManagementExample Component
 * Demonstrates comprehensive usage of the task state management system
 * Shows all major hooks and utilities in action
 */

import { useState } from 'react'
import {
  useTask,
  useTasks,
  useTaskLists,
  useTaskActions,
  useTaskStatistics,
  useGroupedTasks,
  useDerivedTaskState,
  useTaskSearch,
  useCompletionTrend,
} from '@/hooks'

export function StateManagementExample() {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'statistics' | 'search' | 'grouped'
  >('overview')
  const [searchQuery, setSearchQuery] = useState('')

  // Core hooks
  const { state } = useTask()
  const tasks = useTasks()
  const lists = useTaskLists()
  const { isLoading } = useTask()

  // Advanced hooks
  const statistics = useTaskStatistics()
  const derivedState = useDerivedTaskState()
  const grouped = useGroupedTasks('priority')
  const searchResults = useTaskSearch(searchQuery)
  const completionTrend = useCompletionTrend()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-gray-600">Loading state management...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <div className="rounded-lg bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-2xl font-bold text-gray-900">
          State Management Overview
        </h2>

        {/* Tab Navigation */}
        <div className="mb-6 flex gap-2 border-b border-gray-200">
          {(
            [
              'overview',
              'statistics',
              'search',
              'grouped',
            ] as const
          ).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === tab
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <div className="rounded-lg bg-blue-50 p-4">
                <p className="text-sm text-gray-600">Total Tasks</p>
                <p className="text-2xl font-bold text-blue-600">{tasks.length}</p>
              </div>
              <div className="rounded-lg bg-green-50 p-4">
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">
                  {derivedState.completedTasks.length}
                </p>
              </div>
              <div className="rounded-lg bg-orange-50 p-4">
                <p className="text-sm text-gray-600">Active</p>
                <p className="text-2xl font-bold text-orange-600">
                  {derivedState.activeTasks.length}
                </p>
              </div>
              <div className="rounded-lg bg-red-50 p-4">
                <p className="text-sm text-gray-600">Overdue</p>
                <p className="text-2xl font-bold text-red-600">
                  {derivedState.overdueTasks.length}
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-2">
              <h3 className="font-semibold text-gray-900">State Structure</h3>
              <div className="rounded-lg bg-gray-50 p-4 font-mono text-sm">
                <p>
                  <span className="font-semibold">Lists:</span> {lists.length}
                </p>
                <p>
                  <span className="font-semibold">Tasks:</span> {tasks.length}
                </p>
                <p>
                  <span className="font-semibold">Filter:</span>{' '}
                  {Object.keys(state.filter).length === 0
                    ? 'None'
                    : Object.entries(state.filter)
                        .map(([k, v]) => `${k}: ${v}`)
                        .join(', ')}
                </p>
                <p>
                  <span className="font-semibold">Sort:</span> {state.sort.sortBy} (
                  {state.sort.order})
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Statistics Tab */}
        {activeTab === 'statistics' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="rounded-lg bg-gray-50 p-4">
                <h4 className="mb-3 font-semibold text-gray-900">
                  Completion Stats
                </h4>
                <div className="space-y-2 font-mono text-sm">
                  <p>
                    <span className="text-gray-600">Completion %:</span>{' '}
                    <span className="font-semibold">
                      {statistics.completionPercentage.toFixed(1)}%
                    </span>
                  </p>
                  <p>
                    <span className="text-gray-600">Pending:</span>{' '}
                    <span className="font-semibold">{statistics.pending}</span>
                  </p>
                  <p>
                    <span className="text-gray-600">Overdue:</span>{' '}
                    <span className="font-semibold text-red-600">
                      {statistics.overdue}
                    </span>
                  </p>
                  <p>
                    <span className="text-gray-600">Due Today:</span>{' '}
                    <span className="font-semibold text-orange-600">
                      {statistics.dueToday}
                    </span>
                  </p>
                  <p>
                    <span className="text-gray-600">Due Soon:</span>{' '}
                    <span className="font-semibold text-yellow-600">
                      {statistics.dueSoon}
                    </span>
                  </p>
                </div>
              </div>

              <div className="rounded-lg bg-gray-50 p-4">
                <h4 className="mb-3 font-semibold text-gray-900">
                  By Priority
                </h4>
                <div className="space-y-2 font-mono text-sm">
                  <p>
                    <span className="text-gray-600">High:</span>{' '}
                    <span className="font-semibold text-red-600">
                      {statistics.byPriority.high}
                    </span>
                  </p>
                  <p>
                    <span className="text-gray-600">Medium:</span>{' '}
                    <span className="font-semibold text-yellow-600">
                      {statistics.byPriority.medium}
                    </span>
                  </p>
                  <p>
                    <span className="text-gray-600">Low:</span>{' '}
                    <span className="font-semibold text-green-600">
                      {statistics.byPriority.low}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-gray-50 p-4">
              <h4 className="mb-3 font-semibold text-gray-900">
                Completion Trend
              </h4>
              <div className="space-y-2 font-mono text-sm">
                <p>
                  <span className="text-gray-600">Last 7 days:</span>{' '}
                  <span className="font-semibold">
                    {completionTrend.last7Days}
                  </span>
                </p>
                <p>
                  <span className="text-gray-600">Last 30 days:</span>{' '}
                  <span className="font-semibold">
                    {completionTrend.last30Days}
                  </span>
                </p>
                <p>
                  <span className="text-gray-600">Last 90 days:</span>{' '}
                  <span className="font-semibold">
                    {completionTrend.last90Days}
                  </span>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Search Tab */}
        {activeTab === 'search' && (
          <div className="space-y-4">
            <div>
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                Found {searchResults.length} task(s)
              </p>
              <div className="space-y-2">
                {searchResults.length === 0 ? (
                  <p className="rounded-lg border border-dashed border-gray-300 p-4 text-center text-gray-500">
                    No tasks match your search
                  </p>
                ) : (
                  searchResults.map((task) => (
                    <div
                      key={task.id}
                      className="rounded-lg border border-gray-200 bg-gray-50 p-3"
                    >
                      <p className="font-medium text-gray-900">{task.title}</p>
                      <p className="text-xs text-gray-600">
                        Priority: {task.priority} | Completed:{' '}
                        {task.completed ? 'Yes' : 'No'}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Grouped Tab */}
        {activeTab === 'grouped' && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">Tasks grouped by priority</p>
            {Object.entries(grouped).length === 0 ? (
              <p className="rounded-lg border border-dashed border-gray-300 p-4 text-center text-gray-500">
                No tasks to display
              </p>
            ) : (
              Object.entries(grouped).map(([priority, priorityTasks]) => (
                <div key={priority} className="rounded-lg bg-gray-50 p-4">
                  <h4 className="mb-2 font-semibold text-gray-900">
                    {priority.charAt(0).toUpperCase() + priority.slice(1)} (
                    {priorityTasks.length})
                  </h4>
                  <ul className="space-y-1">
                    {priorityTasks.map((task) => (
                      <li
                        key={task.id}
                        className={`text-sm ${
                          task.completed
                            ? 'line-through text-gray-400'
                            : 'text-gray-700'
                        }`}
                      >
                        {task.title}
                      </li>
                    ))}
                  </ul>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Debug Info */}
      <div className="rounded-lg bg-gray-100 p-6">
        <h3 className="mb-3 font-semibold text-gray-900">Debug Information</h3>
        <pre className="overflow-auto rounded-lg bg-gray-800 p-4 text-xs text-gray-100">
          {JSON.stringify(
            {
              tasksCount: tasks.length,
              listsCount: lists.length,
              statistics: {
                total: statistics.total,
                completed: statistics.completed,
                pending: statistics.pending,
              },
              filter: state.filter,
              sort: state.sort,
            },
            null,
            2
          )}
        </pre>
      </div>
    </div>
  )
}
