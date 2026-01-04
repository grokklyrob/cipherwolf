import { useState, useEffect, useCallback } from 'react'
import type { User, AuthState, Message, ChatSession } from '../types'
import {
  checkAuthState,
  getStoredUser,
  signOut,
  loadGoogleScript,
  isConfigured as isAuthConfigured,
} from '../services/authService'
import { isConfigured as isGeminiConfigured } from '../services/geminiService'
import {
  getSessions,
  getSession,
  createSession,
  updateSession,
  deleteSession,
  getCurrentSessionId,
  setCurrentSessionId,
  generateMessageId,
} from '../services/storageService'
import LoginGate from './LoginGate'
import ChatInterface from './ChatInterface'
import Sidebar from './Sidebar'
import { Particles } from './ui/particles'
import { Menu, X } from 'lucide-react'

export default function App() {
  const [authState, setAuthState] = useState<AuthState>('idle')
  const [user, setUser] = useState<User | null>(null)
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Initialize app
  useEffect(() => {
    async function initialize() {
      // Check configuration
      if (!isAuthConfigured()) {
        setAuthState('missing_config')
        setIsLoading(false)
        return
      }

      // Load Google Sign-In
      try {
        await loadGoogleScript()
      } catch (error) {
        console.error('Failed to load Google Sign-In:', error)
      }

      // Check auth state
      const state = checkAuthState()
      setAuthState(state)

      if (state === 'authenticated') {
        const storedUser = getStoredUser()
        setUser(storedUser)
        loadSessions()
      }

      setIsLoading(false)
    }

    initialize()
  }, [])

  const loadSessions = useCallback(() => {
    const allSessions = getSessions()
    setSessions(allSessions)

    // Load current session or create new one
    const currentId = getCurrentSessionId()
    if (currentId) {
      const session = getSession(currentId)
      if (session) {
        setCurrentSession(session)
        return
      }
    }

    // No current session, use most recent or create new
    if (allSessions.length > 0) {
      setCurrentSession(allSessions[0])
      setCurrentSessionId(allSessions[0].id)
    } else {
      const newSession = createSession()
      setSessions([newSession])
      setCurrentSession(newSession)
    }
  }, [])

  const handleAuthSuccess = useCallback(
    (authenticatedUser: User) => {
      setUser(authenticatedUser)
      setAuthState('authenticated')
      loadSessions()
    },
    [loadSessions]
  )

  const handleAuthUnauthorized = useCallback(() => {
    setAuthState('unauthorized')
  }, [])

  const handleSignOut = useCallback(() => {
    signOut()
    setUser(null)
    setAuthState('idle')
    setCurrentSession(null)
    setSessions([])
  }, [])

  const handleNewChat = useCallback(() => {
    const newSession = createSession()
    setSessions((prev) => [newSession, ...prev])
    setCurrentSession(newSession)
    setSidebarOpen(false)
  }, [])

  const handleSelectSession = useCallback((sessionId: string) => {
    const session = getSession(sessionId)
    if (session) {
      setCurrentSession(session)
      setCurrentSessionId(sessionId)
    }
    setSidebarOpen(false)
  }, [])

  const handleDeleteSession = useCallback(
    (sessionId: string) => {
      deleteSession(sessionId)
      setSessions((prev) => prev.filter((s) => s.id !== sessionId))

      // If we deleted the current session, switch to another
      if (currentSession?.id === sessionId) {
        const remaining = sessions.filter((s) => s.id !== sessionId)
        if (remaining.length > 0) {
          setCurrentSession(remaining[0])
          setCurrentSessionId(remaining[0].id)
        } else {
          const newSession = createSession()
          setSessions([newSession])
          setCurrentSession(newSession)
        }
      }
    },
    [currentSession, sessions]
  )

  const handleSendMessage = useCallback(
    async (
      content: string,
      images?: { data: string; mimeType: string }[]
    ): Promise<void> => {
      if (!currentSession) return

      // Create user message
      const userMessage: Message = {
        id: generateMessageId(),
        role: 'user',
        content,
        timestamp: Date.now(),
        images,
      }

      // Update session with user message
      const updatedHistory = [...currentSession.history, userMessage]
      const updatedSession = { ...currentSession, history: updatedHistory }
      setCurrentSession(updatedSession)
      updateSession(currentSession.id, updatedHistory)

      // Update sessions list
      setSessions((prev) =>
        prev.map((s) => (s.id === currentSession.id ? updatedSession : s))
      )
    },
    [currentSession]
  )

  const handleAssistantMessage = useCallback(
    (content: string) => {
      if (!currentSession) return

      const assistantMessage: Message = {
        id: generateMessageId(),
        role: 'assistant',
        content,
        timestamp: Date.now(),
      }

      setCurrentSession((prev) => {
        if (!prev) return null
        const updatedHistory = [...prev.history, assistantMessage]
        updateSession(prev.id, updatedHistory)
        return { ...prev, history: updatedHistory }
      })

      setSessions((prev) =>
        prev.map((s) => {
          if (s.id === currentSession.id) {
            return { ...s, history: [...s.history, assistantMessage] }
          }
          return s
        })
      )
    },
    [currentSession]
  )

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-cyber-darker flex items-center justify-center">
        <div className="text-cyber-cyan animate-pulse text-xl">Loading CipherWolf...</div>
      </div>
    )
  }

  // Auth states
  if (authState !== 'authenticated') {
    return (
      <LoginGate
        authState={authState}
        onSuccess={handleAuthSuccess}
        onUnauthorized={handleAuthUnauthorized}
      />
    )
  }

  // Check Gemini configuration
  if (!isGeminiConfigured()) {
    return (
      <div className="min-h-screen bg-cyber-darker flex items-center justify-center p-4">
        <div className="card max-w-md text-center">
          <h1 className="text-2xl font-bold text-cyber-cyan mb-4">Configuration Required</h1>
          <p className="text-gray-400">
            Gemini API key is not configured. Please add VITE_GEMINI_API_KEY to your environment
            variables.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cyber-darker flex relative">
      {/* Animated particles background */}
      <Particles
        className="absolute inset-0"
        quantity={100}
        ease={80}
        color="#00FFFF"
        refresh={false}
      />

      {/* Mobile menu button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-cyber-gray rounded-lg text-cyber-cyan hover:bg-cyber-light transition-colors"
      >
        {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        sessions={sessions}
        currentSessionId={currentSession?.id || null}
        user={user}
        onNewChat={handleNewChat}
        onSelectSession={handleSelectSession}
        onDeleteSession={handleDeleteSession}
        onSignOut={handleSignOut}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main chat area */}
      <main className="flex-1 flex flex-col min-h-screen lg:ml-80 relative z-10">
        <ChatInterface
          messages={currentSession?.history || []}
          onSendMessage={handleSendMessage}
          onAssistantMessage={handleAssistantMessage}
        />
      </main>
    </div>
  )
}
