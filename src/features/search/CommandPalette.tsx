import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog'
import { Input } from '@/components/ui/Input'
import {
  searchResumes,
  loadTextIndexCache,
  type SearchResultItem,
  type GroupedSearchResults,
} from './searchIndex'
import { storageAdapter } from '@/storage/hooks'
import type { Category, Resume } from '@/domain/types'
import { Search, Book, ArrowRight, CornerDownLeft, FileText, Tag, Briefcase } from 'lucide-react'

export interface CommandPaletteContentProps {
  resumes: Resume[]
  categories: Category[]
  onSelectResume: (resume: Resume) => void
  onQuickDownload?: (resume: Resume) => void
  onClose: () => void
}

export const CommandPaletteContent: React.FC<CommandPaletteContentProps> = ({
  resumes,
  categories,
  onSelectResume,
  onQuickDownload,
  onClose,
}) => {
  const [query, setQuery] = React.useState('')
  const [textIndexMap, setTextIndexMap] = React.useState<Map<string, string> | undefined>(undefined)
  const [selectedIndex, setSelectedIndex] = React.useState(0)

  // Lazy load text index on mount of open palette
  React.useEffect(() => {
    let active = true
    loadTextIndexCache(storageAdapter)
      .then((map) => {
        if (active) setTextIndexMap(map)
      })
      .catch((err: unknown) => {
        console.warn('Could not load text index cache:', err)
      })

    return () => {
      active = false
    }
  }, [])

  const groupedResults: GroupedSearchResults[] = React.useMemo(() => {
    return searchResumes(query, resumes, categories, textIndexMap)
  }, [query, resumes, categories, textIndexMap])

  // Flat list of all results for keyboard selection
  const flatItems: SearchResultItem[] = React.useMemo(() => {
    return groupedResults.flatMap((g) => g.items)
  }, [groupedResults])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (flatItems.length > 0) {
        setSelectedIndex((prev) => (prev + 1) % flatItems.length)
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (flatItems.length > 0) {
        setSelectedIndex((prev) => (prev - 1 + flatItems.length) % flatItems.length)
      }
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const selected = flatItems[selectedIndex]
      if (selected as SearchResultItem | undefined) {
        if (e.shiftKey) {
          onQuickDownload?.(selected.resume)
        } else {
          onSelectResume(selected.resume)
          onClose()
        }
      }
    }
  }

  const renderBadge = (item: SearchResultItem): React.ReactNode => {
    switch (item.matchedField) {
      case 'pdfContent':
        return (
          <span className="flex items-center gap-1 text-[10px] text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 px-1.5 py-0.5 rounded-[var(--radius-sm)] border border-amber-200 dark:border-amber-800">
            <FileText className="w-3 h-3" />
            Inside PDF
          </span>
        )
      case 'skills':
        return (
          <span className="flex items-center gap-1 text-[10px] text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 px-1.5 py-0.5 rounded-[var(--radius-sm)] border border-emerald-200 dark:border-emerald-800">
            <Tag className="w-3 h-3" />
            Skill Match
          </span>
        )
      case 'tailoredFor':
        return (
          <span className="flex items-center gap-1 text-[10px] text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/50 px-1.5 py-0.5 rounded-[var(--radius-sm)] border border-sky-200 dark:border-sky-800">
            <Briefcase className="w-3 h-3" />
            Company
          </span>
        )
      default:
        return null
    }
  }

  return (
    <>
      {/* Search Header Bar */}
      <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[var(--color-border)] bg-[var(--color-surface)]">
        <Search className="w-5 h-5 text-[var(--color-muted)] shrink-0" />
        <Input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setSelectedIndex(0)
          }}
          onKeyDown={handleKeyDown}
          placeholder="Search roles, skills, tailored companies, or text inside resumes..."
          className="border-0 shadow-none focus-visible:ring-0 text-sm px-0 bg-transparent placeholder:text-[var(--color-muted)]"
          autoFocus
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('')
              setSelectedIndex(0)
            }}
            className="text-xs text-[var(--color-muted)] hover:text-[var(--color-ink)] px-2 py-1 rounded-[var(--radius-sm)] cursor-pointer"
          >
            Clear
          </button>
        )}
      </div>

      {/* Results List */}
      <div className="max-h-[380px] overflow-y-auto p-2 divide-y divide-[var(--color-border)]/40">
        {!query.trim() ? (
          <div className="py-12 text-center text-xs text-[var(--color-muted)] space-y-1">
            <p>Type to search across resume titles, skills, tailored companies, and PDF text.</p>
            <p className="text-[11px] opacity-75">
              Press <kbd className="font-mono bg-[var(--color-surface-raised)] border border-[var(--color-border)] px-1 rounded-xs">↑</kbd> <kbd className="font-mono bg-[var(--color-surface-raised)] border border-[var(--color-border)] px-1 rounded-xs">↓</kbd> to navigate, <kbd className="font-mono bg-[var(--color-surface-raised)] border border-[var(--color-border)] px-1 rounded-xs">Enter</kbd> to open, or <kbd className="font-mono bg-[var(--color-surface-raised)] border border-[var(--color-border)] px-1 rounded-xs">Shift+Enter</kbd> to download.
            </p>
          </div>
        ) : flatItems.length === 0 ? (
          <div className="py-12 text-center text-xs text-[var(--color-muted)]">
            No matching resumes found for &quot;{query}&quot;.
          </div>
        ) : (
          groupedResults.map((group) => (
            <div key={group.categoryId} className="pt-2 pb-1">
              <span className="text-[11px] font-semibold text-[var(--color-muted)] uppercase tracking-wider px-3 mb-1 block">
                {group.categoryName}
              </span>

              <div className="space-y-1">
                {group.items.map((item) => {
                  const globalIdx = flatItems.indexOf(item)
                  const isSelected = globalIdx === selectedIndex

                  return (
                    <button
                      key={`${item.resume.id}-${item.matchedField}`}
                      type="button"
                      onClick={() => {
                        onSelectResume(item.resume)
                        onClose()
                      }}
                      onMouseEnter={() => {
                        setSelectedIndex(globalIdx)
                      }}
                      className={`w-full text-left p-3 rounded-[var(--radius-md)] flex items-start gap-3 transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-[var(--color-surface-raised)] ring-1 ring-[var(--color-walnut)]'
                          : 'hover:bg-[var(--color-surface-raised)]/60'
                      }`}
                    >
                      <div
                        className="w-3 h-8 rounded-[2px] shrink-0 mt-0.5 shadow-xs"
                        style={{ backgroundColor: item.resume.spineColor }}
                      />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-serif font-bold text-sm text-[var(--color-walnut)] truncate">
                            {item.resume.title}
                          </span>
                          <span className="text-[10px] font-mono text-[var(--color-muted)] bg-[var(--color-surface-raised)] border border-[var(--color-border)] px-1.5 rounded-xs">
                            {item.resume.version || 'v1.0'}
                          </span>
                          {renderBadge(item)}
                        </div>

                        <p className="text-xs text-[var(--color-ink)] opacity-90 mt-0.5 line-clamp-1 font-mono">
                          {item.snippet}
                        </p>
                      </div>

                      <div className="flex items-center text-[var(--color-muted)] opacity-0 group-hover:opacity-100 shrink-0">
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer Shortcut Bar */}
      <div className="px-4 py-2 border-t border-[var(--color-border)] bg-[var(--color-surface-raised)] flex items-center justify-between text-[11px] text-[var(--color-muted)]">
        <span>{flatItems.length} result(s) found</span>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <CornerDownLeft className="w-3 h-3" /> Open Drawer
          </span>
          <span className="flex items-center gap-1">
            <Book className="w-3 h-3" /> Shift+Enter Quick Download
          </span>
        </div>
      </div>
    </>
  )
}

export interface CommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  resumes: Resume[]
  categories: Category[]
  onSelectResume: (resume: Resume) => void
  onQuickDownload?: (resume: Resume) => void
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  open,
  onOpenChange,
  resumes,
  categories,
  onSelectResume,
  onQuickDownload,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden rounded-[var(--radius-xl)] bg-[var(--color-surface)] border border-[var(--color-border)] shadow-2xl">
        <DialogHeader className="sr-only">
          <DialogTitle>Search Resumes</DialogTitle>
        </DialogHeader>

        {open && (
          <CommandPaletteContent
            resumes={resumes}
            categories={categories}
            onSelectResume={onSelectResume}
            onQuickDownload={onQuickDownload}
            onClose={() => {
              onOpenChange(false)
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
