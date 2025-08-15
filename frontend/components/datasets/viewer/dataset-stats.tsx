"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, Camera } from "lucide-react"

interface DatasetStatsProps {
  duration: number
  activeCameras: number
  frameCount: number
  size: number
  tags: string[]
  formatDuration: (seconds: number) => string
  formatFileSize: (bytes: number) => string
}

export function DatasetStats({
  duration,
  activeCameras,
  frameCount,
  size,
  tags,
  formatDuration,
  formatFileSize,
}: DatasetStatsProps) {
  return (
    <div className="space-y-3">
      {/* Compact Stats */}
      <div className="grid grid-cols-1 gap-2">
        <Card className="layer-card">
          <CardContent className="p-2">
            <div className="flex items-center gap-2">
              <Clock className="h-3 w-3 text-blue-500" />
              <div>
                <p className="text-xs text-muted-foreground font-sans">Duration</p>
                <p className="text-sm font-semibold font-mono">{formatDuration(duration)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="layer-card">
          <CardContent className="p-2">
            <div className="flex items-center gap-2">
              <Camera className="h-3 w-3 text-green-500" />
              <div>
                <p className="text-xs text-muted-foreground font-sans">Cameras</p>
                <p className="text-sm font-semibold font-mono">{activeCameras} Active</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Episode Info */}
      <Card className="layer-card">
        <CardContent className="p-3">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground font-sans">Frames:</span>
              <span className="text-xs font-medium font-mono">{frameCount.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground font-sans">FPS:</span>
              <span className="text-xs font-medium font-mono">30</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground font-sans">Size:</span>
              <span className="text-xs font-medium font-mono">{formatFileSize(size)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground font-sans">Resolution:</span>
              <span className="text-xs font-medium font-mono">1920×1080</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground font-sans">Bitrate:</span>
              <span className="text-xs font-medium font-mono">8.5 Mbps</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tags */}
      <Card className="layer-card">
        <CardContent className="p-2">
          <div className="flex flex-wrap gap-1">
            {tags.slice(0, 2).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs font-mono">
                {tag}
              </Badge>
            ))}
            {tags.length > 2 && (
              <Badge variant="outline" className="text-xs font-mono">
                +{tags.length - 2}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
