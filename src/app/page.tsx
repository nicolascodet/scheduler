'use client'

import { Suspense } from 'react'
import Calendar from '@/components/Calendar'
import Chat from '@/components/Chat/Chat'
import { GoogleAuthProvider } from '@/contexts/GoogleAuthContext'
import AuthHandler from '@/components/AuthHandler'

export default function Home() {
  return (
    <Suspense fallback={
      <div className="flex flex-col h-[100dvh] items-center justify-center bg-white p-4">
        <div className="animate-pulse text-gray-500">Loading...</div>
      </div>
    }>
      <AuthHandler>
        {(tokens) => (
          <GoogleAuthProvider initialTokens={tokens}>
            <div className="flex flex-col h-[100dvh] bg-white">
              {/* Fixed Header - accounts for iOS safe area */}
              <header className="fixed top-0 left-0 right-0 bg-white border-b z-10 safe-top">
                <div className="px-4 h-14 flex items-center justify-between max-w-3xl mx-auto">
                  <h1 className="text-lg font-medium text-gray-900">Calendar Optimizer</h1>
                  <button className="p-2 rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </button>
                </div>
              </header>

              {/* Main Content Area - pushes content below header */}
              <main className="flex-1 overflow-hidden pt-14">
                <div className="h-full flex flex-col">
                  {/* Calendar Section */}
                  <div className="flex-none">
                    <Calendar />
                  </div>

                  {/* Chat Section */}
                  <div className="flex-1 min-h-0 border-t">
                    <Chat onError={(error) => console.error(error)} />
                  </div>
                </div>
              </main>
            </div>
          </GoogleAuthProvider>
        )}
      </AuthHandler>
    </Suspense>
  )
}
