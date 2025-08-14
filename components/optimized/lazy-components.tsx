"use client"

import type React from "react"

import { Suspense } from "react"
import { createDynamicComponent } from "@/lib/utils/performance"
import { Skeleton } from "@/components/ui/skeleton"

// Loading components
const CardSkeleton = () => (
  <div className="layer-card p-6 space-y-4">
    <div className="flex items-center gap-3">
      <Skeleton className="h-10 w-10 rounded-lg" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
    <Skeleton className="h-8 w-full" />
    <div className="space-y-2">
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-3/4" />
    </div>
  </div>
)

const TableSkeleton = () => (
  <div className="space-y-4">
    <div className="flex justify-between items-center">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-10 w-32" />
    </div>
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 layer-card">
          <Skeleton className="h-8 w-8 rounded" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-3 w-2/3" />
          </div>
          <Skeleton className="h-6 w-16" />
        </div>
      ))}
    </div>
  </div>
)

// Lazy-loaded components with optimized loading states
export const LazyDatasetRecorder = createDynamicComponent(() => import("@/app/(dashboard)/datasets/recorder/page"), {
  loading: () => <CardSkeleton />,
  ssr: false, // Heavy component, client-side only
})

export const LazyAnalyticsCharts = createDynamicComponent(() => import("@/components/analytics/charts"), {
  loading: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  ),
  ssr: false, // Charts are client-side only
})

export const LazyDataTable = createDynamicComponent(() => import("@/components/ui/data-table"), {
  loading: () => <TableSkeleton />,
})

export const LazyRobotControls = createDynamicComponent(() => import("@/components/robot/controls"), {
  loading: () => <CardSkeleton />,
  ssr: false, // Interactive controls
})

// Wrapper component for consistent lazy loading
interface LazyWrapperProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function LazyWrapper({ children, fallback }: LazyWrapperProps) {
  return <Suspense fallback={fallback || <CardSkeleton />}>{children}</Suspense>
}
