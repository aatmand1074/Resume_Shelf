import React from 'react'
import { UploadCloud } from 'lucide-react'

export interface DropOverlayProps {
  onFileDrop: (file: File) => void
}

export const DropOverlay: React.FC<DropOverlayProps> = ({ onFileDrop }) => {
  const [isDragging, setIsDragging] = React.useState(false)
  const dragCounter = React.useRef(0)

  React.useEffect(() => {
    const handleDragEnter = (e: DragEvent): void => {
      e.preventDefault()
      dragCounter.current += 1
      if (e.dataTransfer?.types.includes('Files')) {
        setIsDragging(true)
      }
    }

    const handleDragLeave = (e: DragEvent): void => {
      e.preventDefault()
      dragCounter.current -= 1
      if (dragCounter.current <= 0) {
        dragCounter.current = 0
        setIsDragging(false)
      }
    }

    const handleDragOver = (e: DragEvent): void => {
      e.preventDefault()
    }

    const handleDrop = (e: DragEvent): void => {
      e.preventDefault()
      dragCounter.current = 0
      setIsDragging(false)

      const files = e.dataTransfer?.files
      if (files && files.length > 0) {
        const file = files[0]
        onFileDrop(file)
      }
    }

    window.addEventListener('dragenter', handleDragEnter)
    window.addEventListener('dragleave', handleDragLeave)
    window.addEventListener('dragover', handleDragOver)
    window.addEventListener('drop', handleDrop)

    return () => {
      window.removeEventListener('dragenter', handleDragEnter)
      window.removeEventListener('dragleave', handleDragLeave)
      window.removeEventListener('dragover', handleDragOver)
      window.removeEventListener('drop', handleDrop)
    }
  }, [onFileDrop])

  if (!isDragging) return null

  return (
    <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center bg-[var(--color-walnut)]/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="p-8 sm:p-12 rounded-[var(--radius-xl)] border-2 border-dashed border-white/60 bg-[var(--color-surface)]/95 shadow-2xl flex flex-col items-center text-center space-y-4 max-w-md mx-4 transform scale-105 transition-transform">
        <div className="p-4 rounded-full bg-[var(--color-surface-raised)] border border-[var(--color-border)] text-[var(--color-walnut)] shadow-inner">
          <UploadCloud className="w-10 h-10 animate-bounce" />
        </div>
        <div>
          <h3 className="font-serif font-bold text-xl text-[var(--color-walnut)]">
            Drop Resume Here
          </h3>
          <p className="text-xs text-[var(--color-muted)] mt-1">
            Accepts PDF or DOCX files. We'll automatically suggest skills and details.
          </p>
        </div>
      </div>
    </div>
  )
}
