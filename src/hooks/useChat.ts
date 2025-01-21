import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { ChatMessage } from '@/types/chat'
import { GoogleTokens } from '@/types/calendar'
import { AssistantResponse } from '@/types/assistant'

interface UseChatOptions {
  tokens: GoogleTokens
  onError?: (error: Error) => void
}

export function useChat({ tokens, onError }: UseChatOptions) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      content: "Hello! I'm your calendar assistant. How can I help you optimize your schedule today?",
      role: 'assistant',
      timestamp: new Date(),
      status: 'sent'
    }
  ])

  const chatMutation = useMutation({
    mutationFn: async (message: string) => {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          tokens,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to send message')
      }

      return response.json() as Promise<AssistantResponse>
    },
    onError: (error: Error) => {
      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          content: error.message,
          role: 'assistant',
          timestamp: new Date(),
          status: 'error'
        }
      ])
      onError?.(error)
    },
  })

  const sendMessage = async (content: string) => {
    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content,
      role: 'user',
      timestamp: new Date(),
      status: 'sending'
    }
    setMessages(prev => [...prev, userMessage])

    try {
      const response = await chatMutation.mutateAsync(content)
      
      // Update user message status
      setMessages(prev => prev.map(msg => 
        msg.id === userMessage.id ? { ...msg, status: 'sent' } : msg
      ))

      // Add assistant response
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        content: response.message,
        role: 'assistant',
        timestamp: new Date(),
        status: 'sent'
      }])

      return response
    } catch (error) {
      // Update user message status on error
      setMessages(prev => prev.map(msg => 
        msg.id === userMessage.id ? { ...msg, status: 'error' } : msg
      ))
      throw error
    }
  }

  return {
    messages,
    sendMessage,
    isLoading: chatMutation.isPending,
  }
} 