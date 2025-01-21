import { z } from 'zod'
import { CalendarEvent } from './calendar'

export type CommandType = 
  | 'query_schedule'
  | 'create_event'
  | 'update_event'
  | 'delete_event'
  | 'suggest_time'
  | 'general_query'

export interface ParsedCommand {
  type: CommandType
  dates?: {
    start?: Date
    end?: Date
  }
  eventId?: string
  eventDetails?: Partial<CalendarEvent>
  query?: string
}

export interface AssistantContext {
  events: CalendarEvent[]
  timezone: string
  userEmail: string
}

export interface AssistantResponse {
  message: string
  command?: ParsedCommand
  suggestedActions?: {
    type: CommandType
    label: string
  }[]
} 