import { GoogleGenAI } from '@google/genai'
import { GEMINI_API_KEY, MODELS, SYSTEM_INSTRUCTION, ALVIK_CONTEXT, LIMITS } from '../constants'
import type { Message, GeminiMessage, GeminiPart } from '../types'

let genAI: GoogleGenAI | null = null

function getClient(): GoogleGenAI {
  if (!genAI) {
    if (!GEMINI_API_KEY) {
      throw new Error('Gemini API key not configured')
    }
    genAI = new GoogleGenAI({ apiKey: GEMINI_API_KEY })
  }
  return genAI
}

function convertToGeminiHistory(messages: Message[]): GeminiMessage[] {
  // Take only the last N messages to stay within context limits
  const recentMessages = messages.slice(-LIMITS.maxContextMessages)

  return recentMessages.map((msg) => {
    const parts: GeminiPart[] = []

    // Add text content
    if (msg.content) {
      parts.push({ text: msg.content })
    }

    // Add images if present
    if (msg.images) {
      for (const img of msg.images) {
        parts.push({
          inlineData: {
            mimeType: img.mimeType,
            data: img.data,
          },
        })
      }
    }

    return {
      role: msg.role === 'user' ? 'user' : 'model',
      parts,
    }
  })
}

export async function sendMessage(
  userMessage: string,
  history: Message[],
  images?: { data: string; mimeType: string }[]
): Promise<string> {
  const client = getClient()

  // Build the full system context
  const fullSystemInstruction = `${SYSTEM_INSTRUCTION}\n\n${ALVIK_CONTEXT}`

  // Convert history to Gemini format (excluding the current message)
  const geminiHistory = convertToGeminiHistory(history)

  // Build current message parts
  const currentParts: GeminiPart[] = [{ text: userMessage }]

  if (images && images.length > 0) {
    for (const img of images) {
      currentParts.push({
        inlineData: {
          mimeType: img.mimeType,
          data: img.data,
        },
      })
    }
  }

  // Create chat session with history
  const chat = client.chats.create({
    model: MODELS.chat,
    config: {
      systemInstruction: fullSystemInstruction,
    },
    history: geminiHistory,
  })

  // Send the current message
  const response = await chat.sendMessage({
    message: currentParts,
  })

  return response.text || 'I apologize, but I could not generate a response. Please try again.'
}

export async function streamMessage(
  userMessage: string,
  history: Message[],
  onChunk: (chunk: string) => void,
  images?: { data: string; mimeType: string }[]
): Promise<string> {
  const client = getClient()

  const fullSystemInstruction = `${SYSTEM_INSTRUCTION}\n\n${ALVIK_CONTEXT}`
  const geminiHistory = convertToGeminiHistory(history)

  const currentParts: GeminiPart[] = [{ text: userMessage }]

  if (images && images.length > 0) {
    for (const img of images) {
      currentParts.push({
        inlineData: {
          mimeType: img.mimeType,
          data: img.data,
        },
      })
    }
  }

  const chat = client.chats.create({
    model: MODELS.chat,
    config: {
      systemInstruction: fullSystemInstruction,
    },
    history: geminiHistory,
  })

  const stream = await chat.sendMessageStream({
    message: currentParts,
  })

  let fullResponse = ''

  for await (const chunk of stream) {
    const text = chunk.text || ''
    fullResponse += text
    onChunk(text)
  }

  return fullResponse || 'I apologize, but I could not generate a response. Please try again.'
}

export function isConfigured(): boolean {
  return Boolean(GEMINI_API_KEY)
}
