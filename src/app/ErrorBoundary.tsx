import React from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo)
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: undefined })
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--color-paper)] p-4 text-[var(--color-ink)]">
          <div className="max-w-md w-full p-6 rounded-[var(--radius-lg)] border border-red-200 bg-[var(--color-surface)] shadow-lg space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h2 className="font-serif font-bold text-lg">Something went wrong</h2>
            </div>
            <p className="text-sm text-[var(--color-muted)]">
              An unexpected error occurred in the application. Your data stored in IndexedDB is safe.
            </p>
            {this.state.error?.message && (
              <div className="p-3 bg-[var(--color-surface-raised)] border border-[var(--color-border)] rounded-[var(--radius-md)] text-xs font-mono text-red-700 break-words">
                {this.state.error.message}
              </div>
            )}
            <div className="flex gap-2 pt-2">
              <Button onClick={this.handleReset} variant="outline" size="sm">
                <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                Try Again
              </Button>
              <Button
                onClick={() => {
                  window.location.reload()
                }}
                size="sm"
              >
                Reload App
              </Button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
