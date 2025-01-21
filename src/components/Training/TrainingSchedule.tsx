'use client'

import { useState } from 'react'
import { format, startOfWeek, addDays, isSameDay } from 'date-fns'
import { TrainingPlan, TrainingSession, TrainingType } from '@/types/training'

interface TrainingScheduleProps {
  plan: TrainingPlan | null
  sessions: TrainingSession[]
  onSessionClick: (session: TrainingSession) => void
  onAddSession: (date: Date) => void
}

const trainingTypeColors: Record<TrainingType, string> = {
  run: 'bg-blue-100 text-blue-800',
  cross_train: 'bg-purple-100 text-purple-800',
  rest: 'bg-gray-100 text-gray-800',
  race: 'bg-red-100 text-red-800',
  strength: 'bg-green-100 text-green-800',
  recovery: 'bg-yellow-100 text-yellow-800',
}

export default function TrainingSchedule({
  plan,
  sessions,
  onSessionClick,
  onAddSession,
}: TrainingScheduleProps) {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const weekStart = startOfWeek(selectedDate)

  // Generate week days
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  // Get sessions for the current week
  const weekSessions = sessions.filter(session => {
    const sessionDate = new Date(session.date)
    return weekDays.some(day => isSameDay(day, sessionDate))
  })

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Week Navigation */}
      <div className="flex items-center justify-between p-4 border-b">
        <button
          onClick={() => setSelectedDate(addDays(selectedDate, -7))}
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 className="text-lg font-semibold">
          {format(weekStart, 'MMM d')} - {format(addDays(weekStart, 6), 'MMM d, yyyy')}
        </h2>
        <button
          onClick={() => setSelectedDate(addDays(selectedDate, 7))}
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Week Grid */}
      <div className="grid grid-cols-7 gap-px bg-gray-200">
        {weekDays.map(day => {
          const daySessions = weekSessions.filter(session => 
            isSameDay(new Date(session.date), day)
          )

          return (
            <div
              key={day.toISOString()}
              className="min-h-[150px] bg-white p-2"
            >
              <div className="text-sm font-medium mb-1">
                {format(day, 'EEE')}
                <span className="ml-1 text-gray-500">{format(day, 'd')}</span>
              </div>
              
              {daySessions.map(session => (
                <div
                  key={session.id}
                  onClick={() => onSessionClick(session)}
                  className={`
                    ${trainingTypeColors[session.type]}
                    p-2 mb-1 rounded cursor-pointer text-sm
                    ${session.completed ? 'opacity-50' : ''}
                  `}
                >
                  <div className="font-medium">{session.type}</div>
                  {session.distance && (
                    <div className="text-xs">{session.distance}km</div>
                  )}
                  {session.duration && (
                    <div className="text-xs">{session.duration}min</div>
                  )}
                </div>
              ))}

              <button
                onClick={() => onAddSession(day)}
                className="w-full mt-1 p-1 text-xs text-gray-500 hover:bg-gray-50 rounded"
              >
                + Add
              </button>
            </div>
          )
        })}
      </div>

      {/* Training Plan Info */}
      {plan && (
        <div className="p-4 border-t">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium">{plan.title}</h3>
            <span className="text-sm text-gray-500">
              {format(new Date(plan.startDate), 'MMM d')} - {format(new Date(plan.endDate), 'MMM d')}
            </span>
          </div>
          <div className="text-sm text-gray-600">
            <div>Goal: {plan.goal.title}</div>
            <div>Progress: {plan.goal.progress}%</div>
          </div>
        </div>
      )}
    </div>
  )
} 