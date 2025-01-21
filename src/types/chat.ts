export type MessageRole = 'user' | 'assistant'

export interface ChatMessage {
  id: string
  content: string
  role: MessageRole
  timestamp: Date
  status: 'sending' | 'sent' | 'error'
}

export interface ChatState {
  messages: ChatMessage[]
  isLoading: boolean
  error?: string
} 