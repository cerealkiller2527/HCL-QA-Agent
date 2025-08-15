"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { ANIMATION } from "@/lib/constants"
import { createStaggerAnimation } from "@/lib/utils/animations"

export default function RobotControlPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [isConnected, setIsConnected] = useState(true)
  const [isRecording, setIsRecording] = useState(false)
  const [controlMode, setControlMode] = useState<"manual" | "autonomous">("manual")

  const containerVariants = createStaggerAnimation(0.1, ANIMATION.duration.medium)

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
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant={isRecording ? "destructive" : "outline"}
                    onClick={() => setIsRecording(!isRecording)}
                    className="gap-1"
                  >
                    {isRecording ? <Square className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                    {isRecording ? "Stop" : "Record"}
                  </Button>
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

          {/* Secondary Camera Feeds */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {["Wrist Camera", "Overview Camera"].map((cameraName, index) => (
              <Card key={cameraName} className="layer-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-label">{cameraName}</CardTitle>
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
