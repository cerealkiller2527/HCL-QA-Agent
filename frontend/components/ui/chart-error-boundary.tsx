"use client"

import React, { Component, ReactNode } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

interface ChartErrorBoundaryState {
  hasError: boolean
  error?: Error
}

interface ChartErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
}

export class ChartErrorBoundary extends Component<ChartErrorBoundaryProps, ChartErrorBoundaryState> {
  constructor(props: ChartErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ChartErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error details for debugging (in development only)
    if (process.env.NODE_ENV === 'development') {
      console.error('Chart Error Boundary caught an error:', error, errorInfo)
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <Card className="h-48 border-destructive/20">
          <CardContent className="h-full flex items-center justify-center p-6">
            <div className="text-center space-y-2">
              <AlertTriangle className="h-6 w-6 text-destructive mx-auto" />
              <p className="text-sm text-destructive font-medium">Chart Error</p>
              <p className="text-xs text-muted-foreground">
                Unable to render chart data
              </p>
            </div>
          </CardContent>
        </Card>
      )
    }

    return this.props.children
  }
}

// HOC wrapper for easier usage
export function withChartErrorBoundary<P extends object>(
  Component: React.ComponentType<P>
): React.ComponentType<P> {
  return function ChartWithErrorBoundary(props: P) {
    return (
      <ChartErrorBoundary>
        <Component {...props} />
      </ChartErrorBoundary>
    )
  }
}