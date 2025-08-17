"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CustomSelect } from "@/components/ui/custom-select"
import { Camera, Maximize2, Grid3X3 } from "lucide-react"
import { cn } from "@/lib/utils"
import { usePlayback } from "@/contexts/playback-context"

interface CameraStream {
  id: string
  name: string
  resolution: string
  fps: number
  active: boolean
  url?: string
  metadata?: {
    resolution?: {
      width: number
      height: number
      formatted: string
    }
    bitrate_mbps?: number
    codec?: string
    file_size_formatted?: string
  }
}

interface CameraViewerProps {
  streams: CameraStream[]
}

export function CameraViewer({ streams }: CameraViewerProps) {
  const [cameraLayout, setCameraLayout] = useState<"single" | "grid">("grid")
  const [selectedCamera, setSelectedCamera] = useState(streams.find((s) => s.active)?.id || "main")
  const { addVideo, removeVideo, currentFrame = 0, totalFrames = 0 } = usePlayback()
  const videoRefsSet = useRef(new Set<HTMLVideoElement>())

  const activeStreams = streams.filter((s) => s.active)
  
  // Clean video registration with proper cleanup
  const handleVideoRef = useCallback((video: HTMLVideoElement | null) => {
    if (video && !videoRefsSet.current.has(video)) {
      videoRefsSet.current.add(video)
      addVideo(video)
      
      video.addEventListener('error', () => {
        console.warn(`Video failed to load`)
      })
    }
  }, [addVideo])
  
  // Cleanup videos when component unmounts
  useEffect(() => {
    return () => {
      videoRefsSet.current.forEach(video => {
        removeVideo(video)
      })
      videoRefsSet.current.clear()
    }
  }, [removeVideo])

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
            <div className="aspect-video bg-layer-2 rounded-lg overflow-hidden border border-border">
              {(() => {
                const selectedStream = activeStreams.find((c) => c.id === selectedCamera);
                if (selectedStream?.url) {
                  return (
                    <video 
                      ref={handleVideoRef}
                      className="w-full h-full object-contain"
                      preload="metadata"
                      src={selectedStream.url}
                      muted
                    >
                      <track kind="captions" />
                    </video>
                  );
                }
                return (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center space-y-2">
                      <Camera className="h-12 w-12 text-muted-foreground mx-auto" />
                      <div>
                        <p className="font-medium text-foreground">
                          {selectedStream?.name || "No camera selected"}
                        </p>
                        <p className="text-sm text-muted-foreground font-mono">
                          Frame {currentFrame + 1} of {totalFrames.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })()}
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
              <div key={camera.id} className="space-y-2">
                <div className="flex items-center justify-between min-w-0">
                  <h4 className="text-sm font-medium font-sans truncate">{camera.name}</h4>
                  <Badge variant="secondary" className="text-xs font-mono flex-shrink-0">
                    {camera.metadata?.resolution?.formatted || camera.resolution}
                  </Badge>
                </div>
                <div className="aspect-video bg-layer-2 rounded-lg overflow-hidden border border-border">
                  {camera.url ? (
                    <video 
                      ref={handleVideoRef}
                      className="w-full h-full object-contain"
                      preload="metadata"
                      src={camera.url}
                      muted
                    >
                      <track kind="captions" />
                    </video>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-center space-y-1">
                        <Camera className="h-8 w-8 text-muted-foreground mx-auto" />
                        <p className="text-xs text-muted-foreground font-mono">{camera.fps} FPS</p>
                        {camera.metadata?.bitrate_mbps && (
                          <p className="text-xs text-muted-foreground font-mono">
                            {camera.metadata.bitrate_mbps} Mbps
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
