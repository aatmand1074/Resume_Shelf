import React from 'react'
import type { Resume } from '@/domain/types'
import { HoverCard, HoverCardTrigger } from '@/components/ui/HoverCard'
import { BookHoverCard } from './BookHoverCard'
import { Bookmark } from 'lucide-react'

export interface BookProps {
  resume: Resume
  onClick?: (resume: Resume) => void
  onQuickDownload?: (resume: Resume) => void
}

export const Book: React.FC<BookProps> = ({ resume, onClick, onQuickDownload }) => {
  const baseHeight = 165
  const pageHeightBonus = Math.min((resume.pageCount || 1) * 12, 45)
  const totalHeight = baseHeight + pageHeightBonus

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>): void => {
    if (e.key === 'Enter') {
      if (e.shiftKey) {
        e.preventDefault()
        onQuickDownload?.(resume)
      } else {
        e.preventDefault()
        onClick?.(resume)
      }
    }
  }

  return (
    <HoverCard openDelay={100} closeDelay={120}>
      <HoverCardTrigger asChild>
        <button
          type="button"
          data-testid="book-spine"
          onClick={() => onClick?.(resume)}
          onKeyDown={handleKeyDown}
          aria-label={`${resume.title}${resume.version ? `, ${resume.version}` : ''}, updated ${new Date(resume.updatedAt).toLocaleDateString()}`}
          className="
            group relative flex flex-col items-center justify-between
            w-11 sm:w-12 rounded-t-[5px] cursor-pointer outline-none select-none shrink-0
            transition-all duration-250 ease-out
            hover:-translate-y-3 hover:scale-[1.04]
            focus-visible:-translate-y-3 focus-visible:scale-[1.04]
            focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]
          "
          style={{
            height: `${totalHeight.toString()}px`,
            backgroundColor: resume.spineColor,
            boxShadow: 'var(--shadow-book)',
            transition: 'transform 0.22s cubic-bezier(0.22,1,0.36,1), box-shadow 0.22s ease',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.boxShadow = 'var(--shadow-book-hover)'
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.boxShadow = 'var(--shadow-book)'
          }}
        >
          {/* Top ribbon */}
          <div className="w-full flex justify-end px-1 pt-1.5 h-6">
            {resume.pinned && (
              <span title="Pinned" className="text-amber-200 drop-shadow">
                <Bookmark className="w-3.5 h-3.5 fill-current" />
              </span>
            )}
          </div>

          {/* Vertical spine title */}
          <div className="flex-1 flex items-center justify-center overflow-hidden py-2 px-0.5">
            <span
              className="font-serif font-semibold text-xs tracking-wide text-white uppercase truncate whitespace-nowrap block"
              style={{
                writingMode: 'vertical-rl',
                transform: 'rotate(180deg)',
                textShadow: '0 1px 3px rgba(0,0,0,0.4)',
                maxHeight: `${(totalHeight - 50).toString()}px`,
              }}
            >
              {resume.title}
            </span>
          </div>

          {/* Version tag */}
          <div className="w-full pb-2 flex justify-center">
            <span className="text-[9px] font-mono text-white/75 font-bold tracking-wider">
              {resume.version || 'v1'}
            </span>
          </div>

          {/* Spine texture lines */}
          <div className="absolute inset-y-0 left-[3px] w-[1px] bg-white/25 pointer-events-none" />
          <div className="absolute inset-y-0 right-[3px] w-[1px] bg-black/20 pointer-events-none" />

          {/* Top edge shimmer on hover */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-white/40 rounded-t-[5px] opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />
        </button>
      </HoverCardTrigger>

      <BookHoverCard resume={resume} />
    </HoverCard>
  )
}
