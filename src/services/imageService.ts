import { GoogleGenAI } from '@google/genai'
import { GEMINI_API_KEY, MODELS } from '../constants'
import type { Message } from '../types'

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

function extractContext(messages: Message[], count: number = 3): string {
  const recentMessages = messages.slice(-count)
  return recentMessages
    .map((msg) => `${msg.role === 'user' ? 'Student' : 'CipherWolf'}: ${msg.content}`)
    .join('\n\n')
}

export async function generateInfographic(
  messages: Message[],
  style: 'blueprint' | 'schematic' | 'diagram' = 'blueprint'
): Promise<string> {
  const client = getClient()

  const context = extractContext(messages)

  const styleDescriptions = {
    blueprint: 'a high-tech blueprint style with cyan/blue lines on dark background, technical annotations, and a futuristic aesthetic',
    schematic: 'a sci-fi schematic diagram with neon accents, circuit-like patterns, and cyberpunk aesthetics',
    diagram: 'a clean educational diagram with clear labels, color-coded sections, and modern flat design',
  }

  const prompt = `Create an educational infographic about the following robotics/programming topic.

Style: ${styleDescriptions[style]}

The infographic should be:
- Visually appealing for teenagers
- Include relevant icons and illustrations
- Have clear, readable text labels
- Use a dark theme with cyan (#00FFFF) and blue (#0080FF) accents
- Be suitable for learning robotics and programming concepts

Topic context from recent conversation:
${context}

Generate an infographic that helps visualize and summarize the key concepts discussed.`

  const response = await client.models.generateContent({
    model: MODELS.image,
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    config: {
      responseModalities: ['image', 'text'],
    },
  })

  // Extract image from response
  const parts = response.candidates?.[0]?.content?.parts || []

  for (const part of parts) {
    if ('inlineData' in part && part.inlineData && part.inlineData.data) {
      return part.inlineData.data // Return base64 image data
    }
  }

  throw new Error('No image generated in response')
}

export function isConfigured(): boolean {
  return Boolean(GEMINI_API_KEY)
}
