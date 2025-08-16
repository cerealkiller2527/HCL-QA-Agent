"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Loader2, Play, Pause, SkipBack, SkipForward, RotateCcw, Camera, Activity, Clock, Gauge } from "lucide-react"
import { formatFileSize, formatDuration } from "@/lib/utils/format"
import { TimestampManager, VideoSyncManager, timestampUtils } from "@/lib/utils/timestamp"
import { useDataset, useDatasetEpisodes, useEpisodeData } from "@/lib/hooks/use-datasets"
import type { CameraStream } from "@/lib/api/schemas/validation"

interface DatasetViewerProps {
  datasetId: string
}

interface TelemetryPoint {
  timestamp: number
  jointPositions?: number[]
  jointVelocities?: number[]
  endEffectorPosition?: number[]
  gripperState?: number
  [key: string]: any
}

export function DatasetViewer({ datasetId }: DatasetViewerProps) {
  // Playback state
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentFrame, setCurrentFrame] = useState(0)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const [selectedEpisode, setSelectedEpisode] = useState(0)
  const [selectedCamera, setSelectedCamera] = useState<string>("camera_top")

  // Video refs for synchronization
  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({})
  const playbackIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Data fetching
  const { data: dataset, loading: datasetLoading, error: datasetError } = useDataset(datasetId)
  const { data: episodes, loading: episodesLoading } = useDatasetEpisodes(datasetId)
  const { data: episodeData, loading: episodeDataLoading } = useEpisodeData(datasetId, selectedEpisode)

  // Calculate FPS and create timestamp managers
  const fps = dataset?.fps || 30
  const timestampManager = useMemo(() => new TimestampManager(fps), [fps])
  
  // Get camera names for synchronization
  const cameraNames = useMemo(() => {
    return episodeData?.videoUrls?.map(url => url.camera) || ["camera_top", "camera_front", "camera_wrist"]
  }, [episodeData?.videoUrls])

  const videoSyncManager = useMemo(() => 
    new VideoSyncManager(fps, cameraNames), 
    [fps, cameraNames]
  )

  // Auto-select first episode when episodes load
  useEffect(() => {
    if (episodes && episodes.length > 0 && selectedEpisode === 0) {
      setSelectedEpisode(episodes[0].id)
    }
  }, [episodes, selectedEpisode])

  // Auto-select first camera when video URLs load
  useEffect(() => {
    if (episodeData?.videoUrls && episodeData.videoUrls.length > 0) {
      setSelectedCamera(episodeData.videoUrls[0].camera)
    }
  }, [episodeData?.videoUrls])

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (playbackIntervalRef.current) {
        clearInterval(playbackIntervalRef.current)
      }
    }
  }, [])

  // Handle playback control
  const handlePlayPause = () => {
    if (isPlaying) {
      // Pause all videos
      Object.values(videoRefs.current).forEach(video => {
        if (video) video.pause()
      })
      if (playbackIntervalRef.current) {
        clearInterval(playbackIntervalRef.current)
        playbackIntervalRef.current = null
      }
    } else {
      // Play all videos synchronized
      const seekTimes = videoSyncManager.calculateSeekTimes(currentFrame)
      Object.entries(videoRefs.current).forEach(([camera, video]) => {
        if (video && seekTimes[camera] !== undefined) {
          video.currentTime = seekTimes[camera]
          video.playbackRate = playbackSpeed
          video.play()
        }
      })

      // Start frame counter
      playbackIntervalRef.current = setInterval(() => {
        setCurrentFrame(prev => {
          const nextFrame = prev + playbackSpeed
          const maxFrames = dataset?.frameCount || 0
          return Math.min(nextFrame, maxFrames - 1)
        })
      }, timestampManager.getFrameDuration() * 1000)
    }
    setIsPlaying(!isPlaying)
  }

  // Handle frame seeking
  const handleFrameSeek = (frame: number) => {
    const maxFrames = dataset?.frameCount || 0
    const boundedFrame = Math.max(0, Math.min(frame, maxFrames - 1))
    setCurrentFrame(boundedFrame)

    // Synchronize all video seeks
    const seekTimes = videoSyncManager.calculateSeekTimes(boundedFrame)
    Object.entries(videoRefs.current).forEach(([camera, video]) => {
      if (video && seekTimes[camera] !== undefined) {
        video.currentTime = seekTimes[camera]
      }
    })
  }

  // Handle timeline scrubbing
  const handleTimelineChange = (value: number[]) => {
    handleFrameSeek(value[0])
  }

  // Reset to beginning
  const handleReset = () => {
    setIsPlaying(false)
    handleFrameSeek(0)
    if (playbackIntervalRef.current) {
      clearInterval(playbackIntervalRef.current)
      playbackIntervalRef.current = null
    }
  }

  // Frame navigation
  const handleNextFrame = () => handleFrameSeek(currentFrame + 1)
  const handlePrevFrame = () => handleFrameSeek(currentFrame - 1)

  if (datasetLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading dataset...</span>
      </div>
    )
  }

  if (datasetError || !dataset) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <h3 className="text-lg font-semibold">Dataset not found</h3>
          <p className="text-muted-foreground">The requested dataset could not be loaded.</p>
        </div>
      </div>
    )
  }

  // Calculate current time and episode info
  const currentTime = timestampManager.frameToTimestamp(currentFrame)
  const totalDuration = timestampManager.getTotalDuration(dataset.frameCount)
  const currentEpisode = episodes?.find((ep) => ep.id === selectedEpisode)
  const telemetryData = episodeData?.telemetryData || []
  const currentTelemetry: TelemetryPoint = telemetryData[Math.min(currentFrame, telemetryData.length - 1)] || {}
  
  // Create camera streams from real data or fallback
  const cameraStreams: CameraStream[] = episodeData?.videoUrls?.map(url => ({
    id: url.camera,
    name: url.camera,
    resolution: url.resolution || "Unknown",
    fps: url.fps || fps,
    active: true,
    url: url.url
  })) || [
    { id: "camera_top", name: "Top Camera", resolution: "640x480", fps: 30, active: true },
    { id: "camera_front", name: "Front Camera", resolution: "640x480", fps: 30, active: true },
    { id: "camera_wrist", name: "Wrist Camera", resolution: "640x480", fps: 30, active: true },
  ]

  // Generate timeline sync points
  const syncPoints = timestampManager.getSyncPoints(dataset.frameCount)

  return (
    <div className="space-y-6">
      {/* Dataset Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{dataset.name}</h1>
          <p className="text-muted-foreground">{dataset.description}</p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="secondary">
            <Activity className="w-4 h-4 mr-1" />
            {dataset.status}
          </Badge>
          <Badge variant="outline">
            <Clock className="w-4 h-4 mr-1" />
            {formatDuration(totalDuration)}
          </Badge>
        </div>
      </div>

      {/* Episode Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gauge className="h-5 w-5" />
            Episode Navigation
          </CardTitle>
          <CardDescription>
            Select episode and navigate through robot demonstration data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium">Episode</label>
              <Select value={selectedEpisode.toString()} onValueChange={(value) => setSelectedEpisode(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {episodes?.map((episode) => (
                    <SelectItem key={episode.id} value={episode.id.toString()}>
                      Episode {episode.id} ({formatDuration(episode.duration || 0)})
                    </SelectItem>
                  )) || (
                    <SelectItem value="0">Loading episodes...</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium">Camera View</label>
              <Select value={selectedCamera} onValueChange={setSelectedCamera}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {cameraStreams.map((stream) => (
                    <SelectItem key={stream.id} value={stream.id}>
                      <div className="flex items-center gap-2">
                        <Camera className="h-4 w-4" />
                        {stream.name} ({stream.resolution})
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Playback Speed</label>
              <Select value={playbackSpeed.toString()} onValueChange={(value) => setPlaybackSpeed(parseFloat(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0.25">0.25x</SelectItem>
                  <SelectItem value="0.5">0.5x</SelectItem>
                  <SelectItem value="1">1x</SelectItem>
                  <SelectItem value="1.5">1.5x</SelectItem>
                  <SelectItem value="2">2x</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Video Player */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              Camera: {cameraStreams.find(s => s.id === selectedCamera)?.name || selectedCamera}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
              {/* Video elements for each camera (hidden except selected) */}
              {cameraStreams.map((stream) => (
                <video
                  key={stream.id}
                  ref={(el) => {
                    if (el) videoRefs.current[stream.id] = el
                  }}
                  className={`w-full h-full object-contain ${stream.id === selectedCamera ? 'block' : 'hidden'}`}
                  poster="/api/placeholder/640/480"
                  controls={false}
                  muted
                >
                  {stream.url && <source src={stream.url} type="video/mp4" />}
                  <div className="flex items-center justify-center h-full text-white">
                    Video not available
                  </div>
                </video>
              ))}
              
              {/* Video overlay with frame info */}
              <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-1 rounded text-sm font-mono">
                Frame: {timestampUtils.formatFrameCount(currentFrame, dataset.frameCount)}
              </div>
              <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-1 rounded text-sm font-mono">
                Time: {timestampUtils.formatTimestamp(currentTime)}
              </div>
            </div>

            {/* Timeline and Controls */}
            <div className="mt-4 space-y-4">
              {/* Timeline Slider */}
              <div className="space-y-2">
                <Slider
                  value={[currentFrame]}
                  onValueChange={handleTimelineChange}
                  max={dataset.frameCount - 1}
                  step={1}
                  className="w-full"
                />
                {/* Sync points display */}
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>0:00</span>
                  {syncPoints.slice(1, -1).map((point, idx) => (
                    <span key={idx}>{point.description}</span>
                  ))}
                  <span>{timestampUtils.formatTimestamp(totalDuration)}</span>
                </div>
              </div>

              {/* Playback Controls */}
              <div className="flex items-center justify-center gap-2">
                <Button variant="outline" size="sm" onClick={handleReset}>
                  <RotateCcw className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={handlePrevFrame}>
                  <SkipBack className="h-4 w-4" />
                </Button>
                <Button onClick={handlePlayPause}>
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
                <Button variant="outline" size="sm" onClick={handleNextFrame}>
                  <SkipForward className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Robot Telemetry */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Robot State
            </CardTitle>
            <CardDescription>
              Real-time telemetry data at frame {currentFrame}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Joint Positions */}
              {currentTelemetry.jointPositions && (
                <div>
                  <h4 className="font-medium text-sm mb-2">Joint Positions</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {currentTelemetry.jointPositions.slice(0, 6).map((pos, idx) => (
                      <div key={idx} className="bg-muted rounded p-2 text-center">
                        <div className="text-xs text-muted-foreground">J{idx + 1}</div>
                        <div className="font-mono text-sm">{pos.toFixed(3)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* End Effector Position */}
              {currentTelemetry.endEffectorPosition && (
                <div>
                  <h4 className="font-medium text-sm mb-2">End Effector</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {['X', 'Y', 'Z'].map((axis, idx) => (
                      <div key={axis} className="bg-muted rounded p-2 text-center">
                        <div className="text-xs text-muted-foreground">{axis}</div>
                        <div className="font-mono text-sm">
                          {currentTelemetry.endEffectorPosition?.[idx]?.toFixed(3) || '0.000'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Gripper State */}
              {currentTelemetry.gripperState !== undefined && (
                <div>
                  <h4 className="font-medium text-sm mb-2">Gripper</h4>
                  <div className="bg-muted rounded p-3 text-center">
                    <div className="text-2xl font-mono">
                      {currentTelemetry.gripperState > 0.5 ? '🤏' : '✋'}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {(currentTelemetry.gripperState * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>
              )}

              {/* Episode Info */}
              {currentEpisode && (
                <div className="pt-4 border-t">
                  <h4 className="font-medium text-sm mb-2">Episode Info</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Duration:</span>
                      <span>{formatDuration(currentEpisode.duration || 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Status:</span>
                      <Badge variant={currentEpisode.status === "completed" ? "default" : "secondary"}>
                        {currentEpisode.status}
                      </Badge>
                    </div>
                    {currentEpisode.tasks && currentEpisode.tasks.length > 0 && (
                      <div>
                        <span className="text-muted-foreground">Tasks:</span>
                        <div className="mt-1">
                          {currentEpisode.tasks.map((task, idx) => (
                            <Badge key={idx} variant="outline" className="mr-1 mb-1">
                              {task}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dataset Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Dataset Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{dataset.episodeCount || episodes?.length || 0}</div>
              <div className="text-sm text-muted-foreground">Episodes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{dataset.frameCount.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Frames</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{formatDuration(totalDuration)}</div>
              <div className="text-sm text-muted-foreground">Duration</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{formatFileSize(dataset.fileSize)}</div>
              <div className="text-sm text-muted-foreground">Size</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{fps} FPS</div>
              <div className="text-sm text-muted-foreground">Frame Rate</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
