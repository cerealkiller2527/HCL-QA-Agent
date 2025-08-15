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
  Settings,
  Database,
  Clock,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { ANIMATION } from "@/lib/constants"
import { createStaggerAnimation } from "@/lib/utils/animations"

export default function RobotControlPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [isConnected, setIsConnected] = useState(true)
  const [isRecording, setIsRecording] = useState(false)
  const [controlMode, setControlMode] = useState<"manual" | "autonomous">("manual")

  const [recordingDuration, setRecordingDuration] = useState(0)
  const [recordingName, setRecordingName] = useState("")
  const [recordingDescription, setRecordingDescription] = useState("")
  const [recordingTags, setRecordingTags] = useState("")
  const [showRecordingSetup, setShowRecordingSetup] = useState(false)

  const containerVariants = createStaggerAnimation(0.1, ANIMATION.duration.medium)

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingDuration((prev) => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isRecording])

  // Mock robot data - in real app, fetch based on params.id
  const robot = {
    id: params.id,
    name: "Atlas-01",
    type: "Robotic Arm",
    status: "online",
    batteryLevel: 87,
    location: "Lab A",
    currentTask: "Teleoperation Active",
  }

  const startRecording = () => {
    if (!recordingName.trim()) {
      setRecordingName(`${robot.name}_session_${Date.now()}`)
    }
    setIsRecording(true)
    setRecordingDuration(0)
    setShowRecordingSetup(false)
  }

  const stopRecording = () => {
    setIsRecording(false)
    // In real app, save the dataset here
    console.log("[v0] Saving dataset:", {
      name: recordingName,
      description: recordingDescription,
      tags: recordingTags.split(",").map((t) => t.trim()),
      duration: recordingDuration,
      robotId: robot.id,
    })

    // Reset recording state
    setRecordingDuration(0)
    setRecordingName("")
    setRecordingDescription("")
    setRecordingTags("")
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <motion.div
      className="p-6 space-y-6 max-w-7xl mx-auto min-h-screen"
      variants={containerVariants}
      initial="initial"
      animate="animate"
    >
      {/* Header */}
      <motion.div className="flex items-center justify-between" variants={ANIMATION.variants.staggerItem}>
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => router.push("/robots")} className="bg-transparent">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Fleet
          </Button>
          <div>
            <h1 className="text-display font-sans">{robot.name} Control</h1>
            <p className="text-body text-muted-foreground">Remote teleoperation interface</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant={isConnected ? "default" : "destructive"} className="gap-1">
            <Wifi className="h-3 w-3" />
            {isConnected ? "Connected" : "Disconnected"}
          </Badge>
          <Badge variant="outline" className="gap-1">
            <Battery className="h-3 w-3" />
            {robot.batteryLevel}%
          </Badge>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Camera Feeds - Takes up 3/4 of the width */}
        <motion.div className="xl:col-span-3 space-y-4" variants={ANIMATION.variants.staggerItem}>
          {/* Main Camera Feed */}
          <Card className="layer-card">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-subtitle flex items-center gap-2">
                  <Camera className="h-5 w-5" />
                  Primary Camera
                  {isRecording && (
                    <Badge variant="destructive" className="gap-1 animate-pulse">
                      <div className="w-2 h-2 bg-white rounded-full" />
                      REC {formatDuration(recordingDuration)}
                    </Badge>
                  )}
                </CardTitle>
                <div className="flex items-center gap-2">
                  {!isRecording ? (
                    <Button size="sm" variant="outline" onClick={() => setShowRecordingSetup(true)} className="gap-1">
                      <Database className="h-3 w-3" />
                      Start Recording
                    </Button>
                  ) : (
                    <Button size="sm" variant="destructive" onClick={stopRecording} className="gap-1">
                      <Square className="h-3 w-3" />
                      Stop Recording
                    </Button>
                  )}
                  <Button size="sm" variant="outline">
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="aspect-video bg-layer-2 rounded-lg flex items-center justify-center border">
                <div className="text-center space-y-2">
                  <Camera className="h-12 w-12 mx-auto text-muted-foreground" />
                  <p className="text-body text-muted-foreground">Camera feed would appear here</p>
                  <Badge variant="outline">1920x1080 @ 30fps</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {showRecordingSetup && (
            <Card className="layer-card border-primary/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-subtitle flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Dataset Recording Setup
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="recording-name">Dataset Name</Label>
                    <Input
                      id="recording-name"
                      placeholder="Enter dataset name"
                      value={recordingName}
                      onChange={(e) => setRecordingName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="recording-tags">Tags (comma-separated)</Label>
                    <Input
                      id="recording-tags"
                      placeholder="manipulation, training, demo"
                      value={recordingTags}
                      onChange={(e) => setRecordingTags(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="recording-description">Description</Label>
                  <Textarea
                    id="recording-description"
                    placeholder="Describe what this recording session will capture..."
                    value={recordingDescription}
                    onChange={(e) => setRecordingDescription(e.target.value)}
                    rows={3}
                  />
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <Button onClick={startRecording} className="gap-2">
                    <Play className="h-4 w-4" />
                    Start Recording
                  </Button>
                  <Button variant="outline" onClick={() => setShowRecordingSetup(false)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Secondary Camera Feeds */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {["Wrist Camera", "Overview Camera"].map((cameraName, index) => (
              <Card key={cameraName} className="layer-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-label flex items-center justify-between">
                    {cameraName}
                    {isRecording && <div className="w-2 h-2 bg-destructive rounded-full animate-pulse" />}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video bg-layer-2 rounded border flex items-center justify-center">
                    <Camera className="h-8 w-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* Control Panel - Takes up 1/4 of the width */}
        <motion.div className="xl:col-span-1 space-y-4" variants={ANIMATION.variants.staggerItem}>
          {isRecording && (
            <Card className="layer-card border-destructive/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-subtitle flex items-center gap-2">
                  <Database className="h-4 w-4 text-destructive" />
                  Recording Active
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-label">Duration:</span>
                  <Badge variant="destructive" className="gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDuration(recordingDuration)}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-label">Size:</span>
                  <span className="text-code">{(recordingDuration * 0.5).toFixed(1)} MB</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-label">Frames:</span>
                  <span className="text-code">{recordingDuration * 30}</span>
                </div>
                {recordingName && (
                  <div className="pt-2 border-t border-border">
                    <p className="text-xs text-muted-foreground">Saving as:</p>
                    <p className="text-code text-xs truncate">{recordingName}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Robot Status */}
          <Card className="layer-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-subtitle">Robot Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-label">Status:</span>
                <Badge variant="default">Online</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-label">Mode:</span>
                <Badge variant="outline">{controlMode}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-label">Task:</span>
                <span className="text-code text-right">{robot.currentTask}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-label">Location:</span>
                <span className="text-body">{robot.location}</span>
              </div>
            </CardContent>
          </Card>

          {/* Control Mode */}
          <Card className="layer-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-subtitle">Control Mode</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <Button
                  size="sm"
                  variant={controlMode === "manual" ? "default" : "outline"}
                  onClick={() => setControlMode("manual")}
                  className="text-xs"
                >
                  <Gamepad2 className="h-3 w-3 mr-1" />
                  Manual
                </Button>
                <Button
                  size="sm"
                  variant={controlMode === "autonomous" ? "default" : "outline"}
                  onClick={() => setControlMode("autonomous")}
                  className="text-xs"
                >
                  <RotateCcw className="h-3 w-3 mr-1" />
                  Auto
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Emergency Controls */}
          <Card className="layer-card border-destructive/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-subtitle flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                Emergency
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
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

          {/* Joint Controls */}
          <Card className="layer-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-subtitle">Joint Control</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {["Base", "Shoulder", "Elbow", "Wrist"].map((joint, index) => (
                <div key={joint} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-label">{joint}</span>
                    <span className="text-code">{(Math.random() * 180 - 90).toFixed(1)}°</span>
                  </div>
                  <div className="w-full bg-layer-2 rounded-full h-1">
                    <div
                      className="h-1 rounded-full bg-primary transition-all"
                      style={{ width: `${50 + Math.random() * 30}%` }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  )
}
