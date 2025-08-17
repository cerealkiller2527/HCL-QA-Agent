"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, Camera } from "lucide-react"

interface DatasetStatsProps {
  duration: number | undefined
  activeCameras: number
  frameCount: number | undefined
  size: number | undefined
  tags: string[] | undefined | null
  fps?: number
  resolution?: string
  bitrate?: string
  formatDuration: (seconds: number) => string
  formatFileSize: (bytes: number) => string
}

export function DatasetStats({
  duration,
  activeCameras,
  frameCount,
  size,
  tags,
  fps = 30,
  resolution,
  bitrate,
  formatDuration,
  formatFileSize,
}: DatasetStatsProps) {
  // Safe processing of tags array
  const safeTags = Array.isArray(tags) ? tags : []
  const displayTags = safeTags.slice(0, 3)
  const remainingCount = Math.max(0, safeTags.length - 3)

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
                <p className="text-sm font-semibold font-mono">{formatDuration(duration ?? 0)}</p>
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
          <div className="space-y-2 max-h-40 overflow-y-auto">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground font-sans">Frames:</span>
              <span className="text-xs font-medium font-mono">{(frameCount ?? 0).toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground font-sans">FPS:</span>
              <span className="text-xs font-medium font-mono">{fps}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground font-sans">Size:</span>
              <span className="text-xs font-medium font-mono">{formatFileSize(size ?? 0)}</span>
            </div>
            {resolution && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground font-sans">Resolution:</span>
                <span className="text-xs font-medium font-mono">{resolution}</span>
              </div>
            )}
            {bitrate && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground font-sans">Bitrate:</span>
                <span className="text-xs font-medium font-mono">{bitrate}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tags */}
      <Card className="layer-card">
        <CardContent className="p-2">
          <div className="flex flex-wrap gap-1 max-h-16 overflow-y-auto">
            {displayTags.map((tag) => (
              <Badge 
                key={tag} 
                variant="secondary" 
                className="text-xs font-mono truncate max-w-20"
                title={tag}
              >
                {tag}
              </Badge>
            ))}
            {remainingCount > 0 && (
              <Badge variant="outline" className="text-xs font-mono flex-shrink-0">
                +{remainingCount}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
