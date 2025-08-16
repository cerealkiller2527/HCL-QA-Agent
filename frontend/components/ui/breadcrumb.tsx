import React from "react"
import Link from "next/link"
import { ChevronRight, Home } from "lucide-react"
import { cn } from "@/lib/utils"

export interface BreadcrumbItem {
  label: string
  href?: string
  icon?: React.ReactNode
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
  className?: string
  showHome?: boolean
}

export function Breadcrumb({ items, className, showHome = true }: BreadcrumbProps) {
  const allItems = showHome 
    ? [{ label: "Home", href: "/", icon: <Home className="h-4 w-4" /> }, ...items]
    : items

  return (
    <nav 
      aria-label="Breadcrumb"
      className={cn("flex items-center space-x-1 text-sm text-muted-foreground", className)}
    >
      <ol className="inline-flex items-center space-x-1">
        {allItems.map((item, index) => {
          const isLast = index === allItems.length - 1

          return (
            <li key={index} className="inline-flex items-center">
              {index > 0 && (
                <ChevronRight className="h-4 w-4 mx-1 text-muted-foreground/60" />
              )}
              
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="inline-flex items-center space-x-1 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              ) : (
                <span 
                  className={cn(
                    "inline-flex items-center space-x-1",
                    isLast ? "text-foreground font-medium" : "text-muted-foreground"
                  )}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

// Separator component for custom breadcrumb layouts
export function BreadcrumbSeparator({ className }: { className?: string }) {
  return (
    <ChevronRight className={cn("h-4 w-4 text-muted-foreground/60", className)} />
  )
}

// Individual breadcrumb item component
export function BreadcrumbItem({ 
  children, 
  href, 
  isActive = false,
  className 
}: { 
  children: React.ReactNode
  href?: string
  isActive?: boolean
  className?: string 
}) {
  const baseClasses = "inline-flex items-center transition-colors"
  const activeClasses = isActive 
    ? "text-foreground font-medium" 
    : "text-muted-foreground hover:text-foreground"

  if (href && !isActive) {
    return (
      <Link href={href} className={cn(baseClasses, activeClasses, className)}>
        {children}
      </Link>
    )
  }

  return (
    <span className={cn(baseClasses, activeClasses, className)}>
      {children}
    </span>
  )
}