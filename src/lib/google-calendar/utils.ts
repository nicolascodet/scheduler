import { OAuth2Client } from 'google-auth-library'
import { calendar_v3, google } from 'googleapis'
import { CalendarError, GoogleTokens } from '@/types/calendar'
import { ERROR_CODES, createOAuth2Client } from './config'

// Verify and refresh token if needed
export async function verifyToken(tokens: GoogleTokens): Promise<GoogleTokens> {
  const oauth2Client = createOAuth2Client()
  oauth2Client.setCredentials(tokens)

  try {
    // Check if token is expired or will expire soon (within 5 minutes)
    const expiryDate = tokens.expiry_date
    const isExpired = expiryDate ? Date.now() >= expiryDate - 5 * 60 * 1000 : true

    if (isExpired && tokens.refresh_token) {
      const { credentials } = await oauth2Client.refreshAccessToken()
      return credentials as GoogleTokens
    }

    return tokens
  } catch (error) {
    throw createCalendarError(ERROR_CODES.INVALID_TOKEN, 'Failed to verify token')
  }
}

// Create calendar client with authenticated OAuth2 client
export function createCalendarClient(auth: OAuth2Client): calendar_v3.Calendar {
  return google.calendar({ version: 'v3', auth })
}

// Handle API errors
export function createCalendarError(code: keyof typeof ERROR_CODES, message: string, status?: number): CalendarError {
  return {
    code,
    message,
    status,
  }
}

// Parse Google Calendar API errors
export function parseGoogleError(error: any): CalendarError {
  if (error.code === 401) {
    return createCalendarError(ERROR_CODES.UNAUTHORIZED, 'Unauthorized access', 401)
  }
  if (error.code === 429) {
    return createCalendarError(ERROR_CODES.RATE_LIMITED, 'Too many requests', 429)
  }
  if (error.code === 'ENOTFOUND' || error.code === 'ETIMEDOUT') {
    return createCalendarError(ERROR_CODES.NETWORK_ERROR, 'Network error', 503)
  }
  
  return createCalendarError(
    ERROR_CODES.API_ERROR,
    error.message || 'An unknown error occurred',
    error.code
  )
}

// Format date for Google Calendar API
export function formatDateForAPI(date: Date): string {
  return date.toISOString()
}

// Get user's timezone
export function getUserTimeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone
  } catch (error) {
    return 'UTC'
  }
}

// Rate limiting helper
let requestCount = 0
let lastRequestTime = Date.now()

export function checkRateLimit(): boolean {
  const now = Date.now()
  if (now - lastRequestTime >= 60000) {
    requestCount = 0
    lastRequestTime = now
  }
  
  if (requestCount >= 100) { // 100 requests per minute
    return false
  }
  
  requestCount++
  return true
} 