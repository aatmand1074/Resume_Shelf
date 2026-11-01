import React from 'react'
import { ErrorBoundary } from './ErrorBoundary'
import { TooltipProvider } from '@/components/ui/Tooltip'

export interface AppProvidersProps {
  children: React.ReactNode
}

export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return (
    <ErrorBoundary>
      <TooltipProvider delayDuration={200}>{children}</TooltipProvider>
    </ErrorBoundary>
  )
}
