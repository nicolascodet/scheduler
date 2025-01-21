'use client'

import { useState } from 'react'
import Calendar from '@/components/Calendar'
import Chat from '@/components/Chat/Chat'
import { ChatMessage } from '@/types/chat'

// Mock initial message
const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: '1',
    content: "Hello! I'm your calendar assistant. How can I help you optimize your schedule today?",
    role: 'assistant',
    timestamp: new Date(),
    status: 'sent'
  }
]

export default function Home() {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES)
  const [isLoading, setIsLoading] = useState(false)

  const handleSendMessage = async (content: string) => {
    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content,
      role: 'user',
      timestamp: new Date(),
      status: 'sent'
    }
    setMessages(prev => [...prev, userMessage])
    
    // TODO: Implement actual Claude API call
    setIsLoading(true)
    await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API delay
    
    // Add assistant response
    const assistantMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      content: "I'm still being configured to respond properly. Check back soon!",
      role: 'assistant',
      timestamp: new Date(),
      status: 'sent'
    }
    setMessages(prev => [...prev, assistantMessage])
    setIsLoading(false)
  }

  return (
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
            <Chat
              messages={messages}
              isLoading={isLoading}
              onSendMessage={handleSendMessage}
            />
          </div>
        </div>
      </main>
    </div>
  )
}
