export type StatusType =
  | "online"
  | "offline"
  | "active"
  | "inactive"
  | "completed"
  | "failed"
  | "pending"
  | "running"
  | "maintenance"

export const STATUS_CONFIG = {
  online: {
    label: "Online",
    color: "text-success",
    bgColor: "bg-success/10",
    dotColor: "bg-success",
  },
  offline: {
    label: "Offline",
    color: "text-muted-foreground",
    bgColor: "bg-muted/10",
    dotColor: "bg-muted-foreground",
  },
  active: {
    label: "Active",
    color: "text-success",
    bgColor: "bg-success/10",
    dotColor: "bg-success",
  },
  inactive: {
    label: "Inactive",
    color: "text-muted-foreground",
    bgColor: "bg-muted/10",
    dotColor: "bg-muted-foreground",
  },
  completed: {
    label: "Completed",
    color: "text-success",
    bgColor: "bg-success/10",
    dotColor: "bg-success",
  },
  failed: {
    label: "Failed",
    color: "text-destructive",
    bgColor: "bg-destructive/10",
    dotColor: "bg-destructive",
  },
  pending: {
    label: "Pending",
    color: "text-warning",
    bgColor: "bg-warning/10",
    dotColor: "bg-warning",
  },
  running: {
    label: "Running",
    color: "text-success",
    bgColor: "bg-success/10",
    dotColor: "bg-success",
  },
  maintenance: {
    label: "Maintenance",
    color: "text-destructive",
    bgColor: "bg-destructive/10",
    dotColor: "bg-destructive",
  },
} as const

export function getStatusConfig(status: StatusType) {
  return STATUS_CONFIG[status] || STATUS_CONFIG.inactive
}
