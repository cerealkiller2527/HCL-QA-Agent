"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Activity, Zap, HardDrive, AlertTriangle, CheckCircle, Clock } from "lucide-react"
import type { RecordingMetrics as MetricsType } from "@/lib/types/recording"

interface RecordingMetricsProps {
  metrics: MetricsType
  isRecording: boolean
}

export function RecordingMetrics({ metrics, isRecording }: RecordingMetricsProps) {
  const getHealthColor = (health: "good" | "warning" | "error") => {
    switch (health) {
      case "good":
        return "text-lerobot-green"
      case "warning":
        return "text-lerobot-orange"
      case "error":
        return "text-lerobot-red"
    }
  }

  const getHealthIcon = (health: "good" | "warning" | "error") => {
    switch (health) {
      case "good":
        return CheckCircle
      case "warning":
        return AlertTriangle
      case "error":
        return AlertTriangle
    }
  }

  return (
    <div className="space-y-4">
      {/* Overall Status */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="font-heading text-base">Recording Quality</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Quality Score</span>
            <span className="font-mono text-lg">{metrics.qualityScore}%</span>
          </div>
          <Progress value={metrics.qualityScore} className="h-2" />
          <div className="flex items-center gap-2">
            {isRecording ? (
              <>
                <div className="w-2 h-2 bg-lerobot-red rounded-full animate-pulse" />
                <span className="text-sm font-medium">Recording</span>
              </>
            ) : (
              <>
                <div className="w-2 h-2 bg-muted-foreground rounded-full" />
                <span className="text-sm text-muted-foreground">Standby</span>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="font-heading text-base">Performance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-lerobot-blue" />
              <div>
                <p className="text-muted-foreground">Frame Rate</p>
                <p className="font-mono">{metrics.frameRate.toFixed(1)} FPS</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-lerobot-orange" />
              <div>
                <p className="text-muted-foreground">Dropped</p>
                <p className="font-mono">{metrics.droppedFrames}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-lerobot-green" />
              <div>
                <p className="text-muted-foreground">Data Rate</p>
                <p className="font-mono">{metrics.dataRate.toFixed(1)} MB/s</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <HardDrive className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-muted-foreground">Storage</p>
                <p className="font-mono">{(metrics.storageUsed / (1024 * 1024)).toFixed(1)} MB</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sensor Health */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="font-heading text-base">Sensor Health</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {Object.entries(metrics.sensorHealth).map(([sensorId, health]) => {
            const HealthIcon = getHealthIcon(health)
            return (
              <div key={sensorId} className="flex items-center justify-between p-2 rounded bg-accent/30">
                <div className="flex items-center gap-2">
                  <HealthIcon className={`h-4 w-4 ${getHealthColor(health)}`} />
                  <span className="text-sm font-medium capitalize">{sensorId.replace("_", " ")}</span>
                </div>
                <Badge
                  variant={health === "good" ? "default" : health === "warning" ? "secondary" : "destructive"}
                  className="text-xs"
                >
                  {health}
                </Badge>
              </div>
            )
          })}
        </CardContent>
      </Card>
    </div>
  )
}
