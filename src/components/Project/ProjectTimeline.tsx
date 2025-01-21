'use client'

import { useState } from 'react'
import { format, isAfter, isBefore, isWithinInterval } from 'date-fns'
import { Project, Task, TaskStatus, Milestone } from '@/types/project'

interface ProjectTimelineProps {
  project: Project
  onTaskClick: (task: Task) => void
  onMilestoneClick: (milestone: Milestone) => void
  onStatusChange: (taskId: string, status: TaskStatus) => void
}

const statusColors: Record<TaskStatus, string> = {
  backlog: 'bg-gray-100 text-gray-800',
  todo: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-yellow-100 text-yellow-800',
  review: 'bg-purple-100 text-purple-800',
  done: 'bg-green-100 text-green-800',
}

export default function ProjectTimeline({
  project,
  onTaskClick,
  onMilestoneClick,
  onStatusChange,
}: ProjectTimelineProps) {
  const [selectedStatus, setSelectedStatus] = useState<TaskStatus | 'all'>('all')

  // Filter tasks based on selected status
  const filteredTasks = project.tasks.filter(task => 
    selectedStatus === 'all' || task.status === selectedStatus
  )

  // Group tasks by status for Kanban view
  const tasksByStatus = filteredTasks.reduce((acc, task) => {
    if (!acc[task.status]) {
      acc[task.status] = []
    }
    acc[task.status].push(task)
    return acc
  }, {} as Record<TaskStatus, Task[]>)

  // Sort milestones by due date
  const sortedMilestones = [...project.milestones].sort((a, b) => 
    new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  )

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Project Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold">{project.title}</h2>
          <span className="text-sm text-gray-500">
            {format(new Date(project.startDate), 'MMM d')} - {format(new Date(project.endDate), 'MMM d')}
          </span>
        </div>
        <div className="text-sm text-gray-600">{project.description}</div>
      </div>

      {/* Status Filter */}
      <div className="p-4 border-b flex gap-2">
        <button
          onClick={() => setSelectedStatus('all')}
          className={`px-3 py-1 rounded text-sm ${
            selectedStatus === 'all' ? 'bg-gray-200' : 'hover:bg-gray-100'
          }`}
        >
          All
        </button>
        {Object.keys(statusColors).map(status => (
          <button
            key={status}
            onClick={() => setSelectedStatus(status as TaskStatus)}
            className={`px-3 py-1 rounded text-sm ${
              selectedStatus === status ? 'bg-gray-200' : 'hover:bg-gray-100'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Kanban Board */}
      <div className="p-4 grid grid-cols-5 gap-4">
        {Object.entries(tasksByStatus).map(([status, tasks]) => (
          <div key={status} className="bg-gray-50 rounded p-2">
            <h3 className="font-medium mb-2 text-sm">
              {status.charAt(0).toUpperCase() + status.slice(1)}
              <span className="ml-2 text-gray-500">({tasks.length})</span>
            </h3>
            <div className="space-y-2">
              {tasks.map(task => (
                <div
                  key={task.id}
                  onClick={() => onTaskClick(task)}
                  className={`
                    ${statusColors[task.status]}
                    p-3 rounded shadow-sm cursor-pointer
                  `}
                >
                  <div className="font-medium text-sm">{task.title}</div>
                  {task.dueDate && (
                    <div className="text-xs mt-1">
                      Due: {format(new Date(task.dueDate), 'MMM d')}
                    </div>
                  )}
                  <div className="flex items-center mt-2">
                    <div className="h-1 flex-1 bg-gray-200 rounded">
                      <div
                        className="h-1 bg-blue-500 rounded"
                        style={{ width: `${task.progress}%` }}
                      />
                    </div>
                    <span className="ml-2 text-xs">{task.progress}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Milestones Timeline */}
      <div className="border-t p-4">
        <h3 className="font-medium mb-4">Milestones</h3>
        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-4 top-0 bottom-0 w-px bg-gray-200" />
          
          {/* Milestones */}
          <div className="space-y-4">
            {sortedMilestones.map(milestone => {
              const dueDate = new Date(milestone.dueDate)
              const isOverdue = isAfter(new Date(), dueDate) && milestone.status !== 'completed'
              
              return (
                <div
                  key={milestone.id}
                  onClick={() => onMilestoneClick(milestone)}
                  className="relative pl-8 cursor-pointer"
                >
                  {/* Timeline Dot */}
                  <div
                    className={`
                      absolute left-3 top-1.5 w-3 h-3 rounded-full
                      ${milestone.status === 'completed' ? 'bg-green-500' : 
                        isOverdue ? 'bg-red-500' : 'bg-blue-500'}
                    `}
                  />
                  
                  <div className={`
                    p-3 rounded
                    ${milestone.status === 'completed' ? 'bg-green-50' :
                      isOverdue ? 'bg-red-50' : 'bg-blue-50'}
                  `}>
                    <div className="font-medium">{milestone.title}</div>
                    <div className="text-sm text-gray-600 mt-1">
                      Due: {format(dueDate, 'MMM d, yyyy')}
                    </div>
                    {milestone.description && (
                      <div className="text-sm mt-1">{milestone.description}</div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
} 