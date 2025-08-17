"use client"

import React, { useState, use, useCallback, useEffect } from "react"
import { motion } from "framer-motion"
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { CustomSelect } from "@/components/ui/custom-select"
import { CameraViewer } from "@/components/datasets/viewer/camera-viewer"
import { DatasetStats } from "@/components/datasets/viewer/dataset-stats"
import { TelemetryChart } from "@/components/datasets/viewer/telemetry-chart"
import { Play, Pause, SkipBack, SkipForward, Download, Settings, ArrowLeft, BarChart3 } from "lucide-react"
import { cn } from "@/lib/utils"
import { ANIMATION } from "@/lib/constants"
import { createStaggerAnimation } from "@/lib/utils/animations"
import Link from "next/link"

// TanStack Query & Services
import { datasetsApi } from '@/services/api/datasets.api'
import { episodesApi } from '@/services/api/episodes.api'
import { telemetryApi } from '@/services/api/telemetry.api'
import { queryKeys } from '@/services/utils/queryKeys'
// Import types without explicit type keyword to avoid unused variable warnings

// Unified PlaybackManager
import { PlaybackProvider, usePlayback } from '@/contexts/playback-context'

// Utility functions
function formatFileSize(bytes: number): string {
  const sizes = ["B", "KB", "MB", "GB", "TB"]
  if (bytes === 0) return "0 B"
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i]
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)
  if (hours > 0) return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  return `${minutes}:${secs.toString().padStart(2, "0")}`
}


export default function DatasetViewerPage({ params }: { params: Promise<{ id: string[] }> }) {
  const resolvedParams = use(params)
  
  // Ensure we have exactly 2 parts: owner and dataset_name
  if (!resolvedParams.id || resolvedParams.id.length !== 2) {
    throw new Error('Invalid dataset URL format. Expected: /datasets/owner/dataset-name')
  }
  
  const [owner, datasetName] = resolvedParams.id
  const datasetId = `${owner}/${datasetName}`
  
  
  return (
    <DatasetViewerContent datasetId={datasetId} />
  )
}

function DatasetViewerContent({ datasetId }: { datasetId: string }) {
  const [selectedEpisode, setSelectedEpisode] = useState(0)
  
  return (
    <PlaybackProvider fps={30} episodeDuration={60} episodeId={selectedEpisode}>
      <DatasetViewerInner datasetId={datasetId} selectedEpisode={selectedEpisode} setSelectedEpisode={setSelectedEpisode} />
    </PlaybackProvider>
  )
}

