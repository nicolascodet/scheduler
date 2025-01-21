'use client'

import { Suspense } from 'react'
import Calendar from '@/components/Calendar'
import Chat from '@/components/Chat/Chat'
import { GoogleAuthProvider } from '@/contexts/GoogleAuthContext'
import AuthHandler from '@/components/AuthHandler'

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to Calendar Assistant
        </h1>
        <p className="text-lg text-gray-600">
          Your smart scheduling companion is coming soon.
        </p>
      </div>
    </div>
  )
}
