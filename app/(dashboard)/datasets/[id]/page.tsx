"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Download,
  Settings,
  Camera,
  Zap,
  Activity,
  ArrowLeft,
  Clock,
  HardDrive,
  Calendar,
} from "lucide-react"
import { mockDatasets } from "@/lib/data/mock-datasets"
import { cn } from "@/lib/utils"
import Link from "next/link"

// Mock chart data for demonstration
const mockSensorData = {
  jointPositions: [
    { time: 0, joint1: 0.1, joint2: 0.2, joint3: -0.1, joint4: 0.3, joint5: 0.0, joint6: 0.15 },
    { time: 1, joint1: 0.15, joint2: 0.25, joint3: -0.05, joint4: 0.35, joint5: 0.05, joint6: 0.2 },
    { time: 2, joint1: 0.2, joint2: 0.3, joint3: 0.0, joint4: 0.4, joint5: 0.1, joint6: 0.25 },
    { time: 3, joint1: 0.18, joint2: 0.28, joint3: 0.02, joint4: 0.38, joint5: 0.08, joint6: 0.22 },
    { time: 4, joint1: 0.12, joint2: 0.22, joint3: -0.08, joint4: 0.32, joint5: 0.02, joint6: 0.18 },
  ],
}

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

export default function DatasetViewerPage({ params }: { params: { id: string } }) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentFrame, setCurrentFrame] = useState([0])
  const [playbackSpeed, setPlaybackSpeed] = useState(1)

  const dataset = mockDatasets.find((d) => d.id === params.id)

  if (!dataset) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <h2 className="font-heading text-2xl font-bold mb-2">Dataset not found</h2>
          <p className="text-muted-foreground mb-4">The requested dataset could not be found.</p>
          <Link href="/datasets">
            <Button>Back to Datasets</Button>
          </Link>
        </div>
      </div>
    )
  }

  const currentTime = (currentFrame[0] / dataset.frameCount) * dataset.duration

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/datasets">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="font-heading text-3xl font-bold">{dataset.name}</h1>
          <p className="text-muted-foreground">{dataset.description}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button className="bg-lerobot-blue hover:bg-lerobot-blue/90">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Dataset Info */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-lerobot-blue" />
              <div>
                <p className="text-sm text-muted-foreground">Duration</p>
                <p className="font-semibold">{formatDuration(dataset.duration)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <HardDrive className="h-4 w-4 text-lerobot-green" />
              <div>
                <p className="text-sm text-muted-foreground">File Size</p>
                <p className="font-semibold">{formatFileSize(dataset.fileSize)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-lerobot-orange" />
              <div>
                <p className="text-sm text-muted-foreground">Frames</p>
                <p className="font-semibold">{dataset.frameCount.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Created</p>
                <p className="font-semibold">{dataset.createdAt.toLocaleDateString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Viewer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Video/3D Viewer */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="font-heading">Visual Data</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-video bg-muted rounded-lg flex items-center justify-center mb-4">
                <div className="text-center">
                  <Camera className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">
                    Frame {currentFrame[0] + 1} of {dataset.frameCount}
                  </p>
                  <p className="text-sm text-muted-foreground">Time: {formatDuration(Math.floor(currentTime))}</p>
                </div>
              </div>

              {/* Timeline Controls */}
              <div className="space-y-4">
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
                      size="icon"
                      onClick={() => setCurrentFrame([Math.max(0, currentFrame[0] - 100)])}
                    >
                      <SkipBack className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setIsPlaying(!isPlaying)}
                      className={cn(isPlaying && "bg-lerobot-orange text-white")}
                    >
                      {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setCurrentFrame([Math.min(dataset.frameCount - 1, currentFrame[0] + 100)])}
                    >
                      <SkipForward className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Speed:</span>
                    <select
                      value={playbackSpeed}
                      onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
                      className="text-sm bg-background border border-border rounded px-2 py-1"
                    >
                      <option value={0.25}>0.25x</option>
                      <option value={0.5}>0.5x</option>
                      <option value={1}>1x</option>
                      <option value={2}>2x</option>
                      <option value={4}>4x</option>
                    </select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sensor Data Panel */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="font-heading">Active Sensors</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {dataset.sensors.map((sensor) => (
                <div key={sensor.id} className="flex items-center justify-between p-2 rounded-lg bg-accent/30">
                  <div className="flex items-center gap-2">
                    {sensor.type === "camera" && <Camera className="h-4 w-4 text-lerobot-blue" />}
                    {sensor.type === "force" && <Zap className="h-4 w-4 text-lerobot-orange" />}
                    {sensor.type === "joint_position" && <Activity className="h-4 w-4 text-lerobot-green" />}
                    <div>
                      <p className="text-sm font-medium">{sensor.name}</p>
                      <p className="text-xs text-muted-foreground">{sensor.frequency} Hz</p>
                    </div>
                  </div>
                  <Badge variant={sensor.enabled ? "default" : "secondary"}>
                    {sensor.enabled ? "Active" : "Inactive"}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-heading">Dataset Tags</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {dataset.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-heading">Metadata</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div>
                <span className="text-muted-foreground">Environment:</span>
                <p className="font-medium">{dataset.metadata.recordingEnvironment}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Robot Model:</span>
                <p className="font-medium">{dataset.metadata.robotModel}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Quality:</span>
                <Badge className="ml-2">{dataset.metadata.recordingQuality}</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Data Analysis Tabs */}
      <Card>
        <CardHeader>
          <CardTitle className="font-heading">Data Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="joints" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="joints">Joint Positions</TabsTrigger>
              <TabsTrigger value="forces">Forces</TabsTrigger>
              <TabsTrigger value="trajectory">Trajectory</TabsTrigger>
            </TabsList>
            <TabsContent value="joints" className="mt-4">
              <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <Activity className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">Joint position data visualization</p>
                  <p className="text-sm text-muted-foreground">Frame {currentFrame[0] + 1}</p>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="forces" className="mt-4">
              <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <Zap className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">Force/torque data visualization</p>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="trajectory" className="mt-4">
              <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <Camera className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">3D trajectory visualization</p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
