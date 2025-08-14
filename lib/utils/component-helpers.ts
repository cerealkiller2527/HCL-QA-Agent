export function getStatusConfig(status: string) {
  const configs = {
    online: { color: "bg-primary", label: "Online", textColor: "text-primary" },
    offline: { color: "bg-muted-foreground", label: "Offline", textColor: "text-muted-foreground" },
    maintenance: { color: "bg-destructive", label: "Maintenance", textColor: "text-destructive" },
    busy: { color: "bg-secondary", label: "Busy", textColor: "text-secondary" },
    running: { color: "bg-primary", label: "Running", textColor: "text-primary" },
    warning: { color: "bg-warning", label: "Warning", textColor: "text-warning" },
  }

  return configs[status as keyof typeof configs] || configs.offline
}

export function getBatteryColor(level: number) {
  if (level > 60) return "bg-primary"
  if (level > 30) return "bg-secondary"
  return "bg-destructive"
}

export function formatTimeAgo(date: Date) {
  const now = new Date()
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

  if (diffInMinutes < 1) return "Just now"
  if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`

  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) return `${diffInHours} hours ago`

  const diffInDays = Math.floor(diffInHours / 24)
  return `${diffInDays} days ago`
}

export function createGridClasses(cols: { sm?: number; md?: number; lg?: number; xl?: number }) {
  const classes = ["grid"]

  if (cols.sm) classes.push(`grid-cols-${cols.sm}`)
  if (cols.md) classes.push(`md:grid-cols-${cols.md}`)
  if (cols.lg) classes.push(`lg:grid-cols-${cols.lg}`)
  if (cols.xl) classes.push(`xl:grid-cols-${cols.xl}`)

  return classes.join(" ")
}
