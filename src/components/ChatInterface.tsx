import { useState, useRef, useEffect } from 'react'
import type { Message } from '../types'
import { streamMessage } from '../services/geminiService'
import MarkdownMessage from './MarkdownMessage'
import InputArea from './InputArea'
import { Bot, User } from 'lucide-react'

interface ChatInterfaceProps {
  messages: Message[]
  onSendMessage: (
    content: string,
    images?: { data: string; mimeType: string }[]
  ) => Promise<void>
  onAssistantMessage: (content: string) => void
}

export default function ChatInterface({
  messages,
  onSendMessage,
  onAssistantMessage,
}: ChatInterfaceProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [streamingContent, setStreamingContent] = useState('')
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamingContent])

  const handleSend = async (content: string, images?: { data: string; mimeType: string }[]) => {
    if (!content.trim() && (!images || images.length === 0)) return

    setError(null)
    setIsLoading(true)
    setStreamingContent('')

    // Add user message
    await onSendMessage(content, images)

    try {
      // Stream response from Gemini
      const fullResponse = await streamMessage(
        content,
        messages,
        (chunk) => {
          setStreamingContent((prev) => prev + chunk)
        },
        images
      )

      // Save complete assistant message
      onAssistantMessage(fullResponse)
      setStreamingContent('')
    } catch (err) {
      console.error('Chat error:', err)
      setError(err instanceof Error ? err.message : 'Failed to get response')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
        {messages.length === 0 && !streamingContent && (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="w-20 h-20 mb-4 opacity-50">
              <img src="/wolf.svg" alt="CipherWolf" className="w-full h-full" />
            </div>
            <h2 className="text-xl font-semibold text-gray-400 mb-2">
              Welcome to CipherWolf!
            </h2>
            <p className="text-gray-500 max-w-md">
              I'm your AI pack leader for robotics and coding. Ask me anything about
              MicroPython, Arduino, the Alvik robot, IoT, or electronics!
            </p>
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg">
              <SuggestionButton onClick={() => handleSend('How do I make Alvik follow a line?')}>
                How do I make Alvik follow a line?
              </SuggestionButton>
              <SuggestionButton onClick={() => handleSend('Explain MicroPython basics')}>
                Explain MicroPython basics
              </SuggestionButton>
              <SuggestionButton onClick={() => handleSend('How do ultrasonic sensors work?')}>
                How do ultrasonic sensors work?
              </SuggestionButton>
              <SuggestionButton onClick={() => handleSend('Show me an obstacle avoidance code')}>
                Show me obstacle avoidance code
              </SuggestionButton>
            </div>
          </div>
        )}

        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}

        {/* Streaming message */}
        {streamingContent && (
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-cyber-gray border border-cyber-cyan flex items-center justify-center">
              <Bot size={18} className="text-cyber-cyan" />
            </div>
            <div className="flex-1 message-wolf">
              <MarkdownMessage content={streamingContent} />
              <span className="inline-block w-2 h-4 bg-cyber-cyan animate-pulse ml-1" />
            </div>
          </div>
        )}

        {/* Loading indicator */}
        {isLoading && !streamingContent && (
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-cyber-gray border border-cyber-cyan flex items-center justify-center">
              <Bot size={18} className="text-cyber-cyan" />
            </div>
            <div className="message-wolf">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-cyber-cyan rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-cyber-cyan rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-cyber-cyan rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-4 text-red-400">
            <p className="font-semibold">Error</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <InputArea
        onSend={handleSend}
        disabled={isLoading}
        messages={messages}
      />
    </div>
  )
}

interface MessageBubbleProps {
  message: Message
}

function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user'

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div
        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          isUser
            ? 'bg-cyber-blue/20 border border-cyber-blue'
            : 'bg-cyber-gray border border-cyber-cyan'
        }`}
      >
        {isUser ? (
          <User size={18} className="text-cyber-blue" />
        ) : (
          <Bot size={18} className="text-cyber-cyan" />
        )}
      </div>

      <div className={`flex-1 max-w-[80%] ${isUser ? 'message-user' : 'message-wolf'}`}>
        {/* Images */}
        {message.images && message.images.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {message.images.map((img, index) => (
              <img
                key={index}
                src={`data:${img.mimeType};base64,${img.data}`}
                alt={`Uploaded image ${index + 1}`}
                className="max-w-[200px] max-h-[200px] rounded-lg object-cover"
              />
            ))}
          </div>
        )}

        {/* Content */}
        {isUser ? (
          <p className="text-gray-200 whitespace-pre-wrap">{message.content}</p>
        ) : (
          <MarkdownMessage content={message.content} />
        )}
      </div>
    </div>
  )
}

interface SuggestionButtonProps {
  children: string
  onClick: () => void
}

function SuggestionButton({ children, onClick }: SuggestionButtonProps) {
  return (
    <button
      onClick={onClick}
      className="text-left px-4 py-3 bg-cyber-gray border border-cyber-light rounded-lg text-sm text-gray-300 hover:border-cyber-cyan hover:text-cyber-cyan transition-colors"
    >
      {children}
    </button>
  )
}
