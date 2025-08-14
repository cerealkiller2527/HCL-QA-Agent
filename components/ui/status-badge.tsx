import { Badge } from "@/components/ui/badge"
import type { LucideIcon } from "lucide-react"

interface StatusBadgeProps {
  status: string
  variant?: "default" | "secondary" | "destructive" | "outline"
  icon?: LucideIcon
  className?: string
}

const statusVariants = {
  online: "default",
  offline: "outline",
  maintenance: "destructive",
  busy: "secondary",
  running: "default",
  idle: "outline",
  completed: "default",
  failed: "destructive",
} as const

export function StatusBadge({ status, variant, icon: Icon, className = "" }: StatusBadgeProps) {
  const badgeVariant = variant || statusVariants[status as keyof typeof statusVariants] || "outline"

  return (
    <Badge variant={badgeVariant} className={`text-code flex items-center gap-1 ${className}`}>
      {Icon && <Icon className="h-3 w-3" />}
      {status}
    </Badge>
  )
}
