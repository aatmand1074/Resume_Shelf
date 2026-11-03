import React from 'react'
import { Download, Upload, HardDrive } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/Dialog'
import { exportBackup, importBackup } from '@/services/backup'
import { storageAdapter } from '@/storage/hooks'
import { DEFAULT_SPACE_ID } from '@/storage/seed'

interface BackupMenuProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: (msg: string) => void
}

export const BackupMenu: React.FC<BackupMenuProps> = ({ open, onOpenChange, onSuccess }) => {
  const [loading, setLoading] = React.useState<'export' | 'import' | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const importRef = React.useRef<HTMLInputElement>(null)

  const close = (): void => {
    setError(null)
    onOpenChange(false)
  }

  const handleExport = (): void => {
    setLoading('export')
    setError(null)
    void exportBackup(storageAdapter, DEFAULT_SPACE_ID)
      .then(({ blob, filename }) => {
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = filename
        a.click()
        URL.revokeObjectURL(url)
        void storageAdapter.meta.set('lastBackupAt', Date.now())
        onSuccess('Backup exported successfully')
        close()
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Export failed')
      })
      .finally(() => {
        setLoading(null)
      })
  }

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''

    setLoading('import')
    setError(null)
    void importBackup(file, storageAdapter, { mode: 'merge' })
      .then(({ importedCount, categoriesCount }) => {
        onSuccess(`Imported ${importedCount} resume${importedCount !== 1 ? 's' : ''} across ${categoriesCount} shelf${categoriesCount !== 1 ? 'ves' : ''}`)
        close()
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Import failed — file may be corrupt or incompatible')
      })
      .finally(() => {
        setLoading(null)
      })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HardDrive className="w-4 h-4" />
            Backup & Restore
          </DialogTitle>
          <DialogDescription>
            Export your entire shelf as a .zip archive, or restore from a previous backup.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 pt-1">
          {error && (
            <div className="p-2.5 rounded-[var(--radius-md)] bg-red-50 text-red-700 text-xs border border-red-200">
              {error}
            </div>
          )}

          <button
            type="button"
            onClick={handleExport}
            disabled={loading !== null}
            className="w-full flex items-start gap-3 p-3.5 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] hover:border-[var(--color-walnut)] transition-colors text-left cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4 mt-0.5 text-[var(--color-walnut)] shrink-0" />
            <div>
              <div className="text-sm font-semibold text-[var(--color-ink)]">
                {loading === 'export' ? 'Exporting…' : 'Export Backup'}
              </div>
              <div className="text-xs text-[var(--color-muted)] mt-0.5">
                Downloads all resumes and shelves as a .zip file
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => {
              importRef.current?.click()
            }}
            disabled={loading !== null}
            className="w-full flex items-start gap-3 p-3.5 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] hover:border-[var(--color-walnut)] transition-colors text-left cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Upload className="w-4 h-4 mt-0.5 text-[var(--color-walnut)] shrink-0" />
            <div>
              <div className="text-sm font-semibold text-[var(--color-ink)]">
                {loading === 'import' ? 'Importing…' : 'Restore from Backup'}
              </div>
              <div className="text-xs text-[var(--color-muted)] mt-0.5">
                Merges a .zip backup into your current library
              </div>
            </div>
          </button>

          <input
            ref={importRef}
            type="file"
            accept=".zip"
            className="hidden"
            onChange={handleImportFile}
          />
        </div>

        <div className="flex justify-end pt-2 border-t border-[var(--color-border)]">
          <Button variant="outline" size="sm" onClick={close} disabled={loading !== null}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
