import { NextRequest, NextResponse } from 'next/server'
import { createOAuth2Client } from '@/lib/google-calendar/config'
import { parseGoogleError } from '@/lib/google-calendar/utils'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const error = searchParams.get('error')

    if (error) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}?error=${error}`
      )
    }

    if (!code) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}?error=missing_code`
      )
    }

    const oauth2Client = createOAuth2Client()
    const { tokens } = await oauth2Client.getToken(code)

    // Encrypt tokens before sending to client
    const encryptedTokens = Buffer.from(JSON.stringify(tokens)).toString('base64')

    // Redirect to app with encrypted tokens
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}?tokens=${encryptedTokens}`
    )
  } catch (error: any) {
    const calendarError = parseGoogleError(error)
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}?error=${calendarError.code}`
    )
  }
} 