"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CustomSelect } from "@/components/ui/custom-select"
import { Camera, Maximize2, Grid3X3 } from "lucide-react"
import { cn } from "@/lib/utils"

interface CameraStream {
  id: string
  name: string
  resolution: string
  fps: number
  active: boolean
}

interface CameraViewerProps {
  streams: CameraStream[]
  currentFrame: number
  totalFrames: number
}

export function CameraViewer({ streams, currentFrame, totalFrames }: CameraViewerProps) {
  const [cameraLayout, setCameraLayout] = useState<"single" | "grid">("grid")
  const [selectedCamera, setSelectedCamera] = useState(streams.find((s) => s.active)?.id || "main")

  const activeStreams = streams.filter((s) => s.active)

  return (
    <Card className="layer-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="font-sans text-xl">Camera Streams</CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant={cameraLayout === "single" ? "default" : "outline"}
              size="sm"
              onClick={() => setCameraLayout("single")}
              className="h-8 w-8 p-0"
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
            <Button
              variant={cameraLayout === "grid" ? "default" : "outline"}
              size="sm"
              onClick={() => setCameraLayout("grid")}
              className="h-8 w-8 p-0"
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {cameraLayout === "single" ? (
          <div className="space-y-4">
            <CustomSelect
              value={selectedCamera}
              onValueChange={setSelectedCamera}
              placeholder="Select Camera"
              className="w-48"
              options={activeStreams.map((camera) => ({
                value: camera.id,
                label: camera.name,
              }))}
            />
            <div className="aspect-video bg-layer-2 rounded-lg flex items-center justify-center border border-border">
              <div className="text-center space-y-2">
                <Camera className="h-12 w-12 text-muted-foreground mx-auto" />
                <div>
                  <p className="font-medium text-foreground">
                    {activeStreams.find((c) => c.id === selectedCamera)?.name}
                  </p>
                  <p className="text-sm text-muted-foreground font-mono">
                    Frame {currentFrame + 1} of {totalFrames.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div
            className={cn(
              "grid gap-4",
              activeStreams.length === 1
                ? "grid-cols-1"
                : activeStreams.length === 2
                  ? "grid-cols-2"
                  : activeStreams.length === 3
                    ? "grid-cols-2 lg:grid-cols-3"
                    : "grid-cols-2",
            )}
          >
            {activeStreams.map((camera) => (
              <div key={camera.id} className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium font-sans">{camera.name}</h4>
                  <Badge variant="secondary" className="text-xs font-mono">
                    {camera.resolution}
                  </Badge>
                </div>
                <div className="aspect-video bg-layer-2 rounded-lg flex items-center justify-center border border-border">
                  <div className="text-center space-y-1">
                    <Camera className="h-8 w-8 text-muted-foreground mx-auto" />
                    <p className="text-xs text-muted-foreground font-mono">{camera.fps} FPS</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
