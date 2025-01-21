import { z } from 'zod'

export const CalendarEventSchema = z.object({
  id: z.string(),
  summary: z.string(),
  description: z.string().optional(),
  location: z.string().optional(),
  start: z.object({
    dateTime: z.string(),
    timeZone: z.string(),
  }),
  end: z.object({
    dateTime: z.string(),
    timeZone: z.string(),
  }),
  colorId: z.string().optional(),
  status: z.enum(['confirmed', 'tentative', 'cancelled']),
  created: z.string(),
  updated: z.string(),
  creator: z.object({
    email: z.string(),
    self: z.boolean().optional(),
  }),
  attendees: z.array(z.object({
    email: z.string(),
    responseStatus: z.enum(['needsAction', 'declined', 'tentative', 'accepted']),
    self: z.boolean().optional(),
  })).optional(),
})

export type CalendarEvent = z.infer<typeof CalendarEventSchema>

export interface CalendarError {
  code: string
  message: string
  status?: number
}

export interface CalendarState {
  events: CalendarEvent[]
  isLoading: boolean
  error: CalendarError | null
  lastSynced: Date | null
}

export interface GoogleTokens {
  access_token: string
  refresh_token?: string
  scope: string
  token_type: string
  expiry_date: number
}

export interface SyncResponse {
  events: CalendarEvent[]
  nextSyncToken?: string
} 