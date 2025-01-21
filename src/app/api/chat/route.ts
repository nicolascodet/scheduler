import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createOAuth2Client } from '@/lib/google-calendar/config'
import { verifyToken, createCalendarClient, parseGoogleError, getUserTimeZone } from '@/lib/google-calendar/utils'
import { generateResponse, executeCommand } from '@/lib/assistant/service'
import { startOfDay, endOfDay, addDays, subDays } from 'date-fns'
import { CalendarEvent, CalendarEventSchema } from '@/types/calendar'
import { calendar_v3 } from 'googleapis'

const ChatRequestSchema = z.object({
  message: z.string(),
  tokens: z.object({
    access_token: z.string(),
    refresh_token: z.string().optional(),
    scope: z.string(),
    token_type: z.string(),
    expiry_date: z.number(),
  }),
})

// Transform Google Calendar event to our CalendarEvent type
function transformGoogleEvent(event: calendar_v3.Schema$Event): CalendarEvent {
  return CalendarEventSchema.parse({
    id: event.id || '',
    summary: event.summary || '',
    description: event.description,
    location: event.location,
    start: {
      dateTime: event.start?.dateTime || new Date().toISOString(),
      timeZone: event.start?.timeZone || getUserTimeZone(),
    },
    end: {
      dateTime: event.end?.dateTime || new Date().toISOString(),
      timeZone: event.end?.timeZone || getUserTimeZone(),
    },
    status: event.status || 'confirmed',
    created: event.created || new Date().toISOString(),
    updated: event.updated || new Date().toISOString(),
    creator: {
      email: event.creator?.email || '',
      self: event.creator?.self,
    },
    attendees: event.attendees?.map(attendee => ({
      email: attendee.email || '',
      responseStatus: (attendee.responseStatus as 'needsAction' | 'declined' | 'tentative' | 'accepted') || 'needsAction',
      self: attendee.self,
    })),
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, tokens } = ChatRequestSchema.parse(body)

    // Verify and refresh token if needed
    const verifiedTokens = await verifyToken(tokens)
    
    // Create calendar client
    const oauth2Client = createOAuth2Client()
    oauth2Client.setCredentials(verifiedTokens)
    const calendar = createCalendarClient(oauth2Client)

    // Fetch recent and upcoming events for context
    const now = new Date()
    const [recentEvents, upcomingEvents] = await Promise.all([
      calendar.events.list({
        calendarId: 'primary',
        timeMin: startOfDay(subDays(now, 7)).toISOString(),
        timeMax: now.toISOString(),
        singleEvents: true,
        orderBy: 'startTime',
      }),
      calendar.events.list({
        calendarId: 'primary',
        timeMin: now.toISOString(),
        timeMax: endOfDay(addDays(now, 14)).toISOString(),
        singleEvents: true,
        orderBy: 'startTime',
      }),
    ])

    // Transform Google Calendar events to our type
    const transformedEvents = [
      ...(recentEvents.data.items || []),
      ...(upcomingEvents.data.items || []),
    ].map(transformGoogleEvent)

    // Create context for the assistant
    const context = {
      events: transformedEvents,
      timezone: getUserTimeZone(),
      userEmail: verifiedTokens.scope.includes('email') ? 
        (await oauth2Client.getTokenInfo(verifiedTokens.access_token)).email || '' : '',
    }

    // Generate assistant response
    const response = await generateResponse(message, context)

    // Execute command if present
    if (response.command) {
      const result = await executeCommand(response.command, context, {
        createEvent: (event: any) => calendar.events.insert({
          calendarId: 'primary',
          requestBody: event,
        }),
        updateEvent: (event: any) => calendar.events.patch({
          calendarId: 'primary',
          eventId: event.id,
          requestBody: event,
        }),
        deleteEvent: (eventId: string) => calendar.events.delete({
          calendarId: 'primary',
          eventId,
        }),
      })

      // Update response message if command execution failed
      if (!result.success) {
        response.message = result.message
      }
    }

    return NextResponse.json(response)
  } catch (error: any) {
    const calendarError = parseGoogleError(error)
    return NextResponse.json(
      { error: calendarError.message },
      { status: calendarError.status || 500 }
    )
  }
} 