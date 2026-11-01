import React from 'react'
import { X, Plus } from 'lucide-react'
import { cn } from '@/components/ui/utils'

export interface TagInputProps {
  tags: string[]
  onChange: (tags: string[]) => void
  maxTags?: number
  placeholder?: string
  className?: string
}

export const TagInput: React.FC<TagInputProps> = ({
  tags,
  onChange,
  maxTags = 12,
  placeholder = 'Add a skill...',
  className,
}) => {
  const [inputValue, setInputValue] = React.useState('')

  const handleAddTag = (): void => {
    const trimmed = inputValue.trim()
    if (!trimmed) return
    if (tags.length >= maxTags) return
    if (tags.some((t) => t.toLowerCase() === trimmed.toLowerCase())) {
      setInputValue('')
      return
    }

    onChange([...tags, trimmed])
    setInputValue('')
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      handleAddTag()
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      onChange(tags.slice(0, -1))
    }
  }

  const handleRemoveTag = (indexToRemove: number): void => {
    onChange(tags.filter((_, idx) => idx !== indexToRemove))
  }

  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-1.5 p-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] min-h-[42px] focus-within:ring-2 focus-within:ring-[var(--color-walnut)]',
        className
      )}
    >
      {tags.map((tag, idx) => (
        <span
          key={`${tag}-${idx.toString()}`}
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[var(--radius-sm)] text-xs font-medium bg-[var(--color-surface-raised)] border border-[var(--color-border)] text-[var(--color-ink)]"
        >
          {tag}
          <button
            type="button"
            onClick={() => {
              handleRemoveTag(idx)
            }}
            className="text-[var(--color-muted)] hover:text-red-600 transition-colors cursor-pointer"
            aria-label={`Remove ${tag}`}
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      ))}

      {tags.length < maxTags && (
        <div className="flex-1 flex items-center min-w-[120px]">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value)
            }}
            onKeyDown={handleKeyDown}
            onBlur={handleAddTag}
            placeholder={tags.length === 0 ? placeholder : ''}
            className="w-full bg-transparent text-xs text-[var(--color-ink)] placeholder:text-[var(--color-muted)] outline-none"
          />
          {inputValue && (
            <button
              type="button"
              onClick={() => {
                handleAddTag()
              }}
              className="text-[var(--color-muted)] hover:text-[var(--color-walnut)] p-0.5"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}
    </div>
  )
}
