import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { statusColors, typographyClasses } from "@/lib/design-tokens"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Helper function to get status-based classes
export function getStatusClasses(status: keyof typeof statusColors) {
  return statusColors[status] || statusColors.offline
}

// Helper function to get typography classes
export function getTypographyClass(variant: keyof typeof typographyClasses) {
  return typographyClasses[variant]
}

// Helper function for consistent interactive states
export function getInteractiveClasses(variant: "card" | "button" | "input" = "card") {
  const baseClasses = "transition-all duration-200"

  switch (variant) {
    case "card":
      return cn(baseClasses, "layer-interactive")
    case "button":
      return cn(baseClasses, "hover:bg-layer-hover active:bg-layer-active")
    case "input":
      return cn(baseClasses, "focus:ring-2 focus:ring-ring focus:ring-offset-2")
    default:
      return baseClasses
  }
}
