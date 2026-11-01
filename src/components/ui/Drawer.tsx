import React from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { cn } from '@/components/ui/utils'

export const Drawer = DialogPrimitive.Root
export const DrawerTrigger = DialogPrimitive.Trigger
export const DrawerPortal = DialogPrimitive.Portal
export const DrawerClose = DialogPrimitive.Close

export const DrawerOverlay = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      'fixed inset-0 z-50 bg-black/40 backdrop-blur-xs transition-opacity duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
      className
    )}
    {...props}
  />
))
DrawerOverlay.displayName = 'DrawerOverlay'

export const DrawerContent = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DrawerPortal>
    <DrawerOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        'fixed z-50 bg-[var(--color-surface)] shadow-2xl transition ease-in-out duration-300',
        // Responsive behavior: bottom sheet on small screens (<640px), right-hand drawer on desktop
        'inset-x-0 bottom-0 max-h-[90vh] rounded-t-[var(--radius-xl)] border-t border-[var(--color-border)]',
        'sm:inset-y-0 sm:right-0 sm:left-auto sm:h-full sm:max-h-none sm:w-[480px] sm:rounded-none sm:rounded-l-[var(--radius-xl)] sm:border-l sm:border-t-0',
        'data-[state=open]:animate-in data-[state=closed]:animate-out',
        'data-[state=closed]:slide-out-to-bottom sm:data-[state=closed]:slide-out-to-right',
        'data-[state=open]:slide-in-from-bottom sm:data-[state=open]:slide-in-from-right',
        className
      )}
      {...props}
    >
      {children}
      <DialogPrimitive.Close className="absolute right-4 top-4 rounded-[var(--radius-sm)] p-1 text-[var(--color-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-surface-raised)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-walnut)]">
        <X className="w-5 h-5" />
        <span className="sr-only">Close drawer</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DrawerPortal>
))
DrawerContent.displayName = 'DrawerContent'

export const DrawerHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>): React.ReactElement => (
  <div
    className={cn(
      'flex flex-col space-y-1.5 p-6 border-b border-[var(--color-border)] text-left',
      className
    )}
    {...props}
  />
)
DrawerHeader.displayName = 'DrawerHeader'

export const DrawerTitle = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      'font-serif text-xl font-bold text-[var(--color-walnut)] tracking-tight',
      className
    )}
    {...props}
  />
))
DrawerTitle.displayName = 'DrawerTitle'

export const DrawerDescription = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn('text-xs text-[var(--color-muted)]', className)}
    {...props}
  />
))
DrawerDescription.displayName = 'DrawerDescription'
