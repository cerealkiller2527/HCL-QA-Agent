"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
  Trash2,
  Settings,
  Circle,
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

  const handleStageSetupClose = (open: boolean) => {
    if (!open) {
      setRecordingName("")
      setRecordingDescription("")
      setRecordingTags("")
      setPredefinedStages([])
      setRecordingType("single")
    }
    setShowStageSetup(open)
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <motion.div
      className="min-h-screen bg-background p-6"
      variants={containerVariants}
      initial="initial"
      animate="animate"
    >
      <div className="max-w-7xl mx-auto space-y-6">
        <motion.div
          className="flex items-center justify-between bg-layer-1 rounded-xl p-6 border border-border"
          variants={ANIMATION.variants.staggerItem}
        >
          <div className="flex items-center gap-6">
            <Button variant="outline" size="sm" onClick={() => router.push("/robots")} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Robots
            </Button>
            <div className="border-l border-border pl-6">
              <h1 className="text-display font-sans text-primary">{robot.name}</h1>
              <p className="text-body text-muted-foreground">Remote Control Interface</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Badge variant={isConnected ? "default" : "destructive"} className="gap-2 px-3 py-1">
              <Wifi className="h-4 w-4" />
              {isConnected ? "Connected" : "Disconnected"}
            </Badge>
            <Badge variant="outline" className="gap-2 px-3 py-1">
              <Battery className="h-4 w-4" />
              {robot.batteryLevel}%
            </Badge>
            {isRecording && (
              <Badge variant="destructive" className="gap-2 px-3 py-1 animate-pulse">
                <Circle className="h-3 w-3 fill-current" />
                Recording {formatDuration(recordingDuration)}
              </Badge>
            )}
          </div>
        </motion.div>

        <motion.div
          className="flex items-center justify-between bg-layer-1 rounded-xl p-4 border border-border"
          variants={ANIMATION.variants.staggerItem}
        >
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={prevEpisode} disabled={currentEpisode <= 1}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="bg-primary/10 border border-primary/20 rounded-lg px-4 py-2">
                <span className="text-title text-primary">Episode {currentEpisode}</span>
              </div>
              <Button size="sm" variant="outline" onClick={nextEpisode}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-body text-muted-foreground">
              {recordingType === "single"
                ? "Single dataset mode"
                : `${predefinedStages.length} stage${predefinedStages.length !== 1 ? "s" : ""} configured`}
            </div>
            {!isRecording ? (
              <Button variant="default" onClick={() => setShowStageSetup(true)} className="gap-2">
                <Database className="h-4 w-4" />
                Start Recording
              </Button>
            ) : (
              <Button variant="destructive" onClick={stopRecording} className="gap-2">
                <Square className="h-4 w-4" />
                Stop Recording
              </Button>
            )}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          <motion.div className="xl:col-span-3 space-y-6" variants={ANIMATION.variants.staggerItem}>
            <Card className="layer-card">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-title flex items-center gap-2">
                    <Camera className="h-5 w-5" />
                    Camera Feeds
                  </CardTitle>
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
                    <Badge variant="outline" className="ml-2">
                      {activeCameras.length} active
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  {cameraLayout === "single" ? (
                    <div className="h-full space-y-4">
                      <div className="flex-1 bg-layer-2 rounded-lg flex items-center justify-center border-2 border-dashed border-border relative h-64">
                        <div className="text-center space-y-3">
                          <Camera className="h-20 w-20 mx-auto text-muted-foreground" />
                          <div>
                            <p className="text-title text-foreground">{activeCameras[selectedCamera]?.name}</p>
                            <Badge variant="outline" className="mt-2">
                              {activeCameras[selectedCamera]?.resolution} @ {activeCameras[selectedCamera]?.fps}fps
                            </Badge>
                          </div>
                        </div>
                        {isRecording && (
                          <div className="absolute top-4 right-4">
                            <div className="w-4 h-4 bg-destructive rounded-full animate-pulse" />
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {activeCameras.map((camera, index) => (
                          <Button
                            key={camera.id}
                            size="sm"
                            variant={selectedCamera === index ? "default" : "outline"}
                            onClick={() => setSelectedCamera(index)}
                          >
                            {camera.name}
                          </Button>
                        ))}
                      </div>
                    </div>
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
                        <div
                          key={camera.id}
                          className="bg-layer-2 rounded-lg border-2 border-dashed border-border flex items-center justify-center relative"
                        >
                          <div className="text-center space-y-2">
                            <Camera className="h-12 w-12 mx-auto text-muted-foreground" />
                            <p className="text-body text-foreground">{camera.name}</p>
                            <Badge variant="outline" className="text-xs">
                              {camera.resolution}
                            </Badge>
                          </div>
                          {isRecording && (
                            <div className="absolute top-3 right-3">
                              <div className="w-3 h-3 bg-destructive rounded-full animate-pulse" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {isRecording && recordingType === "staged" && predefinedStages.length > 0 && (
              <Card className="layer-card border-primary/30 bg-primary/5">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-title flex items-center gap-2">
                      <Activity className="h-5 w-5 text-primary" />
                      Recording Stages
                    </h3>
                    <Badge variant="default" className="bg-primary">
                      Stage {currentStage + 1} of {predefinedStages.length}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {predefinedStages.map((stage, index) => (
                      <Button
                        key={stage.id}
                        variant={currentStage === index ? "default" : "outline"}
                        onClick={() => switchToStage(index)}
                        className="h-auto p-4 flex flex-col items-start gap-2"
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="font-medium">{stage.name}</span>
                          {currentStage === index && <Circle className="w-3 h-3 fill-current animate-pulse" />}
                        </div>
                        <span className="text-xs text-muted-foreground">{formatDuration(stage.duration)}</span>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <Dialog open={showStageSetup} onOpenChange={handleStageSetupClose}>
              <DialogContent className="sm:max-w-4xl bg-layer-1 border-border">
                <DialogHeader className="pb-6">
                  <DialogTitle className="text-display flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Database className="h-6 w-6 text-primary" />
                    </div>
                    Recording Setup
                  </DialogTitle>
                  <DialogDescription className="text-body text-muted-foreground">
                    Configure your recording session for Episode {currentEpisode}. Choose between single dataset or
                    staged collection recording.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-8">
                  <div className="space-y-4">
                    <h3 className="text-title text-foreground border-b border-border pb-2">Session Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="recording-name" className="text-body-medium">
                          Session Name *
                        </Label>
                        <Input
                          id="recording-name"
                          placeholder="e.g., Pick and Place Training"
                          value={recordingName}
                          onChange={(e) => setRecordingName(e.target.value)}
                          className="bg-layer-2 border-border focus:border-primary h-11"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="recording-tags" className="text-body-medium">
                          Tags
                        </Label>
                        <Input
                          id="recording-tags"
                          placeholder="manipulation, training, demo"
                          value={recordingTags}
                          onChange={(e) => setRecordingTags(e.target.value)}
                          className="bg-layer-2 border-border focus:border-primary h-11"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="recording-description" className="text-body-medium">
                        Description
                      </Label>
                      <Textarea
                        id="recording-description"
                        placeholder="Describe this recording session..."
                        value={recordingDescription}
                        onChange={(e) => setRecordingDescription(e.target.value)}
                        className="bg-layer-2 border-border focus:border-primary resize-none"
                        rows={3}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-title text-foreground border-b border-border pb-2">Recording Type</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card
                        className={`cursor-pointer transition-all ${
                          recordingType === "single"
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                        onClick={() => setRecordingType("single")}
                      >
                        <CardContent className="p-6">
                          <div className="flex items-start gap-3">
                            <div
                              className={`w-4 h-4 rounded-full border-2 mt-1 ${
                                recordingType === "single" ? "border-primary bg-primary" : "border-border"
                              }`}
                            >
                              {recordingType === "single" && <div className="w-2 h-2 bg-white rounded-full m-0.5" />}
                            </div>
                            <div>
                              <h4 className="text-subtitle font-medium">Single Dataset</h4>
                              <p className="text-body text-muted-foreground mt-1">
                                Record one continuous dataset for the entire session
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card
                        className={`cursor-pointer transition-all ${
                          recordingType === "staged"
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                        onClick={() => setRecordingType("staged")}
                      >
                        <CardContent className="p-6">
                          <div className="flex items-start gap-3">
                            <div
                              className={`w-4 h-4 rounded-full border-2 mt-1 ${
                                recordingType === "staged" ? "border-primary bg-primary" : "border-border"
                              }`}
                            >
                              {recordingType === "staged" && <div className="w-2 h-2 bg-white rounded-full m-0.5" />}
                            </div>
                            <div>
                              <h4 className="text-subtitle font-medium">Staged Collection</h4>
                              <p className="text-body text-muted-foreground mt-1">
                                Create multiple datasets within one recording session
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>

                  {recordingType === "staged" && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between border-b border-border pb-2">
                        <h3 className="text-title text-foreground">Stages Configuration</h3>
                        <Button variant="outline" onClick={addStageToSetup} className="gap-2 bg-transparent">
                          <Plus className="h-4 w-4" />
                          Add Stage
                        </Button>
                      </div>

                      {predefinedStages.length === 0 ? (
                        <div className="text-center py-12 bg-layer-2 rounded-xl border-2 border-dashed border-border">
                          <Settings className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                          <h4 className="text-subtitle text-foreground mb-2">No stages configured</h4>
                          <p className="text-body text-muted-foreground mb-4">
                            Add stages to create multiple datasets within your recording session
                          </p>
                          <Button variant="outline" onClick={addStageToSetup} className="gap-2 bg-transparent">
                            <Plus className="h-4 w-4" />
                            Add Your First Stage
                          </Button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                          {predefinedStages.map((stage, index) => (
                            <Card key={stage.id} className="layer-card">
                              <CardContent className="p-4 space-y-4">
                                <div className="flex items-center justify-between">
                                  <Badge variant="outline" className="text-xs font-medium">
                                    Stage {index + 1}
                                  </Badge>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => removeStageFromSetup(stage.id)}
                                    className="h-8 w-8 p-0 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>

                                <div className="space-y-3">
                                  <Input
                                    placeholder="Stage name"
                                    value={stage.name}
                                    onChange={(e) => updateStageInSetup(stage.id, { name: e.target.value })}
                                    className="bg-layer-1 border-border text-sm h-9"
                                  />
                                  <Input
                                    placeholder="Task type"
                                    value={stage.taskType}
                                    onChange={(e) => updateStageInSetup(stage.id, { taskType: e.target.value })}
                                    className="bg-layer-1 border-border text-sm h-9"
                                  />
                                  <Input
                                    placeholder="Tags (comma separated)"
                                    value={stage.tags}
                                    onChange={(e) => updateStageInSetup(stage.id, { tags: e.target.value })}
                                    className="bg-layer-1 border-border text-sm h-9"
                                  />
                                  <Textarea
                                    placeholder="Stage description..."
                                    value={stage.description}
                                    onChange={(e) => updateStageInSetup(stage.id, { description: e.target.value })}
                                    rows={2}
                                    className="bg-layer-1 border-border text-sm resize-none"
                                  />
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <DialogFooter className="pt-6 border-t border-border">
                  <Button variant="outline" onClick={() => handleStageSetupClose(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={startRecording}
                    disabled={!recordingName.trim() || (recordingType === "staged" && predefinedStages.length === 0)}
                    className="gap-2 bg-primary hover:bg-primary/90"
                  >
                    <Play className="h-4 w-4" />
                    Start Recording
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </motion.div>

          <motion.div className="xl:col-span-1 space-y-6" variants={ANIMATION.variants.staggerItem}>
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
      </div>
    </motion.div>
  )
}
