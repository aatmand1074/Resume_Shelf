import React from 'react'
import { Settings } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { storageAdapter } from '@/storage/hooks'
import type { Space } from '@/domain/types'

interface SettingsDialogProps {
  open: boolean
  space: Space
  onOpenChange: (open: boolean) => void
  onSuccess: (msg: string) => void
}

export const SettingsDialog: React.FC<SettingsDialogProps> = ({
  open,
  space,
  onOpenChange,
  onSuccess,
}) => {
  const [name, setName] = React.useState(space.name)
  const [tagline, setTagline] = React.useState(space.tagline ?? '')
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (open) {
      setName(space.name)
      setTagline(space.tagline ?? '')
      setError(null)
    }
  }, [open, space])

  const handleSave = (e: React.FormEvent): void => {
    e.preventDefault()
    if (!name.trim()) {
      setError('Library name is required.')
      return
    }
    setLoading(true)
    setError(null)
    void storageAdapter.spaces
      .save({ ...space, name: name.trim(), tagline: tagline.trim() || undefined })
      .then(() => {
        onSuccess('Settings saved')
        onOpenChange(false)
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Failed to save settings')
      })
      .finally(() => {
        setLoading(false)
      })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Library Settings
          </DialogTitle>
          <DialogDescription>
            Customize the name and tagline shown in the header.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSave} className="space-y-4 pt-1">
          {error && (
            <div className="p-2.5 rounded-[var(--radius-md)] bg-red-50 text-red-700 text-xs border border-red-200">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label htmlFor="settings-name" className="text-xs font-semibold text-[var(--color-ink)]">
              Library Name
            </label>
            <Input
              id="settings-name"
              value={name}
              onChange={(e) => { setName(e.target.value) }}
              maxLength={50}
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="settings-tagline" className="text-xs font-semibold text-[var(--color-ink)]">
              Tagline <span className="font-normal text-[var(--color-muted)]">(optional)</span>
            </label>
            <Input
              id="settings-tagline"
              value={tagline}
              onChange={(e) => { setTagline(e.target.value) }}
              maxLength={100}
              placeholder="e.g. Personal Resume Shelves"
            />
          </div>

          <div className="pt-2 border-t border-[var(--color-border)] text-xs text-[var(--color-muted)] space-y-1">
            <p>Storage: IndexedDB · Local browser only · No server sync</p>
            <p>Version: Resume Shelf v1.0</p>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => { onOpenChange(false) }}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={loading}>
              {loading ? 'Saving…' : 'Save'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
