import React from 'react'
import type { Category } from '@/domain/types'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { SPINE_PALETTE } from '@/domain/types'

interface CategoryFormContentProps {
  category?: Category
  onClose: () => void
  onSave: (name: string, color: string) => Promise<void>
  onDelete?: (id: string) => Promise<void>
}

const CategoryFormContent: React.FC<CategoryFormContentProps> = ({
  category,
  onClose,
  onSave,
  onDelete,
}) => {
  const [name, setName] = React.useState(category?.name ?? '')
  const [color, setColor] = React.useState(category?.color ?? SPINE_PALETTE[0])
  const [error, setError] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(false)

  const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>): void => {
    e.preventDefault()
    if (!name.trim()) {
      setError('Shelf name is required.')
      return
    }

    setLoading(true)
    setError(null)
    void onSave(name.trim(), color)
      .then(() => {
        onClose()
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Failed to save shelf')
      })
      .finally(() => {
        setLoading(false)
      })
  }

  const handleDelete = (): void => {
    if (!category || !onDelete) return
    setLoading(true)
    setError(null)
    void onDelete(category.id)
      .then(() => {
        onClose()
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Cannot delete shelf')
      })
      .finally(() => {
        setLoading(false)
      })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-2">
      {error && (
        <div className="p-2.5 rounded-[var(--radius-md)] bg-red-50 text-red-700 text-xs border border-red-200">
          {error}
        </div>
      )}

      <div className="space-y-1.5">
        <label htmlFor="category-name-input" className="text-xs font-semibold text-[var(--color-ink)]">
          Shelf Name
        </label>
        <Input
          id="category-name-input"
          value={name}
          onChange={(e) => {
            setName(e.target.value)
          }}
          placeholder="e.g. AI / Machine Learning"
          maxLength={50}
          autoFocus
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-[var(--color-ink)]">
          Accent Color
        </label>
        <div className="flex items-center gap-2 pt-1">
          {SPINE_PALETTE.map((palColor) => (
            <button
              key={palColor}
              type="button"
              onClick={() => {
                setColor(palColor)
              }}
              className={`w-7 h-7 rounded-full transition-transform cursor-pointer ${
                color === palColor ? 'ring-2 ring-offset-2 ring-[var(--color-walnut)] scale-110' : 'opacity-70 hover:opacity-100'
              }`}
              style={{ backgroundColor: palColor }}
            />
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-[var(--color-border)]">
        {category && onDelete ? (
          <Button
            type="button"
            variant="danger"
            size="sm"
            onClick={handleDelete}
            disabled={loading}
          >
            Delete Shelf
          </Button>
        ) : (
          <div />
        )}

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" size="sm" disabled={loading}>
            {loading ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>
    </form>
  )
}

export interface CategoryDialogProps {
  open: boolean
  category?: Category
  onOpenChange: (open: boolean) => void
  onSave: (name: string, color: string) => Promise<void>
  onDelete?: (id: string) => Promise<void>
}

export const CategoryDialog: React.FC<CategoryDialogProps> = ({
  open,
  category,
  onOpenChange,
  onSave,
  onDelete,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{category ? 'Edit Shelf' : 'Create New Shelf'}</DialogTitle>
          <DialogDescription>
            {category
              ? 'Update the name and accent color for this resume shelf.'
              : 'Add a new category shelf to organize your resumes.'}
          </DialogDescription>
        </DialogHeader>

        {open && (
          <CategoryFormContent
            key={category?.id ?? 'new'}
            category={category}
            onClose={() => {
              onOpenChange(false)
            }}
            onSave={onSave}
            onDelete={onDelete}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

