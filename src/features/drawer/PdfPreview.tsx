import React from 'react'
import { renderFirstPageToCanvas } from '@/services/pdf'
import { FileText, Loader2, AlertCircle } from 'lucide-react'

export interface PdfPreviewProps {
  blob?: Blob
  mimeType: string
  fileName: string
}

export const PdfPreview: React.FC<PdfPreviewProps> = ({ blob, mimeType, fileName }) => {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const isPdf = mimeType === 'application/pdf' || fileName.toLowerCase().endsWith('.pdf')

  React.useEffect(() => {
    if (!isPdf || !blob || !canvasRef.current) {
      return
    }

    let active = true

    renderFirstPageToCanvas(blob, canvasRef.current, 0.8)
      .then(() => {
        if (active) setLoading(false)
      })
      .catch((err: unknown) => {
        if (active) {
          console.warn('Could not render PDF preview:', err)
          setError('Could not render PDF preview.')
          setLoading(false)
        }
      })

    return () => {
      active = false
    }
  }, [blob, isPdf])

  if (!isPdf) {
    return (
      <div className="w-full h-48 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] flex flex-col items-center justify-center p-4 text-center space-y-2">
        <FileText className="w-12 h-12 text-[var(--color-walnut)] opacity-80" />
        <p className="text-xs font-semibold text-[var(--color-ink)] truncate max-w-full">
          {fileName}
        </p>
        <span className="text-[11px] text-[var(--color-muted)]">
          DOCX document preview not available in browser. Download to view.
        </span>
      </div>
    )
  }

  return (
    <div className="relative w-full min-h-[220px] rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] flex items-center justify-center overflow-hidden shadow-inner">
      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[var(--color-surface-raised)] z-10 space-y-2">
          <Loader2 className="w-6 h-6 animate-spin text-[var(--color-walnut)]" />
          <span className="text-xs text-[var(--color-muted)]">Rendering preview...</span>
        </div>
      )}

      {error ? (
        <div className="flex flex-col items-center justify-center p-4 text-center text-xs text-[var(--color-muted)] space-y-1.5">
          <AlertCircle className="w-6 h-6 text-amber-500" />
          <p>{error}</p>
        </div>
      ) : (
        <canvas ref={canvasRef} className="max-w-full h-auto shadow-md rounded-[2px]" />
      )}
    </div>
  )
}
