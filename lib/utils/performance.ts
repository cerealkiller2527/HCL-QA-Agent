import type React from "react"
import { memo, lazy, type ComponentType } from "react"
import dynamic from "next/dynamic"

// Memoization utilities
export function createMemoComponent<T extends ComponentType<any>>(
  Component: T,
  areEqual?: (prevProps: any, nextProps: any) => boolean,
): T {
  return memo(Component, areEqual) as T
}

// Custom comparison functions for common patterns
export const shallowEqual = (prevProps: any, nextProps: any) => {
  const prevKeys = Object.keys(prevProps)
  const nextKeys = Object.keys(nextProps)

  if (prevKeys.length !== nextKeys.length) {
    return false
  }

  for (const key of prevKeys) {
    if (prevProps[key] !== nextProps[key]) {
      return false
    }
  }

  return true
}

export const deepEqual = (prevProps: any, nextProps: any) => {
  return JSON.stringify(prevProps) === JSON.stringify(nextProps)
}

// Lazy loading utilities
export function createLazyComponent<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  fallback?: React.ComponentType,
) {
  return lazy(importFn)
}

export function createDynamicComponent<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  options?: {
    loading?: () => React.ReactElement
    ssr?: boolean
  },
) {
  return dynamic(importFn, {
    loading: options?.loading || (() => <div>Loading...</div>),
    ssr: options?.ssr ?? true,
  })
}

// Performance monitoring utilities
export class PerformanceMonitor {
  private static measurements = new Map<string, number>()

  static startMeasurement(name: string) {
    this.measurements.set(name, performance.now())
  }

  static endMeasurement(name: string): number {
    const start = this.measurements.get(name)
    if (!start) {
      console.warn(`No measurement started for: ${name}`)
      return 0
    }

    const duration = performance.now() - start
    this.measurements.delete(name)

    if (process.env.NODE_ENV === "development") {
      console.log(`⚡ ${name}: ${duration.toFixed(2)}ms`)
    }

    return duration
  }

  static measureAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
    this.startMeasurement(name)
    return fn().finally(() => {
      this.endMeasurement(name)
    })
  }

  static measureSync<T>(name: string, fn: () => T): T {
    this.startMeasurement(name)
    try {
      return fn()
    } finally {
      this.endMeasurement(name)
    }
  }
}

// Debounce and throttle utilities
export function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null

  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout)
    }
    timeout = setTimeout(() => func(...args), wait)
  }
}

export function throttle<T extends (...args: any[]) => any>(func: T, limit: number): (...args: Parameters<T>) => void {
  let inThrottle = false

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

// Virtual scrolling utilities
export function calculateVisibleRange(
  scrollTop: number,
  containerHeight: number,
  itemHeight: number,
  totalItems: number,
  overscan = 5,
) {
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
  const endIndex = Math.min(totalItems - 1, Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan)

  return { startIndex, endIndex }
}

// Bundle analysis utilities
export function analyzeBundle() {
  if (process.env.NODE_ENV === "development" && typeof window !== "undefined") {
    // Log bundle information
    console.group("📦 Bundle Analysis")
    console.log("User Agent:", navigator.userAgent)
    console.log("Connection:", (navigator as any).connection?.effectiveType || "unknown")
    console.log("Memory:", (performance as any).memory || "unavailable")
    console.groupEnd()
  }
}

// Image optimization utilities
export function getOptimizedImageProps(src: string, width: number, height: number, quality = 75) {
  return {
    src,
    width,
    height,
    quality,
    loading: "lazy" as const,
    placeholder: "blur" as const,
    blurDataURL: `data:image/svg+xml;base64,${Buffer.from(
      `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#f3f4f6"/></svg>`,
    ).toString("base64")}`,
  }
}
