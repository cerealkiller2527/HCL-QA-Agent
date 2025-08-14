"use client"

import type React from "react"

import { memo, useMemo, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { shallowEqual } from "@/lib/utils/performance"
import type { Robot, Dataset } from "@/lib/types/dataset"

// Memoized Robot Card
interface RobotCardProps {
  robot: Robot
  onStatusChange?: (id: string, status: Robot["status"]) => void
  onSelect?: (id: string) => void
}

export const MemoizedRobotCard = memo<RobotCardProps>(
  ({ robot, onStatusChange, onSelect }) => {
    const handleStatusChange = useCallback(
      (status: Robot["status"]) => {
        onStatusChange?.(robot.id, status)
      },
      [robot.id, onStatusChange],
    )

    const handleSelect = useCallback(() => {
      onSelect?.(robot.id)
    }, [robot.id, onSelect])

    const statusColor = useMemo(() => {
      switch (robot.status) {
        case "online":
          return "bg-primary"
        case "maintenance":
          return "bg-destructive"
        case "offline":
          return "bg-muted-foreground"
        default:
          return "bg-muted-foreground"
      }
    }, [robot.status])

    const batteryColor = useMemo(() => {
      if (!robot.batteryLevel) return "bg-muted"
      if (robot.batteryLevel > 60) return "bg-primary"
      if (robot.batteryLevel > 30) return "bg-warning"
      return "bg-destructive"
    }, [robot.batteryLevel])

    return (
      <Card className="layer-interactive" onClick={handleSelect}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-subtitle">{robot.name}</CardTitle>
              <p className="text-code text-muted-foreground">{robot.id}</p>
            </div>
            <div className={`w-2 h-2 rounded-full ${statusColor}`} />
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <Badge variant="outline">{robot.type}</Badge>
            <Badge variant={robot.status === "online" ? "default" : "secondary"}>{robot.status}</Badge>
          </div>

          {robot.batteryLevel && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Battery</span>
                <span className="font-mono">{robot.batteryLevel}%</span>
              </div>
              <div className="w-full bg-layer-2 rounded-full h-2">
                <div className={`h-2 rounded-full ${batteryColor}`} style={{ width: `${robot.batteryLevel}%` }} />
              </div>
            </div>
          )}

          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Location:</span>
              <span>{robot.location}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Task:</span>
              <span>{robot.currentTask || "Idle"}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  },
  (prevProps, nextProps) => {
    return (
      prevProps.robot.id === nextProps.robot.id &&
      prevProps.robot.status === nextProps.robot.status &&
      prevProps.robot.batteryLevel === nextProps.robot.batteryLevel &&
      prevProps.robot.currentTask === nextProps.robot.currentTask &&
      prevProps.robot.lastSeen.getTime() === nextProps.robot.lastSeen.getTime()
    )
  },
)

MemoizedRobotCard.displayName = "MemoizedRobotCard"

// Memoized Dataset Card
interface DatasetCardProps {
  dataset: Dataset
  onSelect?: (id: string) => void
  onDelete?: (id: string) => void
}

export const MemoizedDatasetCard = memo<DatasetCardProps>(({ dataset, onSelect, onDelete }) => {
  const handleSelect = useCallback(() => {
    onSelect?.(dataset.id)
  }, [dataset.id, onSelect])

  const handleDelete = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      onDelete?.(dataset.id)
    },
    [dataset.id, onDelete],
  )

  const formattedSize = useMemo(() => {
    const gb = dataset.fileSize / (1024 * 1024 * 1024)
    return `${gb.toFixed(1)} GB`
  }, [dataset.fileSize])

  const formattedDuration = useMemo(() => {
    const hours = Math.floor(dataset.duration / 3600)
    const minutes = Math.floor((dataset.duration % 3600) / 60)
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`
  }, [dataset.duration])

  const statusColor = useMemo(() => {
    switch (dataset.status) {
      case "ready":
        return "bg-primary"
      case "processing":
        return "bg-warning"
      case "error":
        return "bg-destructive"
      default:
        return "bg-muted"
    }
  }, [dataset.status])

  return (
    <Card className="layer-interactive" onClick={handleSelect}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-subtitle">{dataset.name}</CardTitle>
            <p className="text-caption mt-1">{dataset.description}</p>
          </div>
          <div className={`w-2 h-2 rounded-full ${statusColor}`} />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-1">
          {dataset.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
          {dataset.tags.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{dataset.tags.length - 3}
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Size:</span>
            <span className="ml-2 font-mono">{formattedSize}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Duration:</span>
            <span className="ml-2 font-mono">{formattedDuration}</span>
          </div>
        </div>

        <div className="flex justify-between items-center pt-2">
          <Badge variant={dataset.status === "ready" ? "default" : "secondary"}>{dataset.status}</Badge>
          <Button variant="outline" size="sm" onClick={handleDelete}>
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}, shallowEqual)

MemoizedDatasetCard.displayName = "MemoizedDatasetCard"

// Memoized Stat Card
interface StatCardProps {
  title: string
  value: string | number
  change?: number
  icon?: React.ComponentType<{ className?: string }>
}

export const MemoizedStatCard = memo<StatCardProps>(({ title, value, change, icon: Icon }) => {
  const changeColor = useMemo(() => {
    if (!change) return "text-muted-foreground"
    return change > 0 ? "text-primary" : "text-destructive"
  }, [change])

  const changePrefix = useMemo(() => {
    if (!change) return ""
    return change > 0 ? "+" : ""
  }, [change])

  return (
    <Card className="layer-card">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-caption">{title}</p>
            <p className="text-2xl font-mono-medium mt-1">{value}</p>
            {change !== undefined && (
              <p className={`text-sm mt-1 ${changeColor}`}>
                {changePrefix}
                {change}%
              </p>
            )}
          </div>
          {Icon && (
            <div className="p-2 bg-primary/10 rounded-lg">
              <Icon className="h-5 w-5 text-primary" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}, shallowEqual)

MemoizedStatCard.displayName = "MemoizedStatCard"
