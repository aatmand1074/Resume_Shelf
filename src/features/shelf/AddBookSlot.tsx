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
      className="group flex flex-col items-center justify-center w-11 sm:w-12 h-[175px] rounded-t-[4px] border-2 border-dashed border-[var(--color-border)] hover:border-[var(--color-walnut)] hover:bg-[var(--color-surface-raised)] transition-all duration-200 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-walnut)] shrink-0 opacity-60 hover:opacity-100"
    >
      <div className="flex flex-col items-center gap-1.5 text-[var(--color-muted)] group-hover:text-[var(--color-walnut)]">
        <Plus className="w-4 h-4 transition-transform group-hover:scale-125" />
        <span
          className="text-[10px] font-medium uppercase tracking-wider"
          style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
        >
          Add
        </span>
      </div>
    </button>
  )
}

