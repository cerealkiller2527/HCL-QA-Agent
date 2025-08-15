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
  Power,
  RotateCcw,
  Square,
  Battery,
  Wifi,
  AlertTriangle,
  Database,
  Maximize2,
  Grid3X3,
  Plus,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Circle,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { ANIMATION } from "@/lib/constants"
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
      duration: number
    }>
  >([])
  const [showRecordingSetup, setShowRecordingSetup] = useState(false)
  const [recordingType, setRecordingType] = useState<"single" | "staged">("single")

  const [recordingDuration, setRecordingDuration] = useState(0)
  const [recordingName, setRecordingName] = useState("")
  const [recordingDescription, setRecordingDescription] = useState("")
  const [recordingTags, setRecordingTags] = useState("")
  const [telemetryData, setTelemetryData] = useState([{ time: 0, velocity: 0, force: 0, temperature: 0 }])

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

  const addStage = () => {
    const newStage = {
      id: predefinedStages.length,
      name: `Stage ${predefinedStages.length + 1}`,
      description: "",
      tags: "",
      duration: 0,
    }
    setPredefinedStages([...predefinedStages, newStage])
  }

  const updateStage = (stageId: number, updates: Partial<(typeof predefinedStages)[0]>) => {
    setPredefinedStages((stages) => stages.map((stage) => (stage.id === stageId ? { ...stage, ...updates } : stage)))
  }

  const removeStage = (stageId: number) => {
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
    setShowRecordingSetup(false)

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
      className="min-h-screen bg-background p-6"
      variants={ANIMATION.variants.staggerItem}
      initial="initial"
      animate="animate"
    >
      <div className="max-w-7xl mx-auto space-y-6">
        <motion.div
          className="flex items-center justify-between layer-card p-4"
          variants={ANIMATION.variants.staggerItem}
        >
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={() => router.push("/robots")} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div>
              <h1 className="text-title font-sans">{robot.name}</h1>
              <p className="text-caption text-muted-foreground">Remote Control</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Badge variant={isConnected ? "default" : "destructive"} className="gap-2">
              <Wifi className="h-4 w-4" />
              {isConnected ? "Connected" : "Disconnected"}
            </Badge>
            <Badge variant="outline" className="gap-2">
              <Battery className="h-4 w-4" />
              {robot.batteryLevel}%
            </Badge>
            {isRecording && (
              <Badge variant="destructive" className="gap-2 animate-pulse">
                <Circle className="h-3 w-3 fill-current" />
                {formatDuration(recordingDuration)}
              </Badge>
            )}
          </div>
        </motion.div>

        <motion.div
          className="flex items-center justify-between layer-card p-4"
          variants={ANIMATION.variants.staggerItem}
        >
          <div className="flex items-center gap-3">
            <Button size="sm" variant="outline" onClick={prevEpisode} disabled={currentEpisode <= 1}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="bg-primary/10 border border-primary/20 rounded-lg px-3 py-1">
              <span className="text-body font-medium">Episode {currentEpisode}</span>
            </div>
            <Button size="sm" variant="outline" onClick={nextEpisode}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-3">
            {recordingType === "staged" && predefinedStages.length > 0 && (
              <Badge variant="outline">{predefinedStages.length} stages</Badge>
            )}
            {!isRecording ? (
              <Button variant="default" onClick={() => setShowRecordingSetup(true)} className="gap-2">
                <Database className="h-4 w-4" />
                Record
              </Button>
            ) : (
              <Button variant="destructive" onClick={stopRecording} className="gap-2">
                <Square className="h-4 w-4" />
                Stop
              </Button>
            )}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          <motion.div className="xl:col-span-3 space-y-6" variants={ANIMATION.variants.staggerItem}>
            <Card className="layer-card">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-subtitle flex items-center gap-2">
                    <Camera className="h-4 w-4" />
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
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  {cameraLayout === "single" ? (
                    <div className="space-y-3">
                      <div className="h-64 bg-layer-2 rounded-lg border-2 border-dashed border-border flex items-center justify-center relative">
                        <div className="text-center">
                          <Camera className="h-16 w-16 mx-auto text-muted-foreground mb-2" />
                          <p className="text-body">{activeCameras[selectedCamera]?.name}</p>
                          <Badge variant="outline" className="mt-1 text-xs">
                            {activeCameras[selectedCamera]?.resolution}
                          </Badge>
                        </div>
                        {isRecording && (
                          <div className="absolute top-3 right-3 w-3 h-3 bg-destructive rounded-full animate-pulse" />
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
                      className={`grid gap-3 h-full ${
                        activeCameras.length === 1
                          ? "grid-cols-1"
                          : activeCameras.length === 2
                            ? "grid-cols-2"
                            : activeCameras.length === 3
                              ? "grid-cols-3"
                              : "grid-cols-2"
                      }`}
                    >
                      {activeCameras.map((camera) => (
                        <div
                          key={camera.id}
                          className="bg-layer-2 rounded-lg border-2 border-dashed border-border flex items-center justify-center relative"
                        >
                          <div className="text-center">
                            <Camera className="h-10 w-10 mx-auto text-muted-foreground mb-1" />
                            <p className="text-caption">{camera.name}</p>
                          </div>
                          {isRecording && (
                            <div className="absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full animate-pulse" />
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
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-subtitle">Recording Stages</h3>
                    <Badge variant="default">
                      Stage {currentStage + 1} of {predefinedStages.length}
                    </Badge>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {predefinedStages.map((stage, index) => (
                      <Button
                        key={stage.id}
                        size="sm"
                        variant={currentStage === index ? "default" : "outline"}
                        onClick={() => switchToStage(index)}
                        className="gap-2"
                      >
                        {stage.name}
                        {currentStage === index && <Circle className="w-2 h-2 fill-current animate-pulse" />}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <Dialog open={showRecordingSetup} onOpenChange={setShowRecordingSetup}>
              <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    Recording Setup
                  </DialogTitle>
                  <DialogDescription>Configure recording for Episode {currentEpisode}</DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Name</Label>
                      <Input
                        placeholder="Recording name"
                        value={recordingName}
                        onChange={(e) => setRecordingName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Tags</Label>
                      <Input
                        placeholder="manipulation, demo"
                        value={recordingTags}
                        onChange={(e) => setRecordingTags(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      placeholder="Describe this recording..."
                      value={recordingDescription}
                      onChange={(e) => setRecordingDescription(e.target.value)}
                      rows={2}
                    />
                  </div>

                  <div className="space-y-3">
                    <Label>Recording Type</Label>
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        variant={recordingType === "single" ? "default" : "outline"}
                        onClick={() => setRecordingType("single")}
                        className="h-auto p-3 flex-col gap-1"
                      >
                        <span className="font-medium">Single Dataset</span>
                        <span className="text-xs text-muted-foreground">One continuous recording</span>
                      </Button>
                      <Button
                        variant={recordingType === "staged" ? "default" : "outline"}
                        onClick={() => setRecordingType("staged")}
                        className="h-auto p-3 flex-col gap-1"
                      >
                        <span className="font-medium">Staged Collection</span>
                        <span className="text-xs text-muted-foreground">Multiple datasets</span>
                      </Button>
                    </div>
                  </div>

                  {recordingType === "staged" && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label>Stages</Label>
                        <Button size="sm" variant="outline" onClick={addStage} className="gap-1 bg-transparent">
                          <Plus className="h-3 w-3" />
                          Add
                        </Button>
                      </div>

                      {predefinedStages.length === 0 ? (
                        <div className="text-center py-8 bg-layer-2 rounded-lg border-2 border-dashed border-border">
                          <p className="text-caption text-muted-foreground mb-2">No stages configured</p>
                          <Button size="sm" variant="outline" onClick={addStage}>
                            Add First Stage
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                          {predefinedStages.map((stage, index) => (
                            <div key={stage.id} className="flex gap-2 items-center p-2 bg-layer-2 rounded-lg">
                              <div className="flex-1 grid grid-cols-2 gap-2">
                                <Input
                                  placeholder="Stage name"
                                  value={stage.name}
                                  onChange={(e) => updateStage(stage.id, { name: e.target.value })}
                                  className="h-8 text-sm"
                                />
                                <Input
                                  placeholder="Tags"
                                  value={stage.tags}
                                  onChange={(e) => updateStage(stage.id, { tags: e.target.value })}
                                  className="h-8 text-sm"
                                />
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => removeStage(stage.id)}
                                className="h-8 w-8 p-0 text-destructive"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowRecordingSetup(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={startRecording}
                    disabled={!recordingName.trim() || (recordingType === "staged" && predefinedStages.length === 0)}
                  >
                    Start Recording
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </motion.div>

          <motion.div className="xl:col-span-1 space-y-4" variants={ANIMATION.variants.staggerItem}>
            <Card className="layer-card">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-subtitle">Control Mode</h3>
                  <Badge variant="default">Active</Badge>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    size="sm"
                    variant={controlMode === "manual" ? "default" : "outline"}
                    onClick={() => setControlMode("manual")}
                  >
                    Manual
                  </Button>
                  <Button
                    size="sm"
                    variant={controlMode === "autonomous" ? "default" : "outline"}
                    onClick={() => setControlMode("autonomous")}
                  >
                    Auto
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="layer-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-subtitle">Telemetry</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="h-16">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={telemetryData}>
                      <XAxis dataKey="time" hide />
                      <YAxis hide />
                      <Line type="monotone" dataKey="velocity" stroke="#3b82f6" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="force" stroke="#10b981" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="text-center p-2 bg-layer-2 rounded">
                    <div className="text-muted-foreground">Velocity</div>
                    <div className="font-mono">1.2 m/s</div>
                  </div>
                  <div className="text-center p-2 bg-layer-2 rounded">
                    <div className="text-muted-foreground">Force</div>
                    <div className="font-mono">2.1 N</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="layer-card border-destructive/20">
              <CardHeader className="pb-2">
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
                  Reset
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}
