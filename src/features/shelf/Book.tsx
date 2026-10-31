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
  // Height subtly varies by page count (min 160px for 1 page, max 200px)
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
    <HoverCard openDelay={120} closeDelay={150}>
      <HoverCardTrigger asChild>
        <button
          type="button"
          onClick={() => onClick?.(resume)}
          onKeyDown={handleKeyDown}
          aria-label={`${resume.title}, ${resume.version || ''}, updated ${new Date(
            resume.updatedAt
          ).toLocaleDateString()}`}
          className="group relative flex flex-col items-center justify-between w-11 sm:w-12 rounded-t-[4px] cursor-pointer outline-none transition-all duration-200 hover:-translate-y-2 focus-visible:-translate-y-2 focus-visible:ring-2 focus-visible:ring-[var(--color-walnut)] select-none shrink-0"
          style={{
            height: `${totalHeight.toString()}px`,
            backgroundColor: resume.spineColor,
            boxShadow: 'var(--shadow-book)',
          }}
        >
          {/* Top edge / bookmark ribbon */}
          <div className="w-full flex justify-end px-1 pt-1.5 h-6">
            {resume.pinned && (
              <span title="Pinned Resume" className="text-amber-300 drop-shadow-xs">
                <Bookmark className="w-3.5 h-3.5 fill-current" />
              </span>
            )}
          </div>

          {/* Vertical rotated title along spine */}
          <div className="flex-1 flex items-center justify-center overflow-hidden py-2 px-0.5">
            <span
              className="font-serif font-semibold text-xs tracking-wide text-white uppercase truncate whitespace-nowrap block"
              style={{
                writingMode: 'vertical-rl',
                transform: 'rotate(180deg)',
                textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                maxHeight: `${(totalHeight - 50).toString()}px`,
              }}
            >
              {resume.title}
            </span>
          </div>

          {/* Bottom shelf plate / version tag */}
          <div className="w-full pb-2 flex justify-center">
            <span className="text-[9px] font-mono text-white/80 font-bold">
              {resume.version || 'v1'}
            </span>
          </div>

          {/* Spine texture highlight line */}
          <div className="absolute inset-y-0 left-1 w-[1px] bg-white/20 pointer-events-none" />
          <div className="absolute inset-y-0 right-1 w-[1px] bg-black/15 pointer-events-none" />
        </button>
      </HoverCardTrigger>

      <BookHoverCard resume={resume} />
    </HoverCard>
  )
}

