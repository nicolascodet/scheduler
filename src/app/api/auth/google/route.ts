import { NextRequest, NextResponse } from 'next/server'
import { createOAuth2Client } from '@/lib/google-calendar/config'

export async function GET(request: NextRequest) {
  try {
    const oauth2Client = createOAuth2Client()
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: [
        'https://www.googleapis.com/auth/calendar',
        'https://www.googleapis.com/auth/calendar.events',
        'profile',
        'email'
      ],
      prompt: 'consent'
    })

    return NextResponse.redirect(authUrl)
  } catch (error: any) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}?error=auth_error`
    )
  }
} 