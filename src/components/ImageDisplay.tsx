import { Download, Maximize2 } from 'lucide-react'
import { useState } from 'react'
import { Button } from './ui/button'
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from './ui/dialog'
import { BorderBeam } from './ui/border-beam'

interface ImageDisplayProps {
  data: string
  mimeType: string
  index: number
}

export default function ImageDisplay({ data, mimeType, index }: ImageDisplayProps) {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const imageUrl = `data:${mimeType};base64,${data}`

  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = imageUrl
    link.download = `cipherwolf-image-${Date.now()}-${index}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="group relative inline-block rounded-lg overflow-hidden border border-cyber-cyan/50 hover:border-cyber-cyan transition-colors">
      <BorderBeam
        size={100}
        duration={8}
        colorFrom="#00FFFF"
        colorTo="#0080FF"
        borderWidth={2}
      />
      <img
        src={imageUrl}
        alt={`Generated image ${index + 1}`}
        className="w-full h-auto max-w-full cursor-pointer"
        onClick={() => setIsFullscreen(true)}
      />

      {/* Overlay with actions on hover */}
      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
        <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="bg-cyber-dark/80 border-cyber-cyan text-cyber-cyan hover:bg-cyber-cyan hover:text-cyber-dark"
            >
              <Maximize2 size={18} />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-[95vw] max-h-[95vh] bg-cyber-dark border-cyber-cyan p-0">
            <div className="relative w-full h-full flex items-center justify-center p-4">
              <img
                src={imageUrl}
                alt={`Generated image ${index + 1} (fullscreen)`}
                className="max-w-full max-h-[90vh] object-contain"
              />
            </div>
          </DialogContent>
        </Dialog>

        <Button
          variant="outline"
          size="icon"
          onClick={handleDownload}
          className="bg-cyber-dark/80 border-cyber-cyan text-cyber-cyan hover:bg-cyber-cyan hover:text-cyber-dark"
        >
          <Download size={18} />
        </Button>
      </div>
    </div>
  )
}
