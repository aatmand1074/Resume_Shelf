import React from 'react'
import { BookOpen, CheckCircle2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { storageAdapter } from '@/storage/hooks'
import { STARTER_CATEGORIES, DEFAULT_SPACE_ID } from '@/storage/seed'
import { SPINE_PALETTE } from '@/domain/types'
import type { Category } from '@/domain/types'

interface OnboardingDialogProps {
  open: boolean
  onDone: () => void
}

export const OnboardingDialog: React.FC<OnboardingDialogProps> = ({ open, onDone }) => {
  const [selected, setSelected] = React.useState<Set<number>>(
    new Set(STARTER_CATEGORIES.map((_, i) => i))
  )
  const [loading, setLoading] = React.useState(false)

  const toggle = (i: number): void => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(i)) {
        next.delete(i)
      } else {
        next.add(i)
      }
      return next
    })
  }

  const handleStart = (): void => {
    setLoading(true)
    const now = Date.now()
    const toCreate: Category[] = Array.from(selected).map((i) => ({
      id: crypto.randomUUID(),
      spaceId: DEFAULT_SPACE_ID,
      name: STARTER_CATEGORIES[i].name,
      color: STARTER_CATEGORIES[i].color,
      order: i,
      createdAt: now,
    }))

    void (async () => {
      for (const cat of toCreate) {
        await storageAdapter.categories.save(cat)
      }
      await storageAdapter.meta.set('onboardingComplete', true)
    })()
      .then(() => {
        onDone()
      })
      .catch(() => {
        onDone()
      })
      .finally(() => {
        setLoading(false)
      })
  }

  const handleSkip = (): void => {
    void storageAdapter.meta.set('onboardingComplete', true).then(onDone)
  }

  return (
    <Dialog open={open} onOpenChange={() => undefined}>
      <DialogContent className="max-w-md" onPointerDownOutside={(e) => { e.preventDefault() }}>
        <DialogHeader>
          <div className="flex items-center justify-center mb-3">
            <span className="text-5xl">📚</span>
          </div>
          <DialogTitle className="text-center text-xl">Welcome to Resume Shelf</DialogTitle>
          <DialogDescription className="text-center">
            Organize your resume versions on a visual bookshelf. Choose starter shelves to hit the
            ground running, or start with an empty library.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 pt-1">
          <p className="text-xs font-semibold text-[var(--color-ink)]">Starter Shelves</p>
          {STARTER_CATEGORIES.map((cat, i) => {
            const isSelected = selected.has(i)
            return (
              <button
                key={cat.name}
                type="button"
                onClick={() => { toggle(i) }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-md)] border transition-colors cursor-pointer text-left"
                style={{
                  borderColor: isSelected ? SPINE_PALETTE[i % SPINE_PALETTE.length].replace('var(', '').replace(')', '') : 'var(--color-border)',
                  backgroundColor: isSelected ? 'var(--color-surface-raised)' : 'transparent',
                }}
              >
                <span
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: `var(--spine-${i % 8})` }}
                />
                <span className="flex-1 text-sm text-[var(--color-ink)]">{cat.name}</span>
                {isSelected && (
                  <CheckCircle2 className="w-4 h-4 text-[var(--color-walnut)] shrink-0" />
                )}
              </button>
            )
          })}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-[var(--color-border)]">
          <Button variant="ghost" size="sm" onClick={handleSkip} disabled={loading}>
            Start blank
          </Button>
          <Button size="sm" onClick={handleStart} disabled={loading || selected.size === 0}>
            <BookOpen className="w-3.5 h-3.5" />
            {loading ? 'Setting up…' : `Add ${selected.size} Shelf${selected.size !== 1 ? 'ves' : ''}`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
