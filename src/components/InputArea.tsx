import { useState, useRef, type KeyboardEvent, type ChangeEvent } from 'react'
import { Send, Paperclip, Image, X, Loader2 } from 'lucide-react'
import type { Message } from '../types'
import { generateInfographic } from '../services/imageService'

interface InputAreaProps {
  onSend: (content: string, images?: { data: string; mimeType: string }[]) => Promise<void>
  disabled: boolean
  messages: Message[]
}

export default function InputArea({ onSend, disabled, messages }: InputAreaProps) {
  const [input, setInput] = useState('')
  const [attachedImages, setAttachedImages] = useState<{ data: string; mimeType: string }[]>([])
  const [isGeneratingImage, setIsGeneratingImage] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSubmit = async () => {
    if ((!input.trim() && attachedImages.length === 0) || disabled) return

    const content = input.trim()
    const images = attachedImages.length > 0 ? [...attachedImages] : undefined

    setInput('')
    setAttachedImages([])

    await onSend(content, images)
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const handleFileSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    for (const file of files) {
      if (!file.type.startsWith('image/')) continue

      const reader = new FileReader()
      reader.onload = () => {
        const result = reader.result as string
        const base64 = result.split(',')[1]
        setAttachedImages((prev) => [
          ...prev,
          { data: base64, mimeType: file.type },
        ])
      }
      reader.readAsDataURL(file)
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const removeImage = (index: number) => {
    setAttachedImages((prev) => prev.filter((_, i) => i !== index))
  }

  const handleGenerateInfographic = async () => {
    if (messages.length < 2 || isGeneratingImage) return

    setIsGeneratingImage(true)

    try {
      const imageData = await generateInfographic(messages)

      // Send as a message with the generated image
      await onSend('Generated an infographic based on our conversation:', [
        { data: imageData, mimeType: 'image/png' },
      ])
    } catch (error) {
      console.error('Failed to generate infographic:', error)
      // Could show a toast/notification here
    } finally {
      setIsGeneratingImage(false)
    }
  }

  // Auto-resize textarea
  const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)

    // Auto-resize
    const textarea = e.target
    textarea.style.height = 'auto'
    textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px'
  }

  return (
    <div className="border-t border-cyber-light bg-cyber-darker p-4">
      {/* Attached images preview */}
      {attachedImages.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {attachedImages.map((img, index) => (
            <div key={index} className="relative group">
              <img
                src={`data:${img.mimeType};base64,${img.data}`}
                alt={`Attachment ${index + 1}`}
                className="w-16 h-16 object-cover rounded-lg border border-cyber-light"
              />
              <button
                onClick={() => removeImage(index)}
                className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input row */}
      <div className="flex items-end gap-2">
        {/* Attachment button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
          className="flex-shrink-0 p-2 text-gray-400 hover:text-cyber-cyan disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Attach image"
        >
          <Paperclip size={20} />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Infographic button */}
        <button
          onClick={handleGenerateInfographic}
          disabled={disabled || messages.length < 2 || isGeneratingImage}
          className="flex-shrink-0 p-2 text-gray-400 hover:text-cyber-magenta disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Generate infographic from conversation"
        >
          {isGeneratingImage ? (
            <Loader2 size={20} className="animate-spin" />
          ) : (
            <Image size={20} />
          )}
        </button>

        {/* Text input */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Ask CipherWolf anything about robotics..."
            disabled={disabled}
            rows={1}
            className="input-field resize-none pr-12 min-h-[44px] max-h-[200px]"
          />
        </div>

        {/* Send button */}
        <button
          onClick={handleSubmit}
          disabled={disabled || (!input.trim() && attachedImages.length === 0)}
          className="flex-shrink-0 p-2 bg-cyber-cyan text-cyber-darker rounded-lg hover:bg-cyber-blue disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Send size={20} />
        </button>
      </div>

      {/* Helper text */}
      <p className="text-xs text-gray-500 mt-2 text-center">
        Press Enter to send, Shift+Enter for new line
      </p>
    </div>
  )
}
