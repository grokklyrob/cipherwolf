import type { User, ChatSession } from '../types'
import { Plus, MessageSquare, Trash2, LogOut, X } from 'lucide-react'

interface SidebarProps {
  isOpen: boolean
  sessions: ChatSession[]
  currentSessionId: string | null
  user: User | null
  onNewChat: () => void
  onSelectSession: (sessionId: string) => void
  onDeleteSession: (sessionId: string) => void
  onSignOut: () => void
  onClose: () => void
}

export default function Sidebar({
  isOpen,
  sessions,
  currentSessionId,
  user,
  onNewChat,
  onSelectSession,
  onDeleteSession,
  onSignOut,
  onClose,
}: SidebarProps) {
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()

    // Today
    if (diff < 24 * 60 * 60 * 1000 && date.getDate() === now.getDate()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    // Yesterday
    if (diff < 48 * 60 * 60 * 1000) {
      return 'Yesterday'
    }

    // This week
    if (diff < 7 * 24 * 60 * 60 * 1000) {
      return date.toLocaleDateString([], { weekday: 'long' })
    }

    // Older
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
  }

  const getSessionTitle = (session: ChatSession) => {
    const firstUserMessage = session.history.find((m) => m.role === 'user')
    if (firstUserMessage) {
      const title = firstUserMessage.content.slice(0, 40)
      return title.length < firstUserMessage.content.length ? `${title}...` : title
    }
    return 'New conversation'
  }

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:fixed top-0 left-0 h-full w-80 bg-cyber-gray border-r border-cyber-light
          transform transition-transform duration-300 ease-in-out z-40
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-cyber-light">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <img src="/wolf.svg" alt="CipherWolf" className="w-8 h-8" />
                <span className="font-bold text-cyber-cyan">CipherWolf</span>
              </div>
              <button
                onClick={onClose}
                className="lg:hidden p-1 text-gray-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <button
              onClick={onNewChat}
              className="w-full btn-outline flex items-center justify-center gap-2"
            >
              <Plus size={18} />
              <span>New Chat</span>
            </button>
          </div>

          {/* Sessions list */}
          <div className="flex-1 overflow-y-auto p-2 scrollbar-thin">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2 py-2">
              Conversations
            </h3>

            {sessions.length === 0 ? (
              <p className="text-sm text-gray-500 px-2 py-4">
                No conversations yet. Start chatting!
              </p>
            ) : (
              <div className="space-y-1">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    className={`
                      group flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer
                      transition-colors
                      ${
                        session.id === currentSessionId
                          ? 'bg-cyber-light border border-cyber-cyan/30'
                          : 'hover:bg-cyber-light/50'
                      }
                    `}
                    onClick={() => onSelectSession(session.id)}
                  >
                    <MessageSquare size={16} className="flex-shrink-0 text-gray-400" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-200 truncate">
                        {getSessionTitle(session)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDate(session.updatedAt)}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onDeleteSession(session.id)
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-400 transition-opacity"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Learning topics */}
          <div className="p-4 border-t border-cyber-light">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Topics
            </h3>
            <div className="flex flex-wrap gap-2">
              <TopicTag>MicroPython</TopicTag>
              <TopicTag>Arduino</TopicTag>
              <TopicTag>Alvik</TopicTag>
              <TopicTag>IoT</TopicTag>
              <TopicTag>Sensors</TopicTag>
              <TopicTag>Motors</TopicTag>
            </div>
          </div>

          {/* User section */}
          <div className="p-4 border-t border-cyber-light">
            <div className="flex items-center gap-3">
              {user?.picture ? (
                <img
                  src={user.picture}
                  alt={user.name}
                  className="w-8 h-8 rounded-full"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-cyber-light flex items-center justify-center">
                  <span className="text-sm font-medium text-gray-300">
                    {user?.name?.charAt(0) || '?'}
                  </span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-200 truncate">
                  {user?.name || 'User'}
                </p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
              <button
                onClick={onSignOut}
                className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                title="Sign out"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}

function TopicTag({ children }: { children: string }) {
  return (
    <span className="px-2 py-1 text-xs bg-cyber-darker border border-cyber-light rounded-full text-gray-400">
      {children}
    </span>
  )
}
