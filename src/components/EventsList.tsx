import { format, parseISO } from 'date-fns'

interface Event {
  id: string
  title: string
  startTime: string // ISO string
  endTime: string // ISO string
  location?: string
  color?: string
}

interface EventsListProps {
  events: Event[]
  selectedDate: Date
}

export default function EventsList({ events, selectedDate }: EventsListProps) {
  // Sort events by start time
  const sortedEvents = [...events].sort((a, b) => 
    parseISO(a.startTime).getTime() - parseISO(b.startTime).getTime()
  )

  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-gray-500">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <p className="text-center">No events scheduled for {format(selectedDate, 'MMMM d')}</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {sortedEvents.map((event) => (
        <div
          key={event.id}
          className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 transition-transform active:scale-[0.99]"
        >
          <div className="flex items-start gap-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-gray-900 truncate">{event.title}</h3>
              <div className="mt-1 flex items-center text-sm text-gray-500">
                <span className="truncate">
                  {format(parseISO(event.startTime), 'h:mm a')} - {format(parseISO(event.endTime), 'h:mm a')}
                </span>
              </div>
              {event.location && (
                <div className="mt-1 flex items-center text-sm text-gray-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="truncate">{event.location}</span>
                </div>
              )}
            </div>
            <div 
              className="w-1 h-full min-h-[3rem] rounded-full" 
              style={{ backgroundColor: event.color || '#3b82f6' }}
            />
          </div>
        </div>
      ))}
    </div>
  )
} 