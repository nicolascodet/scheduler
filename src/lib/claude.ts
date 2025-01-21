import Anthropic from '@anthropic-ai/sdk'
import { MessageContentText } from '@anthropic-ai/sdk/lib/types'

let anthropicClient: Anthropic | null = null

export function getClaudeClient() {
  if (!anthropicClient) {
    anthropicClient = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY!,
    })
  }
  return anthropicClient
}

export async function getChatResponse(message: string, context?: string) {
  const client = getClaudeClient()
  
  const systemPrompt = `You are a helpful calendar assistant that helps users optimize their schedule. 
You have access to their Google Calendar data and can suggest optimizations.
${context ? `Current context: ${context}` : ''}`

  const response = await client.messages.create({
    model: 'claude-3-sonnet-20240229',
    max_tokens: 1000,
    temperature: 0.7,
    system: systemPrompt,
    messages: [
      {
        role: 'user',
        content: message,
      },
    ],
  })

  const textContent = response.content[0] as MessageContentText
  return textContent.text
} 