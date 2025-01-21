import { ChatMessage as ChatMessageType } from '@/types/chat'
import { format } from 'date-fns'

interface ChatMessageProps {
  message: ChatMessageType
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user'

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`
          max-w-[85%] rounded-2xl px-4 py-2 
          ${isUser ? 
            'bg-blue-500 text-white ml-4' : 
            'bg-gray-100 text-gray-900 mr-4'
          }
          ${message.status === 'sending' ? 'opacity-70' : ''}
          ${message.status === 'error' ? 'bg-red-100 text-red-900' : ''}
        `}
      >
        <p className="text-[15px] leading-normal whitespace-pre-wrap break-words">
          {message.content}
        </p>
        <div 
          className={`
            text-[11px] mt-1 
            ${isUser ? 'text-blue-100' : 'text-gray-500'}
            ${message.status === 'error' ? 'text-red-500' : ''}
          `}
        >
          {format(message.timestamp, 'h:mm a')}
          {message.status === 'sending' && ' • Sending...'}
          {message.status === 'error' && ' • Failed to send'}
        </div>
      </div>
    </div>
  )
} 