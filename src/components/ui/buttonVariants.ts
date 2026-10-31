import { cva } from 'class-variance-authority'

export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[var(--radius-md)] text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-walnut)] disabled:pointer-events-none disabled:opacity-50 cursor-pointer select-none',
  {
    variants: {
      variant: {
        default:
          'bg-[var(--color-walnut)] text-[var(--color-paper)] hover:bg-[var(--color-walnut-light)] shadow-sm',
        outline:
          'border border-[var(--color-border)] bg-transparent hover:bg-[var(--color-surface-raised)] text-[var(--color-ink)]',
        secondary:
          'bg-[var(--color-surface-raised)] text-[var(--color-ink)] hover:bg-[var(--color-border)]',
        ghost:
          'hover:bg-[var(--color-surface-raised)] text-[var(--color-ink)]',
        danger:
          'bg-red-700 text-white hover:bg-red-800',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 rounded-[var(--radius-sm)] px-3 text-xs',
        lg: 'h-10 rounded-[var(--radius-lg)] px-6 text-base',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

