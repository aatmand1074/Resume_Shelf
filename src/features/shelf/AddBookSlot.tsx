import React from 'react'
import { Plus } from 'lucide-react'

export interface AddBookSlotProps {
  shelfName: string
  onClick?: () => void
}

export const AddBookSlot: React.FC<AddBookSlotProps> = ({ shelfName, onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Add resume to ${shelfName}`}
      className="
        group flex flex-col items-center justify-center w-11 sm:w-12 h-[175px]
        rounded-t-[5px] border-2 border-dashed border-[var(--color-border)]
        hover:border-[var(--color-accent)] hover:bg-[var(--color-accent-muted)]
        transition-all duration-200 cursor-pointer outline-none shrink-0
        focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]
        opacity-50 hover:opacity-100
      "
    >
      <div className="flex flex-col items-center gap-2 text-[var(--color-muted)] group-hover:text-[var(--color-accent)] transition-colors">
        <div className="w-6 h-6 rounded-full border-2 border-current flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
          <Plus className="w-3.5 h-3.5" />
        </div>
        <span
          className="text-[10px] font-semibold uppercase tracking-wider"
          style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
        >
          Add
        </span>
      </div>
    </button>
  )
}
