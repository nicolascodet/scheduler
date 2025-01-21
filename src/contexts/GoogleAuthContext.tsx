'use client'

import { createContext, useContext, ReactNode, useState } from 'react'
import { GoogleTokens } from '@/types/calendar'

interface GoogleAuthContextType {
  tokens: GoogleTokens | null
  setTokens: (tokens: GoogleTokens | null) => void
}

const GoogleAuthContext = createContext<GoogleAuthContextType | null>(null)

export function useGoogleAuth() {
  const context = useContext(GoogleAuthContext)
  if (!context) {
    throw new Error('useGoogleAuth must be used within a GoogleAuthProvider')
  }
  return context
}

interface GoogleAuthProviderProps {
  children: ReactNode
  initialTokens?: GoogleTokens | null
}

export function GoogleAuthProvider({ children, initialTokens = null }: GoogleAuthProviderProps) {
  const [tokens, setTokens] = useState<GoogleTokens | null>(initialTokens)

  return (
    <GoogleAuthContext.Provider value={{ tokens, setTokens }}>
      {children}
    </GoogleAuthContext.Provider>
  )
} 