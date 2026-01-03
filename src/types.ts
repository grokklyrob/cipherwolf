export type AuthState = 'idle' | 'authenticated' | 'unauthorized' | 'missing_config'

export interface User {
  email: string
  name: string
  picture?: string
}

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
  images?: MessageImage[]
}

export interface MessageImage {
  data: string // base64
  mimeType: string
}

export interface ChatSession {
  id: string
  history: Message[]
  createdAt: number
  updatedAt: number
}

export interface StoredData {
  user: User | null
  sessions: ChatSession[]
  currentSessionId: string | null
}

export interface GeminiMessage {
  role: 'user' | 'model'
  parts: GeminiPart[]
}

export type GeminiPart =
  | { text: string }
  | { inlineData: { mimeType: string; data: string } }

export interface InfographicRequest {
  context: string
  style?: 'blueprint' | 'schematic' | 'diagram'
}
