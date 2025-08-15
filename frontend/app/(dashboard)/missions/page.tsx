"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Play, Pause, Square, Clock, Target, Plus, Eye } from "lucide-react"
import { mockMissions } from "@/lib/data/mock-datasets"
import { ANIMATION } from "@/lib/constants"
import { createStaggerAnimation } from "@/lib/utils/animations"

const MotionCard = motion(Card)

const statusConfig = {
  running: { color: "bg-primary", label: "Running", icon: Play },
  pending: { color: "bg-secondary", label: "Pending", icon: Clock },
  completed: { color: "bg-primary", label: "Completed", icon: Target },
  failed: { color: "bg-destructive", label: "Failed", icon: Square },
  cancelled: { color: "bg-muted-foreground", label: "Cancelled", icon: Square },
}

const priorityConfig = {
  high: { color: "bg-destructive/10 text-destructive" },
  medium: { color: "bg-secondary/10 text-secondary-foreground" },
  low: { color: "bg-primary/10 text-primary" },
  critical: { color: "bg-destructive text-destructive-foreground" },
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  if (hours > 0) return `${hours}h ${minutes}m`
  return `${minutes}m`
}

function getElapsedTime(startTime: Date): string {
  const now = new Date()
  const elapsed = Math.floor((now.getTime() - startTime.getTime()) / (1000 * 60))
  return formatDuration(elapsed * 60)
}

export default function MissionsPage() {
  const runningMissions = mockMissions.filter((m) => m.status === "running").length
  const completedMissions = mockMissions.filter((m) => m.status === "completed").length
  const pendingMissions = mockMissions.filter((m) => m.status === "pending").length
  const successRate = Math.round((completedMissions / mockMissions.length) * 100)

  const containerVariants = createStaggerAnimation(0.1)

  return (
    <motion.div className="p-6 space-y-6" variants={containerVariants} initial="initial" animate="animate">
      <motion.div className="flex items-center justify-between" variants={ANIMATION.variants.staggerItem}>
        <div>
          <h1 className="text-3xl font-semibold font-sans">Mission Control</h1>
          <p className="text-muted-foreground font-sans">Monitor and manage robotic missions</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90">
          <Plus className="h-4 w-4 mr-2" />
          New Mission
        </Button>
      </motion.div>

      {/* Stats Cards */}
      <motion.div className="grid grid-cols-1 md:grid-cols-4 gap-4" variants={containerVariants}>
        <motion.div variants={ANIMATION.variants.staggerItem}>
          <MotionCard
            className="layer-card"
            whileHover={{ y: -2, scale: 1.01 }}
            transition={{ duration: ANIMATION.duration.fast }}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Play className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-2xl font-mono font-medium">{runningMissions}</p>
                  <p className="text-sm text-muted-foreground font-sans">Active</p>
                </div>
              </div>
            </CardContent>
          </MotionCard>
        </motion.div>
        <motion.div variants={ANIMATION.variants.staggerItem}>
          <MotionCard
            className="layer-card"
            whileHover={{ y: -2, scale: 1.01 }}
            transition={{ duration: ANIMATION.duration.fast }}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Target className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-2xl font-mono font-medium">{completedMissions}</p>
                  <p className="text-sm text-muted-foreground font-sans">Completed</p>
                </div>
              </div>
            </CardContent>
          </MotionCard>
        </motion.div>
        <motion.div variants={ANIMATION.variants.staggerItem}>
          <MotionCard
            className="layer-card"
            whileHover={{ y: -2, scale: 1.01 }}
            transition={{ duration: ANIMATION.duration.fast }}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-secondary" />
                <div>
                  <p className="text-2xl font-mono font-medium">{pendingMissions}</p>
                  <p className="text-sm text-muted-foreground font-sans">Pending</p>
                </div>
              </div>
            </CardContent>
          </MotionCard>
        </motion.div>
        <motion.div variants={ANIMATION.variants.staggerItem}>
          <MotionCard
            className="layer-card"
            whileHover={{ y: -2, scale: 1.01 }}
            transition={{ duration: ANIMATION.duration.fast }}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Target className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-2xl font-mono font-medium">{successRate}%</p>
                  <p className="text-sm text-muted-foreground font-sans">Success Rate</p>
                </div>
              </div>
            </CardContent>
          </MotionCard>
        </motion.div>
      </motion.div>

      {/* Mission List */}
      <motion.div className="space-y-4" variants={containerVariants}>
        {mockMissions.map((mission) => {
          const StatusIcon = statusConfig[mission.status as keyof typeof statusConfig].icon
          return (
            <motion.div key={mission.id} variants={ANIMATION.variants.staggerItem}>
              <MotionCard
                className="layer-interactive group"
                whileHover={{ y: -4, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: ANIMATION.duration.fast }}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-3">
                        <CardTitle className="text-lg font-semibold font-sans group-hover:text-primary transition-colors">
                          {mission.name}
                        </CardTitle>
                        <Badge
                          className={`text-xs font-mono ${priorityConfig[mission.priority as keyof typeof priorityConfig].color}`}
                        >
                          {mission.priority} priority
                        </Badge>
                      </div>
                      <CardDescription className="font-sans">{mission.description}</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-2 h-2 rounded-full ${statusConfig[mission.status as keyof typeof statusConfig].color}`}
                      />
                      <StatusIcon className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Progress */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground font-sans">Progress</span>
                      <span className="font-mono">{mission.progress}%</span>
                    </div>
                    <div className="w-full bg-layer-2 rounded-full h-2">
                      <div
                        className="h-2 bg-primary rounded-full transition-all"
                        style={{ width: `${mission.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Details */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground font-sans">Robot</p>
                      <p className="font-sans font-medium">{mission.robotId}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground font-sans">Elapsed</p>
                      <p className="font-mono">{mission.startedAt ? getElapsedTime(mission.startedAt) : "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground font-sans">Duration</p>
                      <p className="font-mono">{formatDuration(mission.estimatedDuration)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground font-sans">Status</p>
                      <Badge
                        variant={
                          mission.status === "running"
                            ? "default"
                            : mission.status === "completed"
                              ? "secondary"
                              : "outline"
                        }
                        className="text-xs font-mono"
                      >
                        {statusConfig[mission.status as keyof typeof statusConfig].label}
                      </Badge>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button size="sm" variant="outline" className="bg-transparent text-xs font-mono">
                      <Eye className="h-4 w-4 mr-1" />
                      View Details
                    </Button>
                    {mission.status === "running" && (
                      <Button size="sm" variant="outline" className="bg-transparent">
                        <Pause className="h-4 w-4 mr-1" />
                        Pause
                      </Button>
                    )}
                    {mission.status === "pending" && (
                      <Button size="sm" variant="outline" className="bg-transparent">
                        <Play className="h-4 w-4 mr-1" />
                        Start
                      </Button>
                    )}
                    <Button size="sm" variant="outline" className="bg-transparent">
                      <Square className="h-4 w-4 mr-1" />
                      Stop
                    </Button>
                  </div>
                </CardContent>
              </MotionCard>
            </motion.div>
          )
        })}
      </motion.div>
    </motion.div>
  )
}
