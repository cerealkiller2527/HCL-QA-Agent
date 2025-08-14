"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CustomDropdown } from "@/components/ui/custom-dropdown"
import { CameraViewer } from "@/components/datasets/camera-viewer"
import { EpisodeSelector } from "@/components/datasets/episode-selector"
import { DatasetStats } from "@/components/datasets/dataset-stats"
import { TelemetryChart } from "@/components/datasets/telemetry-chart"
import { Play, Pause, SkipBack, SkipForward, Download, Settings, ArrowLeft, BarChart3, Activity } from "lucide-react"
import { mockDatasets } from "@/lib/data/mock-datasets"
import { cn } from "@/lib/utils"
import { ANIMATION } from "@/lib/constants"
import { createStaggerAnimation } from "@/lib/utils/animations"
import Link from "next/link"

// Mock data
const mockEpisodes = [
  { id: 1, name: "Episode 1", duration: 45, status: "completed" },
  { id: 2, name: "Episode 2", duration: 52, status: "completed" },
  { id: 3, name: "Episode 3", duration: 38, status: "completed" },
  { id: 4, name: "Episode 4", duration: 41, status: "processing" },
  { id: 5, name: "Episode 5", duration: 47, status: "failed" },
]

const mockCameraStreams = [
  { id: "main", name: "Main Camera", resolution: "1920x1080", fps: 30, active: true },
  { id: "wrist", name: "Wrist Camera", resolution: "640x480", fps: 15, active: true },
  { id: "overhead", name: "Overhead View", resolution: "1280x720", fps: 24, active: true },
  { id: "side", name: "Side Camera", resolution: "640x480", fps: 15, active: false },
]

const mockTelemetryData = Array.from({ length: 78 }, (_, i) => ({
  time: i,
  shoulder_pan_action: Math.sin(i * 0.1) * 50 + Math.random() * 10,
  shoulder_pan_obs: Math.sin(i * 0.1) * 45 + Math.random() * 8,
  shoulder_lift_action: Math.cos(i * 0.08) * 30 + Math.random() * 5,
  shoulder_lift_obs: Math.cos(i * 0.08) * 25 + Math.random() * 4,
  elbow_flex_action: Math.sin(i * 0.12) * 40 - 20 + Math.random() * 8,
  elbow_flex_obs: Math.sin(i * 0.12) * 35 - 18 + Math.random() * 6,
  wrist_flex_action: Math.cos(i * 0.15) * 60 + 20 + Math.random() * 12,
  wrist_flex_obs: Math.cos(i * 0.15) * 55 + 18 + Math.random() * 10,
  wrist_roll_action: Math.sin(i * 0.18) * 25 - 10 + Math.random() * 5,
  wrist_roll_obs: Math.sin(i * 0.18) * 22 - 8 + Math.random() * 4,
  gripper_action: i < 20 ? 0 : i < 40 ? 75 : i < 60 ? 50 : 75,
  gripper_obs: i < 20 ? 2 : i < 40 ? 72 : i < 60 ? 48 : 73,
}))

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
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentFrame, setCurrentFrame] = useState([0])
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const [selectedEpisode, setSelectedEpisode] = useState(1)

  const dataset = mockDatasets.find((d) => d.id === datasetId)
  const containerVariants = createStaggerAnimation()

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

  const currentTime = (currentFrame[0] / dataset.frameCount) * dataset.duration
  const currentEpisode = mockEpisodes.find((ep) => ep.id === selectedEpisode)
  const currentData = mockTelemetryData[Math.min(currentFrame[0], mockTelemetryData.length - 1)]

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
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium font-sans">Episode:</span>
            <CustomDropdown
              value={selectedEpisode.toString()}
              onValueChange={(value) => setSelectedEpisode(Number(value))}
              placeholder="Select Episode"
              className="w-32"
              options={mockEpisodes.map((ep) => ({
                value: ep.id.toString(),
                label: ep.name,
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
          episodes={mockEpisodes}
          selectedEpisode={selectedEpisode}
          onEpisodeSelect={setSelectedEpisode}
          formatDuration={formatDuration}
        />
      </motion.div>

      {/* Main Content */}
      <div className="grid grid-cols-1 xl:grid-cols-6 gap-4">
        <motion.div className="xl:col-span-5 space-y-4" variants={ANIMATION.variants.staggerItem}>
          <CameraViewer streams={mockCameraStreams} currentFrame={currentFrame[0]} totalFrames={dataset.frameCount} />

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
                    <CustomDropdown
                      value={playbackSpeed.toString()}
                      onValueChange={(value) => setPlaybackSpeed(Number(value))}
                      placeholder="1x"
                      className="w-16"
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
            activeCameras={mockCameraStreams.filter((c) => c.active).length}
            frameCount={dataset.frameCount}
            size={dataset.size}
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
                    data={mockTelemetryData}
                    lines={[
                      { dataKey: "shoulder_pan_action", color: "#ef4444", name: "shoulder_pan.pos" },
                      { dataKey: "shoulder_lift_action", color: "#22c55e", name: "shoulder_lift.pos" },
                    ]}
                    currentData={currentData}
                    yDomain={[-100, 100]}
                  />

                  <TelemetryChart
                    title="Wrist Joints"
                    data={mockTelemetryData}
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
                  data={mockTelemetryData}
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
