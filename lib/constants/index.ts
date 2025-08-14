export const ANIMATION = {
  duration: {
    fast: 0.15,
    medium: 0.2,
    slow: 0.3,
  },
  easing: {
    default: [0.4, 0.0, 0.2, 1] as const,
    easeOut: [0.0, 0.0, 0.2, 1] as const,
  },
  variants: {
    fadeIn: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
    },
    slideUp: {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: 20 },
    },
    staggerContainer: {
      animate: { transition: { staggerChildren: 0.1 } },
    },
    staggerItem: {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
    },
  },
} as const

export const STATUS_CONFIG = {
  online: { color: "bg-primary", label: "Online" },
  offline: { color: "bg-muted-foreground", label: "Offline" },
  maintenance: { color: "bg-destructive", label: "Maintenance" },
  busy: { color: "bg-secondary", label: "Busy" },
  active: { color: "bg-primary", label: "Active" },
  completed: { color: "bg-success", label: "Completed" },
  failed: { color: "bg-destructive", label: "Failed" },
} as const
