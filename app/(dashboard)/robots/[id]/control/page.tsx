"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  ArrowLeft,
  Camera,
  Gamepad2,
  Power,
  RotateCcw,
  Square,
  Play,
  Battery,
  Wifi,
  AlertTriangle,
  Database,
  Maximize2,
  Grid3X3,
  Activity,
  Plus,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { ANIMATION } from "@/lib/constants"
import { createStaggerAnimation } from "@/lib/utils/animations"
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from "recharts"

export default function RobotControlPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [isConnected, setIsConnected] = useState(true)
  const [isRecording, setIsRecording] = useState(false)
  const [controlMode, setControlMode] = useState<"manual" | "autonomous">("manual")
  const [cameraLayout, setCameraLayout] = useState<"single" | "grid">("grid")
  const [selectedCamera, setSelectedCamera] = useState(0)

  const [currentEpisode, setCurrentEpisode] = useState(1)
  const [currentStage, setCurrentStage] = useState(0)
  const [predefinedStages, setPredefinedStages] = useState<
    Array<{
      id: number
      name: string
      description: string
      tags: string
      taskType: string
      duration: number
    }>
  >([])
  const [showStageSetup, setShowStageSetup] = useState(false)
  const [recordingType, setRecordingType] = useState<"single" | "staged">("single")

  const [telemetryData, setTelemetryData] = useState([
    { time: 0, velocity: 0.5, force: 2.1, temperature: 42 },
    { time: 1, velocity: 0.8, force: 2.3, temperature: 43 },
    { time: 2, velocity: 1.2, force: 1.9, temperature: 44 },
    { time: 3, velocity: 0.9, force: 2.5, temperature: 42 },
    { time: 4, velocity: 1.1, force: 2.0, temperature: 43 },
  ])

  const [recordingDuration, setRecordingDuration] = useState(0)
  const [recordingName, setRecordingName] = useState("")
  const [recordingDescription, setRecordingDescription] = useState("")
  const [recordingTags, setRecordingTags] = useState("")

  const containerVariants = createStaggerAnimation(0.1, ANIMATION.duration.medium)

  const cameras = [
    { id: 0, name: "Primary View", resolution: "1920x1080", fps: 30, active: true },
    { id: 1, name: "Wrist Cam", resolution: "1280x720", fps: 60, active: true },
    { id: 2, name: "Overview", resolution: "1920x1080", fps: 30, active: true },
    { id: 3, name: "Tool Cam", resolution: "640x480", fps: 30, active: false },
  ]

  const activeCameras = cameras.filter((cam) => cam.active)

  useEffect(() => {
    const interval = setInterval(() => {
      setTelemetryData((prev) => {
        const newData = [
          ...prev.slice(-4),
          {
            time: prev[prev.length - 1].time + 1,
            velocity: Math.random() * 2,
            force: 1.5 + Math.random() * 1.5,
            temperature: 40 + Math.random() * 8,
          },
        ]
        return newData
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingDuration((prev) => prev + 1)
        if (recordingType === "staged" && predefinedStages.length > 0) {
          setPredefinedStages((stages) =>
            stages.map((stage) => (stage.id === currentStage ? { ...stage, duration: stage.duration + 1 } : stage)),
          )
        }
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isRecording, currentStage, recordingType])

  const robot = {
    id: params.id,
    name: "Atlas-01",
    type: "Robotic Arm",
    status: "online",
    batteryLevel: 87,
    location: "Lab A",
    currentTask: "Teleoperation Active",
  }

  const TelemetryGauge = ({
    value,
    max,
    label,
    unit,
    color,
  }: {
    value: number
    max: number
    label: string
    unit: string
    color: string
  }) => {
    const percentage = (value / max) * 100
    return (
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-caption text-muted-foreground">{label}</span>
          <span className="text-code font-mono">
            {value.toFixed(1)}
            {unit}
          </span>
        </div>
        <div className="w-full bg-layer-2 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${color}`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
      </div>
    )
  }

  const addStageToSetup = () => {
    const newStage = {
      id: predefinedStages.length,
      name: `Stage ${predefinedStages.length + 1}`,
      description: "",
      tags: "",
      taskType: "manipulation",
      duration: 0,
    }
    setPredefinedStages([...predefinedStages, newStage])
  }

  const updateStageInSetup = (stageId: number, updates: Partial<(typeof predefinedStages)[0]>) => {
    setPredefinedStages((stages) => stages.map((stage) => (stage.id === stageId ? { ...stage, ...updates } : stage)))
  }

  const removeStageFromSetup = (stageId: number) => {
    setPredefinedStages((stages) => stages.filter((stage) => stage.id !== stageId))
  }

  const switchToStage = (stageId: number) => {
    if (isRecording && recordingType === "staged") {
      setCurrentStage(stageId)
    }
  }

  const nextEpisode = () => {
    setCurrentEpisode((prev) => prev + 1)
    setPredefinedStages([])
    setCurrentStage(0)
    setRecordingType("single")
  }

  const prevEpisode = () => {
    if (currentEpisode > 1) {
      setCurrentEpisode((prev) => prev - 1)
    }
  }

  const startRecording = () => {
    if (!recordingName.trim()) {
      setRecordingName(`${robot.name}_episode_${currentEpisode}_${Date.now()}`)
    }
    setIsRecording(true)
    setRecordingDuration(0)
    setShowStageSetup(false)

    if (recordingType === "staged") {
      setPredefinedStages((stages) => stages.map((stage) => ({ ...stage, duration: 0 })))
      setCurrentStage(0)
    }
  }

  const stopRecording = () => {
    setIsRecording(false)

    if (recordingType === "single") {
      console.log("[v0] Saving single dataset:", {
        episode: currentEpisode,
        datasetName: recordingName,
        description: recordingDescription,
        tags: recordingTags.split(",").map((t) => t.trim()),
        duration: recordingDuration,
        robotId: robot.id,
        type: "single_dataset",
      })
    } else {
      console.log("[v0] Saving staged datasets as collection:", {
        episode: currentEpisode,
        collectionName: recordingName,
        description: recordingDescription,
        tags: recordingTags.split(",").map((t) => t.trim()),
        totalDuration: recordingDuration,
        datasets: predefinedStages.map((stage) => ({
          datasetName: `${recordingName}_${stage.name.toLowerCase().replace(/\s+/g, "_")}`,
          description: stage.description,
          tags: stage.tags.split(",").map((t) => t.trim()),
          taskType: stage.taskType,
          duration: stage.duration,
          episode: currentEpisode,
        })),
        robotId: robot.id,
        type: "staged_collection",
      })
    }

    setRecordingDuration(0)
    setRecordingName("")
    setRecordingDescription("")
    setRecordingTags("")
    setPredefinedStages([])
    setCurrentStage(0)
    setRecordingType("single")
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <motion.div
      className="p-4 space-y-4 max-w-7xl mx-auto"
      variants={containerVariants}
      initial="initial"
      animate="animate"
    >
      <motion.div className="flex items-center justify-between" variants={ANIMATION.variants.staggerItem}>
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => router.push("/robots")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-title font-sans">{robot.name}</h1>
            <p className="text-caption text-muted-foreground">Remote Control</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant={isConnected ? "default" : "destructive"} className="gap-1">
            <Wifi className="h-3 w-3" />
            {isConnected ? "Online" : "Offline"}
          </Badge>
          <Badge variant="outline" className="gap-1">
            <Battery className="h-3 w-3" />
            {robot.batteryLevel}%
          </Badge>
          {isRecording && (
            <Badge variant="destructive" className="gap-1 animate-pulse">
              <div className="w-2 h-2 bg-white rounded-full" />
              REC {formatDuration(recordingDuration)}
            </Badge>
          )}
        </div>
      </motion.div>

      <motion.div className="flex items-center justify-between" variants={ANIMATION.variants.staggerItem}>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={prevEpisode} disabled={currentEpisode <= 1}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Badge variant="outline" className="px-3 py-1">
            Episode {currentEpisode}
          </Badge>
          <Button size="sm" variant="outline" onClick={nextEpisode}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="text-caption text-muted-foreground">
          {recordingType === "single"
            ? "Single dataset"
            : `${predefinedStages.length} stage${predefinedStages.length !== 1 ? "s" : ""} planned`}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
        <motion.div className="xl:col-span-3 space-y-4" variants={ANIMATION.variants.staggerItem}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant={cameraLayout === "single" ? "default" : "outline"}
                onClick={() => setCameraLayout("single")}
              >
                <Maximize2 className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant={cameraLayout === "grid" ? "default" : "outline"}
                onClick={() => setCameraLayout("grid")}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <span className="text-caption text-muted-foreground">{activeCameras.length} cameras active</span>
            </div>
            <div className="flex items-center gap-2">
              {!isRecording ? (
                <Button size="sm" variant="outline" onClick={() => setShowStageSetup(true)}>
                  <Database className="h-4 w-4 mr-1" />
                  Record
                </Button>
              ) : (
                <Button size="sm" variant="destructive" onClick={stopRecording}>
                  <Square className="h-4 w-4 mr-1" />
                  Stop
                </Button>
              )}
            </div>
          </div>

          <div className="h-96">
            {cameraLayout === "single" ? (
              <Card className="layer-card h-full">
                <CardContent className="p-4 h-full flex flex-col">
                  <div className="flex-1 bg-layer-2 rounded-lg flex items-center justify-center border relative">
                    <div className="text-center space-y-2">
                      <Camera className="h-16 w-16 mx-auto text-muted-foreground" />
                      <p className="text-body text-muted-foreground">{activeCameras[selectedCamera]?.name}</p>
                      <Badge variant="outline">
                        {activeCameras[selectedCamera]?.resolution} @ {activeCameras[selectedCamera]?.fps}fps
                      </Badge>
                    </div>
                    {isRecording && (
                      <div className="absolute top-4 right-4">
                        <div className="w-3 h-3 bg-destructive rounded-full animate-pulse" />
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 mt-3">
                    {activeCameras.map((camera, index) => (
                      <Button
                        key={camera.id}
                        size="sm"
                        variant={selectedCamera === index ? "default" : "outline"}
                        onClick={() => setSelectedCamera(index)}
                        className="text-xs"
                      >
                        {camera.name}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div
                className={`grid gap-4 h-full ${
                  activeCameras.length === 1
                    ? "grid-cols-1"
                    : activeCameras.length === 2
                      ? "grid-cols-1 md:grid-cols-2"
                      : activeCameras.length === 3
                        ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                        : "grid-cols-1 md:grid-cols-2"
                }`}
              >
                {activeCameras.map((camera) => (
                  <Card key={camera.id} className="layer-card">
                    <CardContent className="p-3 h-full">
                      <div className="h-full bg-layer-2 rounded border flex items-center justify-center relative">
                        <div className="text-center space-y-1">
                          <Camera className="h-8 w-8 mx-auto text-muted-foreground" />
                          <p className="text-caption text-muted-foreground">{camera.name}</p>
                        </div>
                        {isRecording && (
                          <div className="absolute top-2 right-2">
                            <div className="w-2 h-2 bg-destructive rounded-full animate-pulse" />
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {isRecording && recordingType === "staged" && predefinedStages.length > 0 && (
            <Card className="layer-card border-primary/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-subtitle">Active Stages - Episode {currentEpisode}</h3>
                  <Badge variant="outline">
                    Stage {currentStage + 1} of {predefinedStages.length}
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-2">
                  {predefinedStages.map((stage, index) => (
                    <Button
                      key={stage.id}
                      size="sm"
                      variant={currentStage === index ? "default" : "outline"}
                      onClick={() => switchToStage(index)}
                      className="gap-2"
                    >
                      {stage.name}
                      <span className="text-xs opacity-70">{formatDuration(stage.duration)}</span>
                      {currentStage === index && <div className="w-2 h-2 bg-white rounded-full animate-pulse" />}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {showStageSetup && (
            <Card className="layer-card border-primary/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-subtitle flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Setup Recording - Episode {currentEpisode}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="recording-name">Session Name</Label>
                    <Input
                      id="recording-name"
                      placeholder="Enter session name"
                      value={recordingName}
                      onChange={(e) => setRecordingName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="recording-tags">Tags</Label>
                    <Input
                      id="recording-tags"
                      placeholder="manipulation, training"
                      value={recordingTags}
                      onChange={(e) => setRecordingTags(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="recording-description">Description</Label>
                  <Textarea
                    id="recording-description"
                    placeholder="Describe this recording session..."
                    value={recordingDescription}
                    onChange={(e) => setRecordingDescription(e.target.value)}
                    rows={2}
                  />
                </div>

                <div className="space-y-3">
                  <Label>Recording Type</Label>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant={recordingType === "single" ? "default" : "outline"}
                      onClick={() => setRecordingType("single")}
                    >
                      Single Dataset
                    </Button>
                    <Button
                      size="sm"
                      variant={recordingType === "staged" ? "default" : "outline"}
                      onClick={() => setRecordingType("staged")}
                    >
                      Staged Collection
                    </Button>
                  </div>
                  <p className="text-caption text-muted-foreground">
                    {recordingType === "single"
                      ? "Record one continuous dataset"
                      : "Record multiple stages as separate datasets in a collection"}
                  </p>
                </div>

                {recordingType === "staged" && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Stages Setup</Label>
                      <Button size="sm" variant="outline" onClick={addStageToSetup}>
                        <Plus className="h-3 w-3 mr-1" />
                        Add Stage
                      </Button>
                    </div>

                    {predefinedStages.length === 0 ? (
                      <div className="text-center py-4 text-muted-foreground">
                        <p className="text-caption">No stages defined yet</p>
                        <p className="text-xs">Add stages to create a multi-dataset collection</p>
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {predefinedStages.map((stage) => (
                          <div key={stage.id} className="p-3 border rounded-lg space-y-2">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              <Input
                                placeholder="Stage name"
                                value={stage.name}
                                onChange={(e) => updateStageInSetup(stage.id, { name: e.target.value })}
                                size="sm"
                              />
                              <Input
                                placeholder="Task type"
                                value={stage.taskType}
                                onChange={(e) => updateStageInSetup(stage.id, { taskType: e.target.value })}
                                size="sm"
                              />
                            </div>
                            <Input
                              placeholder="Tags (comma separated)"
                              value={stage.tags}
                              onChange={(e) => updateStageInSetup(stage.id, { tags: e.target.value })}
                              size="sm"
                            />
                            <div className="flex gap-2">
                              <Textarea
                                placeholder="Stage description"
                                value={stage.description}
                                onChange={(e) => updateStageInSetup(stage.id, { description: e.target.value })}
                                rows={2}
                                className="text-sm flex-1"
                              />
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => removeStageFromSetup(stage.id)}
                                className="self-start"
                              >
                                Remove
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Button
                    onClick={startRecording}
                    className="gap-2"
                    disabled={recordingType === "staged" && predefinedStages.length === 0}
                  >
                    <Play className="h-4 w-4" />
                    Start Recording
                  </Button>
                  <Button variant="outline" onClick={() => setShowStageSetup(false)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>

        <motion.div className="xl:col-span-1 space-y-4 flex flex-col" variants={ANIMATION.variants.staggerItem}>
          <Card className="layer-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-subtitle">Status</h3>
                <Badge variant="default" className="gap-1">
                  <Activity className="h-3 w-3" />
                  Active
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Button
                  size="sm"
                  variant={controlMode === "manual" ? "default" : "outline"}
                  onClick={() => setControlMode("manual")}
                  className="gap-1"
                >
                  <Gamepad2 className="h-3 w-3" />
                  Manual
                </Button>
                <Button
                  size="sm"
                  variant={controlMode === "autonomous" ? "default" : "outline"}
                  onClick={() => setControlMode("autonomous")}
                  className="gap-1"
                >
                  <RotateCcw className="h-3 w-3" />
                  Auto
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="layer-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-subtitle flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Live Telemetry
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <TelemetryGauge
                value={telemetryData[telemetryData.length - 1]?.velocity || 0}
                max={2}
                label="Velocity"
                unit="m/s"
                color="bg-blue-500"
              />
              <TelemetryGauge
                value={telemetryData[telemetryData.length - 1]?.force || 0}
                max={3}
                label="Force"
                unit="N"
                color="bg-green-500"
              />
              <TelemetryGauge
                value={telemetryData[telemetryData.length - 1]?.temperature || 0}
                max={60}
                label="Temperature"
                unit="°C"
                color="bg-orange-500"
              />

              <div className="h-24 mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={telemetryData}>
                    <XAxis dataKey="time" hide />
                    <YAxis hide />
                    <Line type="monotone" dataKey="velocity" stroke="#3b82f6" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="force" stroke="#10b981" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="layer-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-subtitle">Joint Positions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {["Base", "Shoulder", "Elbow", "Wrist"].map((joint, index) => {
                const angle = Math.random() * 180 - 90
                const percentage = ((angle + 90) / 180) * 100
                return (
                  <div key={joint} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-caption">{joint}</span>
                      <span className="text-code font-mono">{angle.toFixed(1)}°</span>
                    </div>
                    <div className="w-full bg-layer-2 rounded-full h-1.5">
                      <div
                        className="h-1.5 rounded-full bg-primary transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>

          <Card className="layer-card border-destructive/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-subtitle flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                Emergency
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="destructive" className="w-full" size="sm">
                <Power className="h-4 w-4 mr-2" />
                Emergency Stop
              </Button>
              <Button variant="outline" className="w-full bg-transparent" size="sm">
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset Position
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  )
}
