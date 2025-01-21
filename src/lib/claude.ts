import Anthropic from '@anthropic-ai/sdk'

let anthropicClient: Anthropic | null = null

export function getAnthropicClient() {
  if (!anthropicClient) {
    anthropicClient = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY!,
    })
  }
  return anthropicClient
}

export async function generateResponse(message: string, context: any) {
  const client = getAnthropicClient()
  
  const response = await client.messages.create({
    model: 'claude-3-sonnet-20240229',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: `Context: ${JSON.stringify(context)}\n\nUser message: ${message}`,
      }
    ],
    system: `You are a helpful calendar assistant that helps users manage their schedule.
You can create, update, and query calendar events.

When responding to user queries:
1. Analyze the intent of the message
2. For schedule queries, reference the provided calendar events
3. Provide clear, concise responses
4. When suggesting times, consider conflicts
5. Use the user's timezone for all times

Keep responses brief and focused on schedule management.`,
  })

  return response.content[0].text
} 