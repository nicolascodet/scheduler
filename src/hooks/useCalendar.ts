import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { startOfDay, endOfDay, format } from 'date-fns'
import { CalendarEvent, GoogleTokens } from '@/types/calendar'

interface UseCalendarOptions {
  tokens: GoogleTokens
  selectedDate: Date
}

interface CalendarApi {
  fetchEvents: (timeMin: string, timeMax: string, syncToken?: string) => Promise<{
    events: CalendarEvent[]
    nextSyncToken?: string
  }>
  createEvent: (event: Partial<CalendarEvent>) => Promise<CalendarEvent>
  updateEvent: (event: Partial<CalendarEvent>) => Promise<CalendarEvent>
  deleteEvent: (eventId: string) => Promise<void>
}

// API functions
const createCalendarApi = (tokens: GoogleTokens): CalendarApi => {
  const headers = {
    'Authorization': `Bearer ${JSON.stringify(tokens)}`,
    'Content-Type': 'application/json',
  }

  return {
    async fetchEvents(timeMin, timeMax, syncToken) {
      const params = new URLSearchParams({ timeMin, timeMax })
      if (syncToken) params.append('syncToken', syncToken)
      
      const response = await fetch(`/api/calendar/events?${params}`, { headers })
      if (!response.ok) throw new Error('Failed to fetch events')
      return response.json()
    },

    async createEvent(event) {
      const response = await fetch('/api/calendar/events', {
        method: 'POST',
        headers,
        body: JSON.stringify(event),
      })
      if (!response.ok) throw new Error('Failed to create event')
      return response.json()
    },

    async updateEvent(event) {
      const response = await fetch('/api/calendar/events', {
        method: 'PATCH',
        headers,
        body: JSON.stringify(event),
      })
      if (!response.ok) throw new Error('Failed to update event')
      return response.json()
    },

    async deleteEvent(eventId) {
      const response = await fetch(`/api/calendar/events?eventId=${eventId}`, {
        method: 'DELETE',
        headers,
      })
      if (!response.ok) throw new Error('Failed to delete event')
    },
  }
}

export function useCalendar({ tokens, selectedDate }: UseCalendarOptions) {
  const queryClient = useQueryClient()
  const api = createCalendarApi(tokens)

  // Query for fetching events
  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['calendar', format(selectedDate, 'yyyy-MM-dd')],
    queryFn: async () => {
      const timeMin = startOfDay(selectedDate).toISOString()
      const timeMax = endOfDay(selectedDate).toISOString()
      return api.fetchEvents(timeMin, timeMax)
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  })

  // Mutation for creating events
  const createEventMutation = useMutation({
    mutationFn: api.createEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar'] })
    },
  })

  // Mutation for updating events
  const updateEventMutation = useMutation({
    mutationFn: api.updateEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar'] })
    },
  })

  // Mutation for deleting events
  const deleteEventMutation = useMutation({
    mutationFn: api.deleteEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar'] })
    },
  })

  return {
    events: data?.events ?? [],
    isLoading,
    error,
    refetch,
    createEvent: createEventMutation.mutate,
    updateEvent: updateEventMutation.mutate,
    deleteEvent: deleteEventMutation.mutate,
    isCreating: createEventMutation.isPending,
    isUpdating: updateEventMutation.isPending,
    isDeleting: deleteEventMutation.isPending,
  }
} 