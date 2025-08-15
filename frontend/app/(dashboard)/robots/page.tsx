"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Bot, Battery, Plus, Settings, Wifi, WifiOff, Wrench } from "lucide-react"
import { mockRobots } from "@/lib/data/mock-datasets"
import { PageHeader } from "@/components/ui/page-header"
import { MetricCard } from "@/components/ui/metric-card"
import { StatusBadge } from "@/components/ui/status-badge"
import { ANIMATION } from "@/lib/constants"
import { createStaggerAnimation } from "@/lib/utils/animations"

const MotionCard = motion(Card)

const STATUS_CONFIG = {
  online: { color: "bg-primary", label: "Online", icon: Wifi },
  offline: { color: "bg-muted-foreground", label: "Offline", icon: WifiOff },
  maintenance: { color: "bg-destructive", label: "Maintenance", icon: Wrench },
  busy: { color: "bg-secondary", label: "Busy", icon: Bot },
} as const

const robotTypeConfig = {
  arm: { label: "Robotic Arm", color: "bg-primary/10 text-primary" },
  mobile: { label: "Mobile Robot", color: "bg-primary/10 text-primary" },
  humanoid: { label: "Humanoid", color: "bg-primary/10 text-primary" },
  custom: { label: "Custom", color: "bg-muted text-muted-foreground" },
}

export default function RobotsPage() {
  const onlineRobots = mockRobots.filter((r) => r.status === "online").length
  const offlineRobots = mockRobots.filter((r) => r.status === "offline").length
  const maintenanceRobots = mockRobots.filter((r) => r.status === "maintenance").length
  const avgBattery = Math.round(mockRobots.reduce((acc, r) => acc + (r.batteryLevel || 0), 0) / mockRobots.length)

  const containerVariants = createStaggerAnimation(0.1, ANIMATION.duration.medium)

  return (
    <motion.div
      className="p-6 space-y-6 max-w-7xl mx-auto"
      variants={containerVariants}
      initial="initial"
      animate="animate"
    >
      <PageHeader
        title="Robot Fleet"
        description="Monitor and manage your robotic agents"
        action={
          <Button className="bg-primary hover:bg-primary/90">
            <Plus className="h-4 w-4 mr-2" />
            Add Robot
          </Button>
        }
      />

      <motion.div className="grid grid-cols-1 md:grid-cols-4 gap-4" variants={containerVariants}>
        <MetricCard value={onlineRobots} description="Online" statusColor="bg-primary" />
        <MetricCard value={maintenanceRobots} description="Maintenance" statusColor="bg-destructive" />
        <MetricCard value={offlineRobots} description="Offline" statusColor="bg-muted-foreground" />
        <MetricCard icon={Battery} value={`${avgBattery}%`} description="Avg Battery" />
      </motion.div>

      <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" variants={containerVariants}>
        {mockRobots.map((robot, index) => {
          const StatusIcon = STATUS_CONFIG[robot.status as keyof typeof STATUS_CONFIG].icon
          return (
            <motion.div key={robot.id} variants={ANIMATION.variants.staggerItem}>
              <MotionCard
                className="layer-interactive group"
                whileHover={{ y: -4, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: ANIMATION.duration.fast }}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-subtitle group-hover:text-primary transition-colors">
                        {robot.name}
                      </CardTitle>
                      <CardDescription className="text-code">{robot.id}</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-2 h-2 rounded-full ${STATUS_CONFIG[robot.status as keyof typeof STATUS_CONFIG].color}`}
                      />
                      <StatusIcon className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <StatusBadge
                      status={robotTypeConfig[robot.type as keyof typeof robotTypeConfig].label}
                      className={robotTypeConfig[robot.type as keyof typeof robotTypeConfig].color}
                    />
                    <StatusBadge
                      status={STATUS_CONFIG[robot.status as keyof typeof STATUS_CONFIG].label}
                      variant={
                        robot.status === "online"
                          ? "default"
                          : robot.status === "maintenance"
                            ? "destructive"
                            : "outline"
                      }
                    />
                  </div>

                  {/* Battery */}
                  {robot.batteryLevel && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-label">Battery</span>
                        <span className="text-code">{robot.batteryLevel}%</span>
                      </div>
                      <div className="w-full bg-layer-2 rounded-full h-2">
                        <motion.div
                          className={`h-2 rounded-full transition-all ${
                            robot.batteryLevel > 60
                              ? "bg-primary"
                              : robot.batteryLevel > 30
                                ? "bg-secondary"
                                : "bg-destructive"
                          }`}
                          initial={{ width: 0 }}
                          animate={{ width: `${robot.batteryLevel}%` }}
                          transition={{ delay: index * 0.1 + 0.5, duration: ANIMATION.duration.medium }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Details */}
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-label">Location:</span>
                      <span className="text-body">{robot.location}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-label">Last Seen:</span>
                      <span className="text-code">{robot.lastSeen.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-label">Current Task:</span>
                      <span className="text-right text-body">{robot.currentTask || "Idle"}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button size="sm" variant="outline" className="flex-1 bg-transparent text-code">
                      <Bot className="h-4 w-4 mr-1" />
                      Control
                    </Button>
                    <Button size="sm" variant="outline" className="bg-transparent">
                      <Settings className="h-4 w-4" />
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
