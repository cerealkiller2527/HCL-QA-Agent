"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Play, Square, Pause, Camera, Activity, Zap, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { TemplateSelector } from "@/components/recording/template-selector"
import { RecordingMetrics } from "@/components/recording/recording-metrics"
import { LiveSensorMonitor } from "@/components/recording/live-sensor-monitor"
import type {
  RecordingTemplate,
  RecordingMetrics as RecordingMetricsType,
  LiveSensorReading,
} from "@/lib/types/recording"

const availableSensors = [
  { id: "rgb_cam", name: "RGB Camera", type: "camera", icon: Camera, frequency: 30 },
  { id: "depth_cam", name: "Depth Camera", type: "camera", icon: Camera, frequency: 30 },
  { id: "joint_pos", name: "Joint Positions", type: "joint_position", icon: Activity, frequency: 100 },
  { id: "force_sensor", name: "Force/Torque", type: "force", icon: Zap, frequency: 100 },
]

export default function DatasetRecorderPage() {
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [frameCount, setFrameCount] = useState(0)
  const [activeSensors, setActiveSensors] = useState<string[]>(["rgb_cam", "joint_pos"])
  const [selectedTemplate, setSelectedTemplate] = useState<RecordingTemplate | null>(null)

  const [datasetName, setDatasetName] = useState("")
  const [description, setDescription] = useState("")
  const [robotType, setRobotType] = useState("")
  const [environment, setEnvironment] = useState("")

  // Mock metrics and sensor data
  const [metrics, setMetrics] = useState<RecordingMetricsType>({
    frameRate: 29.8,
    droppedFrames: 3,
    dataRate: 12.5,
    storageUsed: 1024 * 1024 * 150, // 150 MB
    qualityScore: 92,
    sensorHealth: {
      rgb_cam: "good",
      joint_pos: "good",
      force_sensor: "warning",
    },
  })

  const [sensorReadings, setSensorReadings] = useState<LiveSensorReading[]>([])

  // Simulate live sensor data
  useEffect(() => {
    if (!isRecording || isPaused) return

    const interval = setInterval(() => {
      const newReadings: LiveSensorReading[] = activeSensors.map((sensorId) => ({
        sensorId,
        timestamp: Date.now(),
        value: Math.random() * 100,
        quality: Math.random() > 0.1 ? "good" : Math.random() > 0.5 ? "warning" : "error",
      }))

      setSensorReadings((prev) => [...prev.slice(-50), ...newReadings]) // Keep last 50 readings per sensor

      // Update metrics
      setMetrics((prev) => ({
        ...prev,
        frameRate: 29.5 + Math.random() * 1,
        droppedFrames: prev.droppedFrames + (Math.random() > 0.95 ? 1 : 0),
        dataRate: 12 + Math.random() * 2,
        storageUsed: prev.storageUsed + 1024 * 100, // Add ~100KB per update
        qualityScore: Math.max(80, Math.min(100, prev.qualityScore + (Math.random() - 0.5) * 2)),
      }))
    }, 1000)

    return () => clearInterval(interval)
  }, [isRecording, isPaused, activeSensors])

  const toggleSensor = (sensorId: string) => {
    setActiveSensors((prev) => (prev.includes(sensorId) ? prev.filter((id) => id !== sensorId) : [...prev, sensorId]))
  }

  const applyTemplate = (template: RecordingTemplate) => {
    setSelectedTemplate(template)
    setRobotType(template.robotType)
    setActiveSensors(template.sensors.filter((s) => s.enabled).map((s) => s.id))
    // Could also set other template settings here
  }

  const startRecording = () => {
    setIsRecording(true)
    setIsPaused(false)
    setRecordingTime(0)
    setFrameCount(0)
    setSensorReadings([])

    // Start recording timer
    const interval = setInterval(() => {
      setRecordingTime((prev) => prev + 1)
      setFrameCount((prev) => prev + 30) // Assuming 30 FPS
    }, 1000)
    ;(window as any).recordingInterval = interval
  }

  const pauseRecording = () => {
    setIsPaused(!isPaused)
    if (isPaused) {
      // Resume
      const interval = setInterval(() => {
        setRecordingTime((prev) => prev + 1)
        setFrameCount((prev) => prev + 30)
      }, 1000)
      ;(window as any).recordingInterval = interval
    } else {
      // Pause
      clearInterval((window as any).recordingInterval)
    }
  }

  const stopRecording = () => {
    setIsRecording(false)
    setIsPaused(false)
    clearInterval((window as any).recordingInterval)
    // Keep the data for review
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/datasets">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="font-heading text-3xl font-bold">Dataset Recorder</h1>
          <p className="text-muted-foreground">Record new robotics training data</p>
        </div>
      </div>

      <Tabs defaultValue="setup" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="setup">Setup</TabsTrigger>
          <TabsTrigger value="sensors">Sensors</TabsTrigger>
          <TabsTrigger value="monitor">Monitor</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="setup" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Dataset Configuration */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="font-heading">Dataset Configuration</CardTitle>
                  <CardDescription>Configure your new dataset recording</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="dataset-name">Dataset Name</Label>
                      <Input
                        id="dataset-name"
                        placeholder="e.g., Kitchen Tasks v3.0"
                        value={datasetName}
                        onChange={(e) => setDatasetName(e.target.value)}
                        disabled={isRecording}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="robot-type">Robot Type</Label>
                      <Select value={robotType} onValueChange={setRobotType} disabled={isRecording}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select robot type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="arm">Robotic Arm</SelectItem>
                          <SelectItem value="mobile">Mobile Robot</SelectItem>
                          <SelectItem value="humanoid">Humanoid</SelectItem>
                          <SelectItem value="custom">Custom</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe the tasks and objectives for this dataset..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      disabled={isRecording}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="environment">Recording Environment</Label>
                    <Input
                      id="environment"
                      placeholder="e.g., Kitchen Lab A, Factory Floor B"
                      value={environment}
                      onChange={(e) => setEnvironment(e.target.value)}
                      disabled={isRecording}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Live Preview */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-heading">Live Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <Camera className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground">
                        {isRecording ? "Recording in progress..." : "Camera feed will appear here"}
                      </p>
                      {isRecording && (
                        <div className="flex items-center justify-center gap-2 mt-2">
                          <div className="w-3 h-3 bg-lerobot-red rounded-full animate-pulse" />
                          <span className="text-sm font-mono">{formatTime(recordingTime)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recording Controls & Status */}
            <div className="space-y-6">
              {/* Recording Controls */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-heading">Recording Controls</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {!isRecording ? (
                    <Button
                      onClick={startRecording}
                      className="w-full bg-lerobot-red hover:bg-lerobot-red/90"
                      disabled={!datasetName || !robotType || activeSensors.length === 0}
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Start Recording
                    </Button>
                  ) : (
                    <div className="space-y-2">
                      <Button onClick={pauseRecording} variant="outline" className="w-full bg-transparent">
                        {isPaused ? <Play className="h-4 w-4 mr-2" /> : <Pause className="h-4 w-4 mr-2" />}
                        {isPaused ? "Resume" : "Pause"}
                      </Button>
                      <Button onClick={stopRecording} variant="destructive" className="w-full">
                        <Square className="h-4 w-4 mr-2" />
                        Stop Recording
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recording Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-heading">Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2">
                    {isRecording ? (
                      <>
                        <div className="w-2 h-2 bg-lerobot-red rounded-full animate-pulse" />
                        <span className="text-sm font-medium">{isPaused ? "Paused" : "Recording"}</span>
                      </>
                    ) : (
                      <>
                        <div className="w-2 h-2 bg-muted-foreground rounded-full" />
                        <span className="text-sm text-muted-foreground">Ready</span>
                      </>
                    )}
                  </div>

                  {(isRecording || recordingTime > 0) && (
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Duration:</span>
                        <span className="font-mono">{formatTime(recordingTime)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Frames:</span>
                        <span className="font-mono">{frameCount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Est. Size:</span>
                        <span className="font-mono">{Math.round(frameCount * 0.1)} MB</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="sensors" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-heading">Sensor Configuration</CardTitle>
              <CardDescription>Select and configure sensors for recording</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {availableSensors.map((sensor) => (
                  <div
                    key={sensor.id}
                    className={cn(
                      "flex items-center justify-between p-4 rounded-lg border transition-colors",
                      activeSensors.includes(sensor.id) ? "border-lerobot-blue bg-lerobot-blue/5" : "border-border",
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <sensor.icon
                        className={cn(
                          "h-5 w-5",
                          activeSensors.includes(sensor.id) ? "text-lerobot-blue" : "text-muted-foreground",
                        )}
                      />
                      <div>
                        <p className="font-medium">{sensor.name}</p>
                        <p className="text-sm text-muted-foreground">{sensor.frequency} Hz</p>
                      </div>
                    </div>
                    <Switch
                      checked={activeSensors.includes(sensor.id)}
                      onCheckedChange={() => toggleSensor(sensor.id)}
                      disabled={isRecording}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitor" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RecordingMetrics metrics={metrics} isRecording={isRecording} />
            <LiveSensorMonitor sensorReadings={sensorReadings} isRecording={isRecording} />
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <TemplateSelector
            selectedTemplate={selectedTemplate}
            onSelectTemplate={applyTemplate}
            disabled={isRecording}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
