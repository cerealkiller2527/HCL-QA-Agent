"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CustomSelect } from "@/components/ui/custom-select"
import { CameraViewer } from "@/components/datasets/viewer/camera-viewer"
import { EpisodeSelector } from "@/components/datasets/viewer/episode-selector"
import { DatasetStats } from "@/components/datasets/viewer/dataset-stats"
import { TelemetryChart } from "@/components/datasets/viewer/telemetry-chart"
import { TelemetryDisplay } from "@/components/datasets/viewer/telemetry-display"
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Download, 
  Settings, 
  ArrowLeft, 
  BarChart3, 
  Activity,
  Loader2,
  AlertCircle 
} from "lucide-react"
import { cn } from "@/lib/utils"
import { ANIMATION } from "@/lib/constants"
import { createStaggerAnimation } from "@/lib/utils/animations"
import Link from "next/link"
import { useDataset } from "@/lib/hooks/use-datasets"
import datasetsApi from "@/lib/api/datasets.api"
import type { Episode } from "@/lib/api/schemas/dataset.schema"
import type { VideoUrl, TelemetryPoint, CameraInfo, TelemetryData } from "@/lib/api/schemas/viewer.schema"


function formatFileSize(bytes: number): string {
  const sizes = ["B", "KB", "MB", "GB", "TB"]
  if (bytes === 0) return "0 B"
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i]
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  if (hours > 0) return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  return `${minutes}:${secs.toString().padStart(2, "0")}`
}

interface DatasetViewerProps {
  datasetId: string
}

