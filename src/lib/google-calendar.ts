import { google } from 'googleapis'
import { OAuth2Client } from 'google-auth-library'

const SCOPES = [
  'https://www.googleapis.com/auth/calendar.readonly',
  'https://www.googleapis.com/auth/calendar.events'
]

export async function getGoogleAuthClient(): Promise<OAuth2Client> {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  )

  return oauth2Client
}

export async function getCalendarClient(auth: OAuth2Client) {
  return google.calendar({ version: 'v3', auth })
}

export async function getAuthUrl(oauth2Client: OAuth2Client): Promise<string> {
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent'
  })
}

export async function getEvents(auth: OAuth2Client, timeMin: Date, timeMax: Date) {
  const calendar = await getCalendarClient(auth)
  
  const response = await calendar.events.list({
    calendarId: 'primary',
    timeMin: timeMin.toISOString(),
    timeMax: timeMax.toISOString(),
    singleEvents: true,
    orderBy: 'startTime',
  })

  return response.data.items
} 