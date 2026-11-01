import React from 'react'
import { SPINE_PALETTE } from '@/domain/types'
import { cn } from '@/components/ui/utils'

export interface ColorPickerProps {
  value: string
  onChange: (color: string) => void
  palette?: readonly string[]
  className?: string
}

export const ColorPicker: React.FC<ColorPickerProps> = ({
  value,
  onChange,
  palette = SPINE_PALETTE,
  className,
}) => {
  return (
    <div className={cn('flex items-center gap-2 flex-wrap', className)}>
      {palette.map((color) => {
        const isSelected = value.toLowerCase() === color.toLowerCase()
        return (
          <button
            key={color}
            type="button"
            onClick={() => {
              onChange(color)
            }}
            className={cn(
              'w-7 h-7 rounded-full transition-transform cursor-pointer shadow-xs',
              isSelected
                ? 'ring-2 ring-offset-2 ring-[var(--color-walnut)] scale-110'
                : 'opacity-75 hover:opacity-100 hover:scale-105'
            )}
            style={{ backgroundColor: color }}
            aria-label={`Select color ${color}`}
            aria-pressed={isSelected}
          />
        )
      })}
    </div>
  )
}
