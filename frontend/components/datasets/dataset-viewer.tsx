"use client"

import { useState, useEffect } from "react"
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
import { Play, Pause, SkipBack, SkipForward, Download, Settings, ArrowLeft, BarChart3, Activity, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { ANIMATION } from "@/lib/constants"
import { createStaggerAnimation } from "@/lib/utils/animations"
// Import shared formatting utilities
import { formatFileSize, formatDuration } from "@/lib/utils/format"
// Import real API hooks
import { useDataset, useDatasetEpisodes, useEpisodeData } from "@/lib/hooks/use-datasets"
import Link from "next/link"

// Removed mock data - now using real API data

// Import shared formatting utilities
import { formatFileSize, formatDuration } from "@/lib/utils/format"

interface DatasetViewerProps {
  datasetId: string
}

export function DatasetViewer({ datasetId }: DatasetViewerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentFrame, setCurrentFrame] = useState([0])
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const [selectedEpisode, setSelectedEpisode] = useState(0)

  // Fetch real dataset data from API
  const { data: dataset, loading: datasetLoading, error: datasetError } = useDataset(datasetId)
  const { data: episodes, loading: episodesLoading } = useDatasetEpisodes(datasetId)
  const { data: episodeData, loading: episodeDataLoading } = useEpisodeData(datasetId, selectedEpisode)

  const containerVariants = createStaggerAnimation()

  // Update selected episode when episodes are loaded
  useEffect(() => {
    if (episodes && episodes.length > 0 && selectedEpisode === 0) {
      setSelectedEpisode(episodes[0].id)
    }
  }, [episodes, selectedEpisode])

  // Show loading state
  if (datasetLoading) {
    return (
      <div className="p-8">
        <div className="text-center py-16">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <h2 className="font-sans text-2xl font-bold mb-2">Loading dataset...</h2>
          <p className="text-muted-foreground">Please wait while we fetch the dataset information.</p>
        </div>
      </div>
    )
  }

  // Show error state
  if (datasetError || !dataset) {
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

  const currentTime = (currentFrame[0] / dataset.frameCount) * dataset.duration
  const currentEpisode = episodes?.find((ep) => ep.id === selectedEpisode)
  
  // Use real telemetry data if available, fallback to empty array
  const telemetryData = episodeData?.telemetryData || []
  const currentData = telemetryData[Math.min(currentFrame[0], telemetryData.length - 1)] || {}
  
  // Use real camera data if available, fallback to mock for demo
  const cameraStreams = episodeData?.videoUrls?.map(url => ({
    id: url.camera,
    name: url.camera,
    resolution: url.resolution || "Unknown",
    fps: url.fps || 30,
    active: true
  })) || [
    { id: "main", name: "Main Camera", resolution: "1920x1080", fps: 30, active: true },
    { id: "wrist", name: "Wrist Camera", resolution: "640x480", fps: 15, active: true },
  ]

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
              options={(episodes || []).map((ep) => ({
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
      <motion.div variants={ANIMATION.variants.staggerItem}>
        <EpisodeSelector
          episodes={episodes || []}
          selectedEpisode={selectedEpisode}
          onEpisodeSelect={setSelectedEpisode}
          formatDuration={formatDuration}
        />
      </motion.div>

      {/* Main Content */}
      <div className="grid grid-cols-1 xl:grid-cols-6 gap-4">
        <motion.div className="xl:col-span-5 space-y-4" variants={ANIMATION.variants.staggerItem}>
          <CameraViewer streams={cameraStreams} currentFrame={currentFrame[0]} totalFrames={dataset.frameCount} />

          {/* Playback Controls */}
          <Card className="layer-card">
            <CardContent className="p-4 space-y-4">
              <Slider
                value={currentFrame}
                onValueChange={setCurrentFrame}
                max={dataset.frameCount - 1}
                step={1}
                className="w-full"
              />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentFrame([Math.max(0, currentFrame[0] - 100)])}
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
                    onClick={() => setCurrentFrame([Math.min(dataset.frameCount - 1, currentFrame[0] + 100)])}
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
              activeCameras={cameraStreams.filter((c) => c.active).length}
              frameCount={dataset.frameCount}
              size={formatFileSize(dataset.fileSize)}
              tags={dataset.tags}
              formatDuration={formatDuration}
              formatFileSize={formatFileSize}
            />
        </motion.div>
      </div>

      {/* Telemetry Section */}
      <motion.div variants={ANIMATION.variants.staggerItem}>
        <Card className="layer-card">
          <CardHeader className="pb-3">
            <CardTitle className="font-sans flex items-center gap-2 text-lg">
              <BarChart3 className="h-4 w-4 text-blue-500" />
              Telemetry Data
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <Tabs defaultValue="arm1" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="arm1">Arm 1</TabsTrigger>
                <TabsTrigger value="arm2">Arm 2</TabsTrigger>
                <TabsTrigger value="gripper">Gripper</TabsTrigger>
              </TabsList>

              <TabsContent value="arm1" className="mt-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <TelemetryChart
                    title="Shoulder Joints"
                    data={telemetryData}
                    lines={[
                      { dataKey: "shoulder_pan_action", color: "#ef4444", name: "shoulder_pan.pos" },
                      { dataKey: "shoulder_lift_action", color: "#22c55e", name: "shoulder_lift.pos" },
                    ]}
                    currentData={currentData}
                    yDomain={[-100, 100]}
                  />

                  <TelemetryChart
                    title="Wrist Joints"
                    data={telemetryData}
                    lines={[
                      { dataKey: "wrist_flex_action", color: "#ef4444", name: "wrist_flex.pos" },
                      { dataKey: "wrist_roll_action", color: "#06b6d4", name: "wrist_roll.pos" },
                    ]}
                    currentData={currentData}
                    yDomain={[-50, 135]}
                  />
                </div>
              </TabsContent>

              <TabsContent value="arm2" className="mt-4">
                <div className="h-48 bg-layer-2 rounded-lg flex items-center justify-center border border-border">
                  <div className="text-center space-y-2">
                    <Activity className="h-6 w-6 text-muted-foreground mx-auto" />
                    <p className="text-muted-foreground font-sans">Arm 2 Telemetry</p>
                    <p className="text-sm text-muted-foreground font-sans">Multi-arm data visualization</p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="gripper" className="mt-4">
                <TelemetryChart
                  title="Gripper Position"
                  data={telemetryData}
                  lines={[{ dataKey: "gripper_action", color: "#ef4444", name: "gripper.pos" }]}
                  currentData={currentData}
                  yDomain={[0, 100]}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
