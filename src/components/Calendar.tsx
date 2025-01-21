import { useState } from 'react'
import WeekView from './WeekView'
import EventsList from './EventsList'

// Temporary mock data
const MOCK_EVENTS = [
  {
    id: '1',
    title: 'Team Meeting',
    startTime: '2024-03-20T10:00:00Z',
    endTime: '2024-03-20T11:00:00Z',
    location: 'Conference Room A',
    color: '#3b82f6'
  },
  {
    id: '2',
    title: 'Lunch with Client',
    startTime: '2024-03-20T12:30:00Z',
    endTime: '2024-03-20T13:30:00Z',
    location: 'Downtown Cafe',
    color: '#10b981'
  }
]

export default function Calendar() {
  const [selectedDate, setSelectedDate] = useState(new Date())

  // Filter events for selected date (to be replaced with actual API call)
  const eventsForDay = MOCK_EVENTS

  return (
    <div className="flex flex-col h-full">
      {/* Month and Year */}
      <div className="px-4 py-2 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">
          {new Intl.DateTimeFormat('en-US', { 
            month: 'long',
            year: 'numeric'
          }).format(selectedDate)}
        </h2>
        <button 
          onClick={() => setSelectedDate(new Date())}
          className="text-sm text-blue-500 font-medium hover:text-blue-600 active:text-blue-700"
        >
          Today
        </button>
      </div>

      {/* Week View */}
      <WeekView 
        selectedDate={selectedDate}
        onDateSelect={setSelectedDate}
      />

      {/* Events List */}
      <div className="flex-1 overflow-y-auto px-4 pt-4">
        <EventsList 
          events={eventsForDay}
          selectedDate={selectedDate}
        />
      </div>
    </div>
  )
} 