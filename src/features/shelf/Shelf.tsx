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
    <div className="flex flex-col mb-10 group/shelf">
      {/* Category Plate Header */}
      <div className="flex items-center justify-between pb-2 px-1">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setCollapsed(!collapsed)
            }}
            className="p-1 rounded-[var(--radius-sm)] text-[var(--color-muted)] hover:text-[var(--color-walnut)] transition-colors cursor-pointer"
            aria-label={collapsed ? 'Expand shelf' : 'Collapse shelf'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          <div
            className="w-3 h-3 rounded-full shrink-0"
            style={{ backgroundColor: category.color }}
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
          aria-label={`Manage shelf ${category.name}`}
          className="opacity-0 group-hover/shelf:opacity-100 p-1.5 rounded-[var(--radius-sm)] text-[var(--color-muted)] hover:text-[var(--color-walnut)] hover:bg-[var(--color-surface-raised)] transition-all cursor-pointer"
        >
          <MoreVertical className="w-4 h-4" />
        </button>
      </div>

      {/* Books Container */}
      {!collapsed && (
        <div className="relative">
          <div className="flex items-end gap-3.5 sm:gap-4 overflow-x-auto pb-1 pt-6 px-4 scrollbar-none min-h-[220px]">
            {resumes.length === 0 ? (
              <div className="h-[175px] flex items-center justify-center text-xs text-[var(--color-muted)] italic px-4 select-none">
                No resumes yet. Drop a file here or click + to add.
              </div>
            ) : (
              resumes.map((resume) => (
                <Book
                  key={resume.id}
                  resume={resume}
                  onClick={onBookClick}
                  onQuickDownload={onQuickDownload}
                />
              ))
            )}
            <AddBookSlot
              shelfName={category.name}
              onClick={() => onAddBookClick?.(category)}
            />
          </div>

          {/* Wooden Walnut Shelf Base Plank */}
          <div
            className="w-full h-3 rounded-[var(--radius-sm)] shadow-md"
            style={{
              background: 'linear-gradient(180deg, var(--color-walnut-light) 0%, var(--color-walnut) 100%)',
              borderTop: '1px solid rgba(255,255,255,0.15)',
            }}
          />
          {/* Depth shadow under the shelf plank */}
          <div className="w-full h-2 bg-black/10 blur-xs rounded-full" />
        </div>
      )}
    </div>
  )
}
