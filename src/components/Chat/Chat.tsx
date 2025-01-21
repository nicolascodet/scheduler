'use client'

import { useRef, useEffect, useState } from 'react'
import { GoogleTokens } from '@/types/calendar'
import { useChat } from '@/hooks/useChat'
import ChatMessage from './ChatMessage'

interface ChatProps {
  tokens: GoogleTokens
  onError?: (error: Error) => void
}

export default function Chat({ tokens, onError }: ChatProps) {
  const [message, setMessage] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { messages, sendMessage, isLoading } = useChat({ tokens, onError })

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = `${Math.min(textarea.scrollHeight, 100)}px`
    }
  }, [message])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (message.trim() && !isLoading) {
      try {
        await sendMessage(message.trim())
        setMessage('')
        // Reset textarea height
        if (textareaRef.current) {
          textareaRef.current.style.height = 'auto'
        }
      } catch (error) {
        // Error is handled by the hook
      }
    }
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 pt-4">
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}
        
        {/* Loading indicator */}
        {isLoading && (
          <div className="flex justify-start mb-4">
            <div className="bg-gray-100 rounded-2xl px-4 py-2 max-w-[85%] mr-4">
              <div className="flex space-x-2 items-center h-6">
                <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t bg-white px-4 py-2 safe-bottom">
        <form onSubmit={handleSubmit} className="flex items-end gap-2">
          <div className="flex-1 min-h-[44px] flex items-center bg-gray-100 rounded-2xl px-4">
            <textarea
              ref={textareaRef}
              rows={1}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask about your schedule..."
              className="flex-1 bg-transparent border-0 focus:ring-0 resize-none py-3 px-0 text-[15px] max-h-[100px] placeholder:text-gray-500"
              style={{ height: 'auto' }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSubmit(e)
                }
              }}
            />
          </div>
          <button
            type="submit"
            disabled={!message.trim() || isLoading}
            className={`
              rounded-full p-2 transition-colors
              ${message.trim() && !isLoading
                ? 'text-blue-500 hover:text-blue-600 active:text-blue-700'
                : 'text-gray-300'
              }
            `}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M1.946 9.315c-.522-.174-.527-.455.01-.634l19.087-6.362c.529-.176.832.12.684.638l-5.454 19.086c-.15.529-.455.547-.679.045L12 14l6-8-8 6-8.054-2.685z" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  )
} 