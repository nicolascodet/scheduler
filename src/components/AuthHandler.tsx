'use client'

import { useSearchParams } from 'next/navigation'
import { GoogleTokens } from '@/types/calendar'

interface AuthHandlerProps {
  children: (tokens: GoogleTokens | null) => React.ReactNode
}

export default function AuthHandler({ children }: AuthHandlerProps) {
  const searchParams = useSearchParams()
  const tokensParam = searchParams.get('tokens')
  const errorParam = searchParams.get('error')

  if (errorParam) {
    return (
      <div className="flex flex-col h-[100dvh] items-center justify-center bg-white p-4">
        <div className="text-red-500 mb-4">
          {errorParam === 'access_denied' ? 'Access denied to Google Calendar' :
           errorParam === 'missing_code' ? 'Authorization code missing' :
           errorParam === 'invalid_tokens' ? 'Invalid authorization tokens' :
           'An error occurred during authorization'}
        </div>
        <button
          onClick={() => window.location.href = '/api/auth/google'}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 active:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    )
  }

  if (!tokensParam) {
    return (
      <div className="flex flex-col h-[100dvh] items-center justify-center bg-white p-4">
        <button
          onClick={() => window.location.href = '/api/auth/google'}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 active:bg-blue-700"
        >
          Connect Google Calendar
        </button>
      </div>
    )
  }

  try {
    const tokens = JSON.parse(Buffer.from(tokensParam, 'base64').toString()) as GoogleTokens
    return children(tokens)
  } catch (err) {
    return (
      <div className="flex flex-col h-[100dvh] items-center justify-center bg-white p-4">
        <div className="text-red-500 mb-4">Invalid authorization tokens</div>
        <button
          onClick={() => window.location.href = '/api/auth/google'}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 active:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    )
  }
} 