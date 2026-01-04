import { useState } from 'react'
import { Image as ImageIcon, Loader2, Download } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { BorderBeam } from './ui/border-beam'
import { generateInfographic } from '../services/imageService'

interface ImageGeneratorModalProps {
  onImageGenerated?: (imageData: string) => void
  disabled?: boolean
}

export default function ImageGeneratorModal({
  onImageGenerated,
  disabled = false,
}: ImageGeneratorModalProps) {
  const [open, setOpen] = useState(false)
  const [prompt, setPrompt] = useState('')
  const [style, setStyle] = useState<'blueprint' | 'schematic' | 'diagram'>('blueprint')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return

    setIsGenerating(true)
    setError(null)
    setGeneratedImage(null)

    try {
      const imageData = await generateInfographic(prompt, style)
      setGeneratedImage(imageData)
      if (onImageGenerated) {
        onImageGenerated(imageData)
      }
    } catch (err) {
      console.error('Failed to generate image:', err)
      setError(err instanceof Error ? err.message : 'Failed to generate image')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownload = () => {
    if (!generatedImage) return

    const link = document.createElement('a')
    link.href = `data:image/png;base64,${generatedImage}`
    link.download = `cipherwolf-infographic-${Date.now()}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleClose = () => {
    setOpen(false)
    // Reset state after animation completes
    setTimeout(() => {
      setPrompt('')
      setGeneratedImage(null)
      setError(null)
    }, 300)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          disabled={disabled}
          className="text-gray-400 hover:text-cyber-magenta hover:bg-cyber-gray"
          title="Generate custom infographic"
        >
          <ImageIcon size={20} />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] bg-cyber-dark border-cyber-light">
        <DialogHeader>
          <DialogTitle className="text-cyber-cyan">Generate Infographic</DialogTitle>
          <DialogDescription className="text-gray-400">
            Create a custom educational infographic with AI
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Prompt Input */}
          <div className="space-y-2">
            <Label htmlFor="prompt" className="text-gray-300">
              What should the infographic be about?
            </Label>
            <Input
              id="prompt"
              placeholder="e.g., How line following sensors work on Alvik robot"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={isGenerating}
              className="bg-cyber-darker border-cyber-light text-gray-200"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleGenerate()
                }
              }}
            />
          </div>

          {/* Style Selection */}
          <div className="space-y-2">
            <Label className="text-gray-300">Style</Label>
            <div className="grid grid-cols-3 gap-2">
              {(['blueprint', 'schematic', 'diagram'] as const).map((s) => (
                <Button
                  key={s}
                  variant={style === s ? 'default' : 'outline'}
                  onClick={() => setStyle(s)}
                  disabled={isGenerating}
                  className={
                    style === s
                      ? 'bg-cyber-cyan text-cyber-darker hover:bg-cyber-blue'
                      : 'border-cyber-light text-gray-300 hover:border-cyber-cyan hover:text-cyber-cyan'
                  }
                >
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </Button>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <Button
            onClick={handleGenerate}
            disabled={!prompt.trim() || isGenerating}
            className="w-full bg-cyber-cyan text-cyber-darker hover:bg-cyber-blue"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <ImageIcon className="mr-2 h-4 w-4" />
                Generate Infographic
              </>
            )}
          </Button>

          {/* Error Message */}
          {error && (
            <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-3 text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Generated Image Preview */}
          {generatedImage && (
            <div className="space-y-3">
              <div className="relative rounded-lg overflow-hidden border border-cyber-cyan">
                <BorderBeam
                  size={80}
                  duration={6}
                  colorFrom="#00FFFF"
                  colorTo="#FF00FF"
                  borderWidth={2}
                />
                <img
                  src={`data:image/png;base64,${generatedImage}`}
                  alt="Generated infographic"
                  className="w-full h-auto"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleDownload}
                  variant="outline"
                  className="flex-1 border-cyber-light text-gray-300 hover:border-cyber-cyan hover:text-cyber-cyan"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
                <Button
                  onClick={handleClose}
                  className="flex-1 bg-cyber-cyan text-cyber-darker hover:bg-cyber-blue"
                >
                  Done
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
