/**
 * Tasks Page
 * Main application page demonstrating task management
 */

import { ListManager } from '@/components/ListManager'
import { TaskForm } from '@/components/TaskForm'
import { TaskList } from '@/components/TaskList'
import { TaskFilters } from '@/components/TaskFilters'
import { QuickCapture } from '@/components/QuickCapture'
import { useFilteredTasks } from '@/hooks/useTask'

export function TasksPage() {
  const tasks = useFilteredTasks()

  const completedCount = tasks.filter((t) => t.completed).length
  const totalCount = tasks.length

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1
            className="text-4xl font-bold text-gray-900"
            style={{ color: '#003D82' }}
          >
            QuietTask
          </h1>
          <p className="mt-2 text-gray-600">
            Fast, minimalist to-do app for capturing and completing work
          </p>
        </div>

        {/* Stats */}
        {totalCount > 0 && (
          <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <p className="text-sm font-medium text-gray-600">Total Tasks</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">
                {totalCount}
              </p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="mt-1 text-2xl font-bold text-green-600">
                {completedCount}
              </p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <p className="text-sm font-medium text-gray-600">Remaining</p>
              <p className="mt-1 text-2xl font-bold text-orange-600">
                {totalCount - completedCount}
              </p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <p className="text-sm font-medium text-gray-600">
                Completion Rate
              </p>
              <p className="mt-1 text-2xl font-bold text-blue-600">
                {totalCount > 0
                  ? Math.round((completedCount / totalCount) * 100)
                  : 0}
                %
              </p>
            </div>
          </div>
        )}

        {/* Quick Capture - Primary Capture Mechanism */}
        <div className="mb-6 rounded-lg border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-6 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <span className="text-2xl">⚡</span>
            <h2 className="text-lg font-semibold text-gray-900">Quick Capture</h2>
          </div>
          <QuickCapture />
        </div>

        {/* Main Content */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column: Lists and Filters */}
          <div className="lg:col-span-1">
            <ListManager />
          </div>

          {/* Right Column: Tasks */}
          <div className="lg:col-span-2 space-y-6">
            {/* Filters */}
            <TaskFilters />

            {/* Advanced Task Form */}
            <div>
              <details className="group cursor-pointer">
                <summary className="text-sm font-medium text-gray-600 hover:text-gray-900">
                  ➕ Advanced Task Form
                </summary>
                <div className="mt-4">
                  <TaskForm />
                </div>
              </details>
            </div>

            {/* Task List */}
            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">
                Tasks
              </h2>
              <TaskList />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
