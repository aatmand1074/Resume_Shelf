import React from 'react'
import type { Category, Resume } from '@/domain/types'
import { Book } from './Book'
import { AddBookSlot } from './AddBookSlot'
import { MoreVertical, ChevronDown, ChevronRight } from 'lucide-react'

export interface ShelfProps {
  category: Category
  resumes: Resume[]
  onBookClick?: (resume: Resume) => void
  onQuickDownload?: (resume: Resume) => void
  onAddBookClick?: (category: Category) => void
  onEditCategory?: (category: Category) => void
}

export const Shelf: React.FC<ShelfProps> = ({
  category,
  resumes,
  onBookClick,
  onQuickDownload,
  onAddBookClick,
  onEditCategory,
}) => {
  const [collapsed, setCollapsed] = React.useState(false)

  return (
    <div className="flex flex-col mb-12 group/shelf rs-fade-up">
      {/* Category header */}
      <div className="flex items-center justify-between pb-2.5 px-1">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => { setCollapsed(!collapsed) }}
            className="p-1 rounded-[var(--radius-sm)] text-[var(--color-muted)] hover:text-[var(--color-accent)] transition-colors cursor-pointer"
            aria-label={collapsed ? 'Expand shelf' : 'Collapse shelf'}
          >
            {collapsed
              ? <ChevronRight className="w-4 h-4" />
              : <ChevronDown className="w-4 h-4" />}
          </button>

          {/* Color dot with subtle ring */}
          <div
            className="w-3 h-3 rounded-full shrink-0"
            style={{
              backgroundColor: category.color,
              boxShadow: `0 0 0 2px ${category.color}40, 0 0 0 3px var(--color-paper)`,
            }}
          />

          <h3 className="font-serif font-bold text-lg text-[var(--color-walnut)] tracking-tight">
            {category.name}
          </h3>

          <span className="text-xs font-mono text-[var(--color-muted)] bg-[var(--color-surface-raised)] border border-[var(--color-border)] px-2 py-0.5 rounded-full">
            {resumes.length}
          </span>
        </div>

        <button
          type="button"
          onClick={() => onEditCategory?.(category)}
          aria-label={`Manage ${category.name}`}
          className="opacity-0 group-hover/shelf:opacity-100 p-1.5 rounded-[var(--radius-sm)] text-[var(--color-muted)] hover:text-[var(--color-accent)] hover:bg-[var(--color-accent-muted)] transition-all cursor-pointer"
        >
          <MoreVertical className="w-4 h-4" />
        </button>
      </div>

      {/* Books container with animated height collapse */}
      <div
        className="overflow-hidden transition-all duration-350"
        style={{
          maxHeight: collapsed ? '0px' : '500px',
          opacity: collapsed ? 0 : 1,
          transition: 'max-height 0.35s cubic-bezier(0.22,1,0.36,1), opacity 0.25s ease',
        }}
      >
        <div className="relative">
          {/* Background shelf surface — subtle teal tint */}
          <div
            className="absolute inset-x-0 top-0 bottom-3 rounded-t-[var(--radius-md)] opacity-30"
            style={{
              background: 'linear-gradient(180deg, var(--color-surface-raised) 0%, transparent 100%)',
            }}
          />

          <div className="flex items-end gap-3.5 sm:gap-4 overflow-x-auto pb-1 pt-6 px-4 scrollbar-none min-h-[230px] rs-stagger">
            {resumes.length === 0 ? (
              <div className="h-[175px] flex items-center justify-center text-xs text-[var(--color-muted)] italic px-4 select-none">
                No resumes yet. Drop a file here or click + to add.
              </div>
            ) : (
              resumes.map((resume) => (
                <div key={resume.id} className="rs-fade-up shrink-0">
                  <Book
                    resume={resume}
                    onClick={onBookClick}
                    onQuickDownload={onQuickDownload}
                  />
                </div>
              ))
            )}
            <AddBookSlot
              shelfName={category.name}
              onClick={() => onAddBookClick?.(category)}
            />
          </div>

          {/* Shelf plank — terracotta-teal gradient */}
          <div
            className="relative w-full h-4 rounded-[var(--radius-sm)]"
            style={{
              background: 'linear-gradient(180deg, #5A9490 0%, var(--deep-teal, #154A45) 100%)',
              boxShadow: '0 4px 12px rgba(3,28,22,0.28)',
              borderTop: '1px solid rgba(255,255,255,0.12)',
            }}
          >
            {/* Plank highlight */}
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-white/20 rounded-t-[var(--radius-sm)]" />
          </div>

          {/* Drop shadow under plank */}
          <div
            className="w-[97%] mx-auto h-3 rounded-b-full"
            style={{
              background: 'radial-gradient(ellipse at center, rgba(3,28,22,0.22) 0%, transparent 70%)',
            }}
          />
        </div>
      </div>
    </div>
  )
}
