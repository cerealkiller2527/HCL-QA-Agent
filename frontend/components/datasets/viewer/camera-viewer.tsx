"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CustomSelect } from "@/components/ui/custom-select"
import { Camera, Maximize2, Grid3X3, AlertCircle, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import type { VideoUrl } from "@/lib/api/schemas/viewer.schema"

interface CameraStream {
  id: string
  name: string
  resolution: string
  fps: number
  active: boolean
  url?: string // Video URL from backend
}

interface CameraViewerProps {
  streams: CameraStream[]
  videoUrls?: VideoUrl[] // Video URLs from backend
  currentTime?: number // For synchronization
  isPlaying?: boolean
  onTimeUpdate?: (time: number) => void
  onDurationChange?: (duration: number) => void
  // Legacy props for backwards compatibility
  currentFrame?: number
  totalFrames?: number
}

interface VideoPlayerProps {
  stream: CameraStream
  videoUrl?: string
  currentTime?: number
  isPlaying?: boolean
  onTimeUpdate?: (time: number) => void
  onDurationChange?: (duration: number) => void
  isMain?: boolean
  // Fallback for when no video is available
  currentFrame?: number
  totalFrames?: number
}

function VideoPlayer({ 
  stream, 
  videoUrl, 
  currentTime, 
  isPlaying, 
  onTimeUpdate, 
  onDurationChange,
  isMain = false,
  currentFrame = 0,
  totalFrames = 100
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasLoaded, setHasLoaded] = useState(false)

  // Sync playback state
  useEffect(() => {
    if (!videoRef.current || !hasLoaded || !videoUrl) return
    
    if (isPlaying) {
      videoRef.current.play().catch(err => {
        console.error("Error playing video:", err)
      })
    } else {
      videoRef.current.pause()
    }
  }, [isPlaying, hasLoaded, videoUrl])

  // Sync current time (only for non-main videos)
  useEffect(() => {
    if (!videoRef.current || !hasLoaded || isMain || !videoUrl) return
    if (currentTime !== undefined && Math.abs(videoRef.current.currentTime - currentTime) > 0.1) {
      videoRef.current.currentTime = currentTime
    }
  }, [currentTime, isMain, hasLoaded, videoUrl])

  const handleLoadedMetadata = () => {
    setLoading(false)
    setHasLoaded(true)
    if (isMain && onDurationChange && videoRef.current) {
      onDurationChange(videoRef.current.duration)
    }
  }

  const handleTimeUpdate = () => {
    if (isMain && onTimeUpdate && videoRef.current) {
      onTimeUpdate(videoRef.current.currentTime)
    }
  }

  const handleError = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    console.error("Video error:", e)
    setError("Failed to load video")
    setLoading(false)
  }

  // If no video URL, show placeholder
  if (!videoUrl) {
    return (
      <div className="aspect-video bg-layer-2 rounded-lg flex items-center justify-center border border-border">
        <div className="text-center space-y-2">
          <Camera className="h-8 w-8 text-muted-foreground mx-auto" />
          <div>
            <p className="text-sm font-medium">{stream.name}</p>
            <p className="text-xs text-muted-foreground font-mono">
              Frame {currentFrame + 1} of {totalFrames.toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative aspect-video bg-black rounded-lg overflow-hidden border border-border">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-layer-2">
          <div className="text-center space-y-2">
            <Loader2 className="h-8 w-8 text-muted-foreground mx-auto animate-spin" />
            <p className="text-sm text-muted-foreground">Loading video...</p>
          </div>
        </div>
      )}
      
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-layer-2">
          <div className="text-center space-y-2">
            <AlertCircle className="h-8 w-8 text-destructive mx-auto" />
            <p className="text-sm text-muted-foreground">{error}</p>
            <p className="text-xs text-muted-foreground">{stream.name}</p>
          </div>
        </div>
      )}

      <video
        ref={videoRef}
        src={videoUrl}
        className="w-full h-full object-contain"
        crossOrigin="anonymous"
        onLoadedMetadata={handleLoadedMetadata}
        onTimeUpdate={handleTimeUpdate}
        onError={handleError}
        controls={isMain}
        muted={!isMain} // Mute non-main videos
        playsInline
      />
    </div>
  )
}

export function CameraViewer({ 
  streams, 
  videoUrls = [],
  currentTime,
  isPlaying = false,
  onTimeUpdate,
  onDurationChange,
  currentFrame = 0,
  totalFrames = 100
}: CameraViewerProps) {
  const [cameraLayout, setCameraLayout] = useState<"single" | "grid">("grid")
  const [selectedCamera, setSelectedCamera] = useState(streams.find((s) => s.active)?.id || streams[0]?.id || "")

  // Map video URLs to streams
  const streamsWithUrls = streams.map(stream => {
    const videoUrl = videoUrls.find(v => v.camera === stream.id)
    return {
      ...stream,
      url: videoUrl?.url || stream.url
    }
  })

  const activeStreams = streamsWithUrls.filter((s) => s.active)
  const selectedStream = activeStreams.find(s => s.id === selectedCamera) || activeStreams[0]

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
            {activeStreams.length > 1 && (
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
            )}
            {selectedStream && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium font-sans">{selectedStream.name}</h4>
                  <Badge variant="secondary" className="text-xs font-mono">
                    {selectedStream.resolution} @ {selectedStream.fps} FPS
                  </Badge>
                </div>
                <VideoPlayer
                  stream={selectedStream}
                  videoUrl={selectedStream.url}
                  currentTime={currentTime}
                  isPlaying={isPlaying}
                  onTimeUpdate={onTimeUpdate}
                  onDurationChange={onDurationChange}
                  isMain={true}
                  currentFrame={currentFrame}
                  totalFrames={totalFrames}
                />
              </div>
            )}
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
            {activeStreams.map((camera, index) => (
              <div key={camera.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium font-sans">{camera.name}</h4>
                  <Badge variant="secondary" className="text-xs font-mono">
                    {camera.resolution}
                  </Badge>
                </div>
                <VideoPlayer
                  stream={camera}
                  videoUrl={camera.url}
                  currentTime={currentTime}
                  isPlaying={isPlaying}
                  onTimeUpdate={onTimeUpdate}
                  onDurationChange={onDurationChange}
                  isMain={index === 0} // First video is main
                  currentFrame={currentFrame}
                  totalFrames={totalFrames}
                />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
