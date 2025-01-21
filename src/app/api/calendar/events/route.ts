import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { CalendarEventSchema } from '@/types/calendar'
import { createOAuth2Client } from '@/lib/google-calendar/config'
import { verifyToken, createCalendarClient, parseGoogleError, checkRateLimit, getUserTimeZone } from '@/lib/google-calendar/utils'

// Request validation schemas
const GetEventsQuerySchema = z.object({
  timeMin: z.string(),
  timeMax: z.string(),
  syncToken: z.string().optional(),
})

const CreateEventSchema = CalendarEventSchema.omit({
  id: true,
  created: true,
  updated: true,
  creator: true,
})

const UpdateEventSchema = CalendarEventSchema.partial()

// Error response helper
function errorResponse(status: number, message: string) {
  return NextResponse.json({ error: message }, { status })
}

// Rate limit check
function checkRateLimitResponse() {
  if (!checkRateLimit()) {
    return errorResponse(429, 'Too many requests')
  }
  return null
}

export async function GET(request: NextRequest) {
  const rateLimitResponse = checkRateLimitResponse()
  if (rateLimitResponse) return rateLimitResponse

  try {
    const { searchParams } = new URL(request.url)
    const query = GetEventsQuerySchema.parse({
      timeMin: searchParams.get('timeMin'),
      timeMax: searchParams.get('timeMax'),
      syncToken: searchParams.get('syncToken'),
    })

    const authHeader = request.headers.get('Authorization')
    if (!authHeader) {
      return errorResponse(401, 'Missing authorization header')
    }

    const tokens = JSON.parse(authHeader.replace('Bearer ', ''))
    const verifiedTokens = await verifyToken(tokens)
    
    const oauth2Client = createOAuth2Client()
    oauth2Client.setCredentials(verifiedTokens)
    
    const calendar = createCalendarClient(oauth2Client)
    
    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: query.timeMin,
      timeMax: query.timeMax,
      syncToken: query.syncToken,
      singleEvents: true,
      orderBy: 'startTime',
    })

    return NextResponse.json({
      events: response.data.items,
      nextSyncToken: response.data.nextSyncToken,
    })
  } catch (error: any) {
    const calendarError = parseGoogleError(error)
    return errorResponse(calendarError.status || 500, calendarError.message)
  }
}

export async function POST(request: NextRequest) {
  const rateLimitResponse = checkRateLimitResponse()
  if (rateLimitResponse) return rateLimitResponse

  try {
    const body = await request.json()
    const event = CreateEventSchema.parse(body)

    const authHeader = request.headers.get('Authorization')
    if (!authHeader) {
      return errorResponse(401, 'Missing authorization header')
    }

    const tokens = JSON.parse(authHeader.replace('Bearer ', ''))
    const verifiedTokens = await verifyToken(tokens)
    
    const oauth2Client = createOAuth2Client()
    oauth2Client.setCredentials(verifiedTokens)
    
    const calendar = createCalendarClient(oauth2Client)
    
    const response = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: {
        ...event,
        start: { ...event.start, timeZone: getUserTimeZone() },
        end: { ...event.end, timeZone: getUserTimeZone() },
      },
    })

    return NextResponse.json(response.data)
  } catch (error: any) {
    const calendarError = parseGoogleError(error)
    return errorResponse(calendarError.status || 500, calendarError.message)
  }
}

export async function PATCH(request: NextRequest) {
  const rateLimitResponse = checkRateLimitResponse()
  if (rateLimitResponse) return rateLimitResponse

  try {
    const body = await request.json()
    const { id, ...updates } = UpdateEventSchema.parse(body)

    if (!id) {
      return errorResponse(400, 'Missing event ID')
    }

    const authHeader = request.headers.get('Authorization')
    if (!authHeader) {
      return errorResponse(401, 'Missing authorization header')
    }

    const tokens = JSON.parse(authHeader.replace('Bearer ', ''))
    const verifiedTokens = await verifyToken(tokens)
    
    const oauth2Client = createOAuth2Client()
    oauth2Client.setCredentials(verifiedTokens)
    
    const calendar = createCalendarClient(oauth2Client)
    
    const response = await calendar.events.patch({
      calendarId: 'primary',
      eventId: id,
      requestBody: updates,
    })

    return NextResponse.json(response.data)
  } catch (error: any) {
    const calendarError = parseGoogleError(error)
    return errorResponse(calendarError.status || 500, calendarError.message)
  }
}

export async function DELETE(request: NextRequest) {
  const rateLimitResponse = checkRateLimitResponse()
  if (rateLimitResponse) return rateLimitResponse

  try {
    const { searchParams } = new URL(request.url)
    const eventId = searchParams.get('eventId')

    if (!eventId) {
      return errorResponse(400, 'Missing event ID')
    }

    const authHeader = request.headers.get('Authorization')
    if (!authHeader) {
      return errorResponse(401, 'Missing authorization header')
    }

    const tokens = JSON.parse(authHeader.replace('Bearer ', ''))
    const verifiedTokens = await verifyToken(tokens)
    
    const oauth2Client = createOAuth2Client()
    oauth2Client.setCredentials(verifiedTokens)
    
    const calendar = createCalendarClient(oauth2Client)
    
    await calendar.events.delete({
      calendarId: 'primary',
      eventId,
    })

    return new NextResponse(null, { status: 204 })
  } catch (error: any) {
    const calendarError = parseGoogleError(error)
    return errorResponse(calendarError.status || 500, calendarError.message)
  }
} 