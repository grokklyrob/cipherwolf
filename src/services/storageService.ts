import { STORAGE_KEYS, LIMITS } from '../constants'
import type { User, ChatSession, Message } from '../types'

// User Management
export function saveUser(user: User): void {
  localStorage.setItem(STORAGE_KEYS.userData, JSON.stringify(user))
}

export function getUser(): User | null {
  const data = localStorage.getItem(STORAGE_KEYS.userData)
  if (!data) return null

  try {
    return JSON.parse(data) as User
  } catch {
    return null
  }
}

export function clearUser(): void {
  localStorage.removeItem(STORAGE_KEYS.userData)
}

// Session Management
export function getSessions(): ChatSession[] {
  const data = localStorage.getItem(STORAGE_KEYS.sessions)
  if (!data) return []

  try {
    const sessions = JSON.parse(data) as ChatSession[]
    // Filter out expired sessions
    const now = Date.now()
    return sessions.filter((s) => now - s.createdAt < LIMITS.maxSessionAge)
  } catch {
    return []
  }
}

export function saveSessions(sessions: ChatSession[]): void {
  // Prune old sessions before saving
  const now = Date.now()
  const validSessions = sessions.filter((s) => now - s.createdAt < LIMITS.maxSessionAge)
  localStorage.setItem(STORAGE_KEYS.sessions, JSON.stringify(validSessions))
}

export function getSession(sessionId: string): ChatSession | null {
  const sessions = getSessions()
  return sessions.find((s) => s.id === sessionId) || null
}

export function createSession(): ChatSession {
  const session: ChatSession = {
    id: generateId(),
    history: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }

  const sessions = getSessions()
  sessions.unshift(session)
  saveSessions(sessions)
  setCurrentSessionId(session.id)

  return session
}

export function updateSession(sessionId: string, messages: Message[]): void {
  const sessions = getSessions()
  const index = sessions.findIndex((s) => s.id === sessionId)

  if (index !== -1) {
    // Prune messages if over limit
    const prunedMessages = messages.slice(-LIMITS.maxMessages)

    sessions[index] = {
      ...sessions[index],
      history: prunedMessages,
      updatedAt: Date.now(),
    }
    saveSessions(sessions)
  }
}

export function deleteSession(sessionId: string): void {
  const sessions = getSessions()
  const filtered = sessions.filter((s) => s.id !== sessionId)
  saveSessions(filtered)

  // If we deleted the current session, clear it
  if (getCurrentSessionId() === sessionId) {
    clearCurrentSessionId()
  }
}

// Current Session Tracking
export function getCurrentSessionId(): string | null {
  return localStorage.getItem(STORAGE_KEYS.currentSession)
}

export function setCurrentSessionId(sessionId: string): void {
  localStorage.setItem(STORAGE_KEYS.currentSession, sessionId)
}

export function clearCurrentSessionId(): void {
  localStorage.removeItem(STORAGE_KEYS.currentSession)
}

// Utility
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

export function generateMessageId(): string {
  return generateId()
}

// Clear all data
export function clearAllData(): void {
  localStorage.removeItem(STORAGE_KEYS.userData)
  localStorage.removeItem(STORAGE_KEYS.sessions)
  localStorage.removeItem(STORAGE_KEYS.currentSession)
}
