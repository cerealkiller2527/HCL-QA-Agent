"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Camera, Activity, Zap, Bot, TrendingUp, TrendingDown, Minus } from "lucide-react"
import type { LiveSensorReading } from "@/lib/types/recording"

interface LiveSensorMonitorProps {
  sensorReadings: LiveSensorReading[]
  isRecording: boolean
}

const sensorIcons = {
  camera: Camera,
  lidar: Activity,
  imu: Activity,
  force: Zap,
  joint_position: Activity,
  custom: Bot,
}

const qualityColors = {
  good: "text-lerobot-green",
  warning: "text-lerobot-orange",
  error: "text-lerobot-red",
}

const qualityBadges = {
  good: "default",
  warning: "secondary",
  error: "destructive",
} as const

export function LiveSensorMonitor({ sensorReadings, isRecording }: LiveSensorMonitorProps) {
  // Group readings by sensor
  const sensorGroups = sensorReadings.reduce(
    (acc, reading) => {
      if (!acc[reading.sensorId]) {
        acc[reading.sensorId] = []
      }
      acc[reading.sensorId].push(reading)
      return acc
    },
    {} as Record<string, LiveSensorReading[]>,
  )

  const formatSensorValue = (value: any, sensorId: string): string => {
    if (typeof value === "number") {
      return value.toFixed(3)
    }
    if (Array.isArray(value)) {
      return `[${value
        .slice(0, 3)
        .map((v) => v.toFixed(2))
        .join(", ")}${value.length > 3 ? "..." : ""}]`
    }
    return String(value).substring(0, 20)
  }

  const getTrendIcon = (readings: LiveSensorReading[]) => {
    if (readings.length < 2) return Minus
    const latest = readings[readings.length - 1]
    const previous = readings[readings.length - 2]

    if (typeof latest.value === "number" && typeof previous.value === "number") {
      if (latest.value > previous.value) return TrendingUp
      if (latest.value < previous.value) return TrendingDown
    }
    return Minus
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-heading flex items-center gap-2">
          Live Sensor Data
          {isRecording && <div className="w-2 h-2 bg-lerobot-red rounded-full animate-pulse" />}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {Object.entries(sensorGroups).map(([sensorId, readings]) => {
          const latestReading = readings[readings.length - 1]
          const SensorIcon = sensorIcons.camera // Default to camera, would need sensor type mapping
          const TrendIcon = getTrendIcon(readings)

          return (
            <div key={sensorId} className="p-3 rounded-lg bg-accent/30 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <SensorIcon className="h-4 w-4 text-lerobot-blue" />
                  <span className="font-medium text-sm capitalize">{sensorId.replace("_", " ")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendIcon className={`h-3 w-3 ${qualityColors[latestReading.quality]}`} />
                  <Badge variant={qualityBadges[latestReading.quality]} className="text-xs">
                    {latestReading.quality}
                  </Badge>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Latest Value:</span>
                  <span className="font-mono">{formatSensorValue(latestReading.value, sensorId)}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Timestamp:</span>
                  <span className="font-mono">{new Date(latestReading.timestamp).toLocaleTimeString()}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Readings:</span>
                  <span className="font-mono">{readings.length}</span>
                </div>
              </div>

              {/* Mini chart placeholder */}
              <div className="h-8 bg-muted/50 rounded flex items-center justify-center">
                <span className="text-xs text-muted-foreground">Live Chart</span>
              </div>
            </div>
          )
        })}

        {Object.keys(sensorGroups).length === 0 && (
          <div className="text-center py-8">
            <Activity className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No sensor data available</p>
            <p className="text-xs text-muted-foreground">Start recording to see live sensor readings</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
