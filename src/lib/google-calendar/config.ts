import { OAuth2Client } from 'google-auth-library'
import { google } from 'googleapis'

// Scopes for Google Calendar API
export const SCOPES = [
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/calendar.events',
  'profile',
  'email'
]

// OAuth 2.0 config
export const oauth2Config = {
  clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  redirectUri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback/google`,
  scopes: SCOPES,
}

// Create OAuth2 client
export function createOAuth2Client(): OAuth2Client {
  return new google.auth.OAuth2(
    oauth2Config.clientId,
    oauth2Config.clientSecret,
    oauth2Config.redirectUri
  )
}

// Rate limiting configuration
export const RATE_LIMIT = {
  maxRequests: 100, // Maximum requests per minute
  windowMs: 60 * 1000, // 1 minute
}

// Error codes
export const ERROR_CODES = {
  UNAUTHORIZED: 'UNAUTHORIZED',
  RATE_LIMITED: 'RATE_LIMITED',
  INVALID_TOKEN: 'INVALID_TOKEN',
  NETWORK_ERROR: 'NETWORK_ERROR',
  API_ERROR: 'API_ERROR',
} as const

// Cache configuration
export const CACHE_CONFIG = {
  staleTime: 5 * 60 * 1000, // 5 minutes
  cacheTime: 30 * 60 * 1000, // 30 minutes
  retryDelay: 1000, // 1 second
  maxRetries: 3,
} 