function DatasetViewerInner({ 
  datasetId, 
  selectedEpisode, 
  setSelectedEpisode 
}: { 
  datasetId: string 
  selectedEpisode: number
  setSelectedEpisode: (episode: number) => void
}) {
  const {
    isPlaying,
    currentFrame,
    playbackSpeed,
    totalFrames,
    currentTime,
    togglePlay,
    seekToFrame,
    setSpeed,
    setTotalFrames,
  } = usePlayback()

  // Simple seek handler - no need for extra callback
  const handleSeekToFrame = (frame: number) => seekToFrame(frame)

  const containerVariants = createStaggerAnimation()

  // Fetch dataset details
  const { 
    data: dataset 
  } = useQuery({
    queryKey: queryKeys.datasets.detail(datasetId),
    queryFn: () => datasetsApi.fetchDataset(datasetId),
  })

  // Fetch episodes list
  const { 
    data: episodes 
  } = useQuery({
    queryKey: queryKeys.episodes.list(datasetId),
    queryFn: () => episodesApi.fetchEpisodes(datasetId),
    enabled: !!dataset,
  })

  // Fetch telemetry data for current episode (use raw API for LeRobot format)
  const { 
    data: telemetryData, 
    isLoading: telemetryLoading 
  } = useQuery({
    queryKey: queryKeys.telemetry.detail(datasetId, selectedEpisode),
    queryFn: () => telemetryApi.fetchTelemetry(datasetId, selectedEpisode),
    enabled: !!dataset && episodes && episodes.length > selectedEpisode,
  })

  // Fetch video URLs for current episode
  const { 
    data: videoUrls 
  } = useQuery({
    queryKey: queryKeys.episodes.videos(datasetId, selectedEpisode),
    queryFn: () => episodesApi.fetchVideoUrls(datasetId, selectedEpisode),
    enabled: !!dataset && episodes && episodes.length > selectedEpisode,
  })

  // Update PlaybackManager with episode data when episodes change
  const updateFrameCount = useCallback(() => {
    if (episodes && episodes.length > selectedEpisode) {
      const episodeFrames = episodes[selectedEpisode]?.frame_count || 1000
      setTotalFrames(episodeFrames)
    }
  }, [episodes, selectedEpisode, setTotalFrames])

  useEffect(() => {
    updateFrameCount()
  }, [updateFrameCount])

  // Simplified telemetry data processing - let backend handle format consistency
  const processedTelemetryData = telemetryData?.data || telemetryData || []
  
  // Simple current data lookup - no memoization needed for array indexing
  const currentData = processedTelemetryData[Math.min(currentFrame, processedTelemetryData.length - 1)] || {}
  
  // Simple camera streams transformation
  const cameraStreams = videoUrls?.map((video) => ({
    id: video.camera_id || "unknown",
    name: video.camera_name || "Camera",
    resolution: video.metadata?.resolution?.formatted || "Unknown",
    fps: video.metadata?.fps || 30,
    active: true,
    url: video.url,
    metadata: video.metadata
  })) || []

  // Simplified column categorization - basic pattern matching
  const getColumns = () => {
    if (!processedTelemetryData.length) return { actionColumns: [], stateColumns: [] }
    
    const allColumns = Object.keys(processedTelemetryData[0]).filter(
      key => !['time', 'timestamp', 'frame_index'].includes(key)
    )
    
    return {
      actionColumns: allColumns.filter(key => key.includes('action')),
      stateColumns: allColumns.filter(key => key.includes('state') || key.includes('obs')),
    }
  }
  
  const { actionColumns, stateColumns } = getColumns()

  // Simplified telemetry charts rendering
  const renderTelemetryCharts = () => {
    if (!processedTelemetryData.length) {
      return (
        <div className="text-center py-8">
          <p className="text-sm text-muted-foreground">No telemetry data available</p>
        </div>
      )
    }

    const colors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"]
    const charts = []

    // Action chart
    if (actionColumns.length > 0) {
      charts.push(
        <TelemetryChart
          key="actions"
          title="Actions"
          data={processedTelemetryData}
          lines={actionColumns.slice(0, 6).map((key, index) => ({
            dataKey: key,
            color: colors[index] || "#666666",
            name: key.replace(/action|_/g, '')
          }))}
          currentData={currentData}
          yDomain={[-180, 180]}
        />
      )
    }

    // State chart
    if (stateColumns.length > 0) {
      charts.push(
        <TelemetryChart
          key="states"
          title="States"
          data={processedTelemetryData}
          lines={stateColumns.slice(0, 6).map((key, index) => ({
            dataKey: key,
            color: colors[index] || "#666666",
            name: key.replace(/state|obs|_/g, '')
          }))}
          currentData={currentData}
          yDomain={[-180, 180]}
        />
      )
    }

    return charts.length > 0 ? (
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">{charts}</div>
    ) : (
      <div className="text-center py-8">
        <p className="text-sm text-muted-foreground">No chart data available</p>
      </div>
    )
  }

  // Define episode-related variables for rendering with bounds checking
  const currentEpisodeData = episodes && episodes.length > selectedEpisode 
    ? episodes[selectedEpisode] 
    : null
  const episodeFrames = currentEpisodeData?.frame_count || dataset?.frameCount || 1000
  const episodeDuration = currentEpisodeData?.duration || dataset?.duration || 60

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
          <h1 className="font-sans text-2xl font-bold truncate">{dataset?.name || 'Loading...'}</h1>
          <p className="text-muted-foreground font-sans text-sm truncate">{dataset?.description || ''}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-layer-2 px-2.5 py-1.5 rounded-lg border border-border">
            <span className="text-sm font-medium font-sans text-foreground">Episode:</span>
            <CustomSelect
              value={selectedEpisode.toString()}
              onValueChange={(value) => setSelectedEpisode(Number(value))}
              placeholder="Select"
              className="w-32 h-8"
              options={episodes?.map((ep, index) => ({
                value: index.toString(),
                label: `${index + 1} (${formatDuration(ep.duration || 60)})`,
              })) || []}
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

      {/* Episode Selection - Inline */}
      {episodes && episodes.length > 0 && (
        <motion.div variants={ANIMATION.variants.staggerItem}>
          <div className="flex gap-3 overflow-x-auto py-1 px-1">
            {episodes.map((episode, index) => (
              <button
                key={index}
                className={cn(
                  "flex-shrink-0 px-4 py-2.5 rounded-lg transition-all border",
                  "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                  selectedEpisode === index
                    ? "border-primary bg-primary/10 text-primary ring-2 ring-primary"
                    : "border-border bg-layer-2 hover:border-primary/50 hover:bg-layer-hover"
                )}
                onClick={() => setSelectedEpisode(index)}
              >
                <div className="text-left">
                  <p className="text-sm font-medium">Episode {index + 1}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {formatDuration(episode.duration || 60)}
                    <span className="ml-2 text-green-600">• {episode.frame_count || 0} frames</span>
                  </p>
                </div>
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 xl:grid-cols-6 gap-4">
        <motion.div className="xl:col-span-5 space-y-4" variants={ANIMATION.variants.staggerItem}>
          <CameraViewer streams={cameraStreams} />

          {/* Playback Controls */}
          <Card className="layer-card">
            <CardContent className="p-4 space-y-4">
              <Slider
                value={[currentFrame]}
                onValueChange={(value) => handleSeekToFrame(value[0])}
                max={totalFrames - 1}
                step={1}
                className="w-full"
              />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => seekToFrame(Math.max(0, currentFrame - 100))}
                  >
                    <SkipBack className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={togglePlay}
                    className={cn(isPlaying && "bg-primary text-primary-foreground")}
                  >
                    {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => seekToFrame(Math.min(totalFrames - 1, currentFrame + 100))}
                  >
                    <SkipForward className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-sm text-muted-foreground font-mono">
                    {formatDuration(Math.floor(currentTime))} /{" "}
                    {formatDuration(episodeDuration)}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground font-sans">Speed:</span>
                    <CustomSelect
                      value={playbackSpeed.toString()}
                      onValueChange={(value) => setSpeed(Number(value))}
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
            duration={episodeDuration}
            activeCameras={cameraStreams.filter((c) => c.active).length}
            frameCount={episodeFrames}
            size={dataset?.fileSize ?? 0}
            tags={dataset?.tags ?? []}
            fps={dataset?.fps || cameraStreams[0]?.fps}
            resolution={cameraStreams[0]?.resolution}
            bitrate={cameraStreams[0]?.metadata?.bitrate_mbps ? `${cameraStreams[0].metadata.bitrate_mbps} Mbps` : undefined}
            formatDuration={formatDuration}
            formatFileSize={formatFileSize}
          />
        </motion.div>
      </div>

      {/* Telemetry Section */}
      <motion.div variants={ANIMATION.variants.staggerItem}>
        <Card className="layer-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Telemetry Data
            </CardTitle>
          </CardHeader>
          <CardContent>
            {telemetryLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center space-y-2">
                  <div className="w-8 h-8 bg-layer-2 rounded-full animate-pulse mx-auto" />
                  <p className="text-sm text-muted-foreground">Loading telemetry data...</p>
                </div>
              </div>
            ) : (
              renderTelemetryCharts()
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
