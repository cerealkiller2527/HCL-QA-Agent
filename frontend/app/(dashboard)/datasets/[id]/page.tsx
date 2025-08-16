"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { CustomSelect } from "@/components/ui/custom-select"
import { CameraViewer } from "@/components/datasets/viewer/camera-viewer"
import { DatasetStats } from "@/components/datasets/viewer/dataset-stats"
import { TelemetryChart } from "@/components/datasets/viewer/telemetry-chart"
import { Play, Pause, SkipBack, SkipForward, Download, Settings, ArrowLeft, BarChart3 } from "lucide-react"
import { mockDatasets } from "@/lib/data/mock-datasets"
import { cn } from "@/lib/utils"
import { ANIMATION } from "@/lib/constants"
import { createStaggerAnimation } from "@/lib/utils/animations"
import Link from "next/link"

// Mock data
import { 
  mockEpisodes, 
  mockCameraStreams, 
  mockTelemetryData,
  formatFileSize,
  formatDuration 
} from "@/lib/mock-data/dataset-viewer-mock"

export default function DatasetViewerPage({ params }: { params: { id: string } }) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentFrame, setCurrentFrame] = useState([0])
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const [selectedEpisode, setSelectedEpisode] = useState(1)

  const dataset = mockDatasets.find((d) => d.id === params.id)
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
          <div className="flex items-center gap-1.5 bg-layer-2 px-2.5 py-1.5 rounded-lg border border-border">
            <span className="text-sm font-medium font-sans text-foreground">Episode:</span>
            <CustomSelect
              value={selectedEpisode.toString()}
              onValueChange={(value) => setSelectedEpisode(Number(value))}
              placeholder="Select"
              className="w-24 h-8"
              options={mockEpisodes.map((ep) => ({
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

      {/* Episode Selection - Inline */}
      <motion.div variants={ANIMATION.variants.staggerItem}>
        <div className="flex gap-3 overflow-x-auto py-1 px-1">
          {mockEpisodes.map((episode) => (
            <button
              key={episode.id}
              className={cn(
                "flex-shrink-0 px-4 py-2.5 rounded-lg transition-all border",
                "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                selectedEpisode === episode.id
                  ? "border-primary bg-primary/10 text-primary ring-2 ring-primary"
                  : "border-border bg-layer-2 hover:border-primary/50 hover:bg-layer-hover"
              )}
              onClick={() => setSelectedEpisode(episode.id)}
            >
              <div className="text-left">
                <p className="text-sm font-medium">{episode.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {formatDuration(episode.duration)}
                  {episode.status !== "completed" && (
                    <span className="ml-2 text-yellow-600">• {episode.status}</span>
                  )}
                </p>
              </div>
            </button>
          ))}
        </div>
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
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Telemetry Data
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              <TelemetryChart
                title="Shoulder & Elbow"
                data={mockTelemetryData}
                lines={[
                  { dataKey: "shoulder_pan_action", color: "#3b82f6", name: "shoulder_pan" },
                  { dataKey: "shoulder_lift_action", color: "#10b981", name: "shoulder_lift" },
                  { dataKey: "elbow_flex_action", color: "#f59e0b", name: "elbow_flex" },
                ]}
                currentData={currentData}
                yDomain={[-80, 80]}
              />

              <TelemetryChart
                title="Wrist & Gripper"
                data={mockTelemetryData}
                lines={[
                  { dataKey: "wrist_flex_action", color: "#ef4444", name: "wrist_flex" },
                  { dataKey: "wrist_roll_action", color: "#8b5cf6", name: "wrist_roll" },
                  { dataKey: "gripper_action", color: "#ec4899", name: "gripper" },
                ]}
                currentData={currentData}
                yDomain={[-40, 100]}
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