export function DatasetViewer({ datasetId }: DatasetViewerProps) {
  // State management
  const [mounted, setMounted] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const [selectedEpisode, setSelectedEpisode] = useState(0)
  
  // Data fetching states
  const [episodes, setEpisodes] = useState<Episode[]>([])
  const [cameraInfo, setCameraInfo] = useState<CameraInfo[]>([])
  const [videoUrls, setVideoUrls] = useState<VideoUrl[]>([])
  const [telemetryData, setTelemetryData] = useState<TelemetryPoint[]>([])
  const [rawTelemetryData, setRawTelemetryData] = useState<TelemetryData | null>(null)
  const [loading, setLoading] = useState(true)
  const [dataLoading, setDataLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch dataset details
  const { data: dataset, isLoading: datasetLoading, error: datasetError } = useDataset(datasetId)
  
  const containerVariants = createStaggerAnimation()

  // Handle client-side mounting
  useEffect(() => {
    setMounted(true)
  }, [])

  // Fetch initial data (episodes and camera info)
  useEffect(() => {
    async function fetchInitialData() {
      if (!datasetId) return
      
      setLoading(true)
      setError(null)
      
      try {
        // Fetch episodes and camera info in parallel
        const [episodesData, cameraData] = await Promise.all([
          datasetsApi.getEpisodes(datasetId),
          datasetsApi.getCameraInfo(datasetId)
        ])
        
        if (episodesData && episodesData.length > 0) {
          setEpisodes(episodesData)
          setSelectedEpisode(episodesData[0].id)
        } else {
          // Use mock data as fallback
          setEpisodes([
            { id: 0, name: "Episode 0", duration: 45, status: "completed", tasks: [], length: 1350 },
            { id: 1, name: "Episode 1", duration: 52, status: "completed", tasks: [], length: 1560 },
          ])
          setSelectedEpisode(0)
        }
        
        if (cameraData) {
          setCameraInfo(cameraData.cameras)
        } else {
          // Use mock camera info as fallback
          setCameraInfo([
            { id: "observation.image", name: "Main Camera", resolution: "480x640", fps: 30, active: true }
          ])
        }
      } catch (err) {
        // Error fetching initial data - use fallback
        // Use mock data on error
        setEpisodes([
          { id: 0, name: "Episode 0", duration: 45, status: "completed", tasks: [], length: 1350 }
        ])
        setCameraInfo([
          { id: "observation.image", name: "Main Camera", resolution: "480x640", fps: 30, active: true }
        ])
        setSelectedEpisode(0)
      } finally {
        setLoading(false)
      }
    }
    
    fetchInitialData()
  }, [datasetId])

  // Fetch episode-specific data when episode changes
  useEffect(() => {
    async function fetchEpisodeData() {
      if (!datasetId || selectedEpisode === null) return
      
      setDataLoading(true)
      setCurrentTime(0) // Reset time when episode changes
      
      try {
        // Fetch video URLs, raw telemetry, and transformed telemetry in parallel
        const [videosData, rawTelemetry, telemetryPoints] = await Promise.all([
          datasetsApi.getEpisodeVideos(datasetId, selectedEpisode),
          datasetsApi.getRawTelemetry(datasetId, selectedEpisode),
          datasetsApi.getEpisodeTelemetry(datasetId, selectedEpisode)
        ])
        
        if (videosData) {
          setVideoUrls(videosData.videos)
          setDuration(videosData.duration)
        }
        
        // Store raw telemetry data for proper feature name extraction
        if (rawTelemetry) {
          setRawTelemetryData(rawTelemetry)
        }
        
        if (telemetryPoints && telemetryPoints.length > 0) {
          setTelemetryData(telemetryPoints)
        } else {
          // Generate mock telemetry as fallback
          const mockTelemetry = Array.from({ length: 78 }, (_, i) => ({
            time: i * 0.033,
            shoulder_pan_action: Math.sin(i * 0.1) * 50,
            shoulder_pan_obs: Math.sin(i * 0.1) * 45,
            shoulder_lift_action: Math.cos(i * 0.08) * 30,
            shoulder_lift_obs: Math.cos(i * 0.08) * 25,
          }))
          setTelemetryData(mockTelemetry)
          setRawTelemetryData(null)
        }
      } catch (err) {
        // Error fetching episode data
      } finally {
        setDataLoading(false)
      }
    }
    
    fetchEpisodeData()
  }, [datasetId, selectedEpisode])

  // Playback animation loop with proper cleanup
  useEffect(() => {
    let frameId: number | null = null
    let lastTime = 0
    
    if (isPlaying && duration > 0) {
      const animate = (timestamp: number) => {
        if (lastTime === 0) {
          lastTime = timestamp
        }

        const deltaTime = (timestamp - lastTime) / 1000 // Convert to seconds
        lastTime = timestamp

        setCurrentTime((prevTime) => {
          const newTime = prevTime + deltaTime * playbackSpeed
          if (newTime >= duration) {
            setIsPlaying(false)
            return duration
          }
          return newTime
        })

        frameId = requestAnimationFrame(animate)
      }
      
      frameId = requestAnimationFrame(animate)
    }

    // Cleanup function always runs
    return () => {
      if (frameId !== null) {
        cancelAnimationFrame(frameId)
      }
    }
  }, [isPlaying, duration, playbackSpeed])

  // Prevent SSR/hydration issues
  if (!mounted) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center py-16">
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 text-muted-foreground mx-auto animate-spin" />
            <p className="text-muted-foreground">Initializing viewer...</p>
          </div>
        </div>
      </div>
    )
  }

  // Loading and error states
  if (datasetLoading || loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center py-16">
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 text-muted-foreground mx-auto animate-spin" />
            <p className="text-muted-foreground">Loading dataset viewer...</p>
          </div>
        </div>
      </div>
    )
  }

  if (datasetError || error) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center py-16">
          <div className="text-center space-y-4">
            <AlertCircle className="h-8 w-8 text-destructive mx-auto" />
            <h2 className="font-sans text-xl font-bold">Error Loading Dataset</h2>
            <p className="text-muted-foreground">{error || datasetError?.message || "Failed to load dataset"}</p>
            <Link href="/datasets">
              <Button>Back to Datasets</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (!dataset) {
    return (
      <div className="p-8">
        <div className="text-center py-16">
          <h2 className="font-sans text-2xl font-bold mb-2">Dataset not found</h2>
          <p className="text-muted-foreground mb-4">The requested dataset could not be found.</p>
          <Link href="/datasets">
            <Button>Back to Datasets</Button>
          </Link>
        </div>
      </div>
    )
  }

  const currentEpisode = episodes.find((ep) => ep.id === selectedEpisode)
  const currentFrame = duration > 0 ? Math.floor((currentTime / duration) * (currentEpisode?.length || 100)) : 0
  const currentData = telemetryData.find(point => 
    Math.abs(point.time - currentTime) < 0.05
  ) || telemetryData[0]

  return (
    <motion.div className="p-6 space-y-4 min-h-screen" variants={containerVariants} initial="initial" animate="animate">
      {/* Header */}
      <motion.div className="flex items-center gap-4" variants={ANIMATION.variants.staggerItem}>
        <Link href="/datasets">
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="font-sans text-2xl font-bold truncate">{dataset.name}</h1>
          <p className="text-muted-foreground font-sans text-sm truncate">{dataset.description}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-layer-2 px-2.5 py-1.5 rounded-lg border border-border">
            <span className="text-sm font-medium font-sans text-foreground">Episode:</span>
            <CustomSelect
              value={selectedEpisode.toString()}
              onValueChange={(value) => setSelectedEpisode(Number(value))}
              placeholder="Select"
              className="w-24 h-8"
              options={episodes.map((ep) => ({
                value: ep.id.toString(),
                label: `${ep.id} (${formatDuration(ep.duration)})`,
              }))}
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-1" />
              Settings
            </Button>
            <Button size="sm" className="bg-primary hover:bg-primary/90">
              <Download className="h-4 w-4 mr-1" />
              Export
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Episode Selection */}
      {episodes.length > 0 && (
        <motion.div variants={ANIMATION.variants.staggerItem}>
          <EpisodeSelector
            episodes={episodes}
            selectedEpisode={selectedEpisode}
            onEpisodeSelect={setSelectedEpisode}
            formatDuration={formatDuration}
          />
        </motion.div>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 xl:grid-cols-6 gap-4">
        <motion.div className="xl:col-span-5 space-y-4" variants={ANIMATION.variants.staggerItem}>
          {dataLoading ? (
            <Card className="layer-card">
              <CardContent className="p-16">
                <div className="flex items-center justify-center">
                  <div className="text-center space-y-2">
                    <Loader2 className="h-8 w-8 text-muted-foreground mx-auto animate-spin" />
                    <p className="text-muted-foreground">Loading episode data...</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <CameraViewer 
              streams={cameraInfo.map(cam => ({
                id: cam.id,
                name: cam.name,
                resolution: cam.resolution,
                fps: cam.fps,
                active: cam.active
              }))} 
              videoUrls={videoUrls}
              currentTime={currentTime}
              isPlaying={isPlaying}
              onTimeUpdate={setCurrentTime}
              onDurationChange={setDuration}
              currentFrame={currentFrame} 
              totalFrames={currentEpisode?.length || 100} 
            />
          )}

          {/* Playback Controls */}
          <Card className="layer-card">
            <CardContent className="p-4 space-y-4">
              <Slider
                value={[duration > 0 ? (currentTime / duration) * 100 : 0]}
                onValueChange={(value) => setCurrentTime((value[0] / 100) * duration)}
                max={100}
                step={0.1}
                className="w-full"
              />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentTime(Math.max(0, currentTime - 10))}
                  >
                    <SkipBack className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsPlaying(!isPlaying)}
                    className={cn(isPlaying && "bg-primary text-primary-foreground")}
                  >
                    {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentTime(Math.min(duration, currentTime + 10))}
                  >
                    <SkipForward className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-sm text-muted-foreground font-mono">
                    {formatDuration(Math.floor(currentTime))} /{" "}
                    {formatDuration(currentEpisode?.duration || dataset.duration)}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground font-sans">Speed:</span>
                    <CustomSelect
                      value={playbackSpeed.toString()}
                      onValueChange={(value) => setPlaybackSpeed(Number(value))}
                      placeholder="1x"
                      className="w-20"
                      options={[
                        { value: "0.25", label: "0.25x" },
                        { value: "0.5", label: "0.5x" },
                        { value: "1", label: "1x" },
                        { value: "2", label: "2x" },
                        { value: "4", label: "4x" },
                      ]}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Sidebar */}
        <motion.div variants={ANIMATION.variants.staggerItem}>
          <DatasetStats
            duration={currentEpisode?.duration || dataset.duration}
            activeCameras={cameraInfo.filter((c) => c.active).length}
            frameCount={currentEpisode?.length || dataset.frameCount}
            size={dataset.fileSize || dataset.size}
            tags={dataset.tags}
            formatDuration={formatDuration}
            formatFileSize={formatFileSize}
          />
        </motion.div>
      </div>

      {/* Telemetry Section - LeRobot Style */}
      <motion.div variants={ANIMATION.variants.staggerItem}>
        <Card className="layer-card">
          <CardHeader className="pb-3">
            <CardTitle className="font-sans flex items-center gap-2 text-lg">
              <BarChart3 className="h-4 w-4 text-blue-500" />
              Telemetry Data
            </CardTitle>
          </CardHeader>
          <CardContent>
            {telemetryData.length > 0 ? (
              <TelemetryDisplay
                data={telemetryData}
                currentTime={currentTime}
                duration={duration}
                onTimeSeek={(time) => setCurrentTime(time)}
                rawTelemetryData={rawTelemetryData}
              />
            ) : (
              <div className="h-48 bg-layer-2 rounded-lg flex items-center justify-center border border-border">
                <div className="text-center space-y-2">
                  <Activity className="h-6 w-6 text-muted-foreground mx-auto" />
                  <p className="text-muted-foreground font-sans">No telemetry data available</p>
                  <p className="text-sm text-muted-foreground font-sans">
                    Telemetry will appear here when episode data is loaded
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
