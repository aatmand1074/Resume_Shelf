import React from 'react'
import { Button } from '@/components/ui/Button'
import {
  Download,
  Bookmark,
  Copy,
  Trash2,
  FolderInput,
  RefreshCw,
} from 'lucide-react'
import type { Category, Resume } from '@/domain/types'

export interface ResumeActionsProps {
  resume: Resume
  categories: Category[]
  onDownload: () => void
  onTogglePin: () => void
  onDuplicate: () => void
  onMoveShelf: (newCategoryId: string) => void
  onReplaceFile: () => void
  onDelete: () => void
}

export const ResumeActions: React.FC<ResumeActionsProps> = ({
  resume,
  categories,
  onDownload,
  onTogglePin,
  onDuplicate,
  onMoveShelf,
  onReplaceFile,
  onDelete,
}) => {
  const [moving, setMoving] = React.useState(false)

  return (
    <div className="space-y-4 pt-2">
      {/* Primary Download CTA */}
      <Button
        onClick={onDownload}
        size="lg"
        className="w-full py-5 text-sm font-semibold shadow-md flex items-center justify-center gap-2 cursor-pointer"
      >
        <Download className="w-4 h-4" />
        <span>Download Resume ({resume.fileName.endsWith('.pdf') ? 'PDF' : 'DOCX'})</span>
      </Button>

      {/* Secondary Quick Action Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onTogglePin}
          className="text-xs flex items-center justify-center gap-1.5"
          title={resume.pinned ? 'Unpin from shelf' : 'Pin to top of shelf'}
        >
          <Bookmark className={`w-3.5 h-3.5 ${resume.pinned ? 'fill-amber-500 text-amber-500' : ''}`} />
          <span>{resume.pinned ? 'Pinned' : 'Pin'}</span>
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={onDuplicate}
          className="text-xs flex items-center justify-center gap-1.5"
        >
          <Copy className="w-3.5 h-3.5" />
          <span>Duplicate</span>
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={onReplaceFile}
          className="text-xs flex items-center justify-center gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Replace</span>
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setMoving(!moving)
          }}
          className="text-xs flex items-center justify-center gap-1.5"
        >
          <FolderInput className="w-3.5 h-3.5" />
          <span>Move</span>
        </Button>
      </div>

      {/* Shelf Relocation Dropdown */}
      {moving && (
        <div className="p-3 rounded-[var(--radius-md)] bg-[var(--color-surface-raised)] border border-[var(--color-border)] space-y-2 animate-in fade-in">
          <label htmlFor="move-shelf-select" className="text-xs font-semibold text-[var(--color-ink)] block">
            Move to another shelf:
          </label>
          <select
            id="move-shelf-select"
            value={resume.categoryId}
            onChange={(e) => {
              onMoveShelf(e.target.value)
              setMoving(false)
            }}
            className="w-full h-8 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface)] px-2 text-xs text-[var(--color-ink)] outline-none"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} {c.id === resume.categoryId ? '(Current)' : ''}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Destructive Delete Button */}
      <div className="pt-2 border-t border-[var(--color-border)] flex justify-end">
        <Button
          variant="ghost"
          size="sm"
          onClick={onDelete}
          className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50 flex items-center gap-1.5 cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Delete Resume</span>
        </Button>
      </div>
    </div>
  )
}
