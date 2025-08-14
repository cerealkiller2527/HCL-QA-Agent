"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BarChart3, TrendingUp, TrendingDown, Activity, Download, Calendar } from "lucide-react"
import { ANIMATION } from "@/lib/constants"
import { createStaggerAnimation } from "@/lib/utils/animations"

const MotionCard = motion(Card)

export default function AnalyticsPage() {
  const containerVariants = createStaggerAnimation(0.1)

  return (
    <motion.div className="p-6 space-y-6" variants={containerVariants} initial="initial" animate="animate">
      <motion.div className="flex items-center justify-between" variants={ANIMATION.variants.staggerItem}>
        <div>
          <h1 className="text-3xl font-semibold font-sans">Analytics Dashboard</h1>
          <p className="text-muted-foreground font-sans">Performance insights and system metrics</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="bg-transparent">
            <Calendar className="h-4 w-4 mr-2" />
            Last 30 Days
          </Button>
          <Button className="bg-primary hover:bg-primary/90">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </motion.div>

      {/* Key Metrics */}
      <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" variants={containerVariants}>
        <motion.div variants={ANIMATION.variants.staggerItem}>
          <MotionCard
            className="layer-card h-full"
            whileHover={{ y: -2, scale: 1.01 }}
            transition={{ duration: ANIMATION.duration.fast }}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-sans">Mission Success Rate</p>
                  <p className="text-2xl font-mono font-medium">94.2%</p>
                </div>
                <div className="flex items-center gap-1 text-green-500">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-xs font-mono">+2.1%</span>
                </div>
              </div>
            </CardContent>
          </MotionCard>
        </motion.div>

        <motion.div variants={ANIMATION.variants.staggerItem}>
          <MotionCard
            className="layer-card h-full"
            whileHover={{ y: -2, scale: 1.01 }}
            transition={{ duration: ANIMATION.duration.fast }}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-sans">Avg Mission Duration</p>
                  <p className="text-2xl font-mono font-medium">42m</p>
                </div>
                <div className="flex items-center gap-1 text-red-500">
                  <TrendingDown className="h-4 w-4" />
                  <span className="text-xs font-mono">-5.3%</span>
                </div>
              </div>
            </CardContent>
          </MotionCard>
        </motion.div>

        <motion.div variants={ANIMATION.variants.staggerItem}>
          <MotionCard
            className="layer-card h-full"
            whileHover={{ y: -2, scale: 1.01 }}
            transition={{ duration: ANIMATION.duration.fast }}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-sans">System Uptime</p>
                  <p className="text-2xl font-mono font-medium">99.9%</p>
                </div>
                <div className="flex items-center gap-1 text-green-500">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-xs font-mono">+0.1%</span>
                </div>
              </div>
            </CardContent>
          </MotionCard>
        </motion.div>

        <motion.div variants={ANIMATION.variants.staggerItem}>
          <MotionCard
            className="layer-card h-full"
            whileHover={{ y: -2, scale: 1.01 }}
            transition={{ duration: ANIMATION.duration.fast }}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-sans">Data Collected</p>
                  <p className="text-2xl font-mono font-medium">2.4TB</p>
                </div>
                <div className="flex items-center gap-1 text-green-500">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-xs font-mono">+12.5%</span>
                </div>
              </div>
            </CardContent>
          </MotionCard>
        </motion.div>
      </motion.div>

      {/* Charts */}
      <motion.div className="grid grid-cols-1 lg:grid-cols-2 gap-6" variants={containerVariants}>
        <motion.div variants={ANIMATION.variants.staggerItem}>
          <MotionCard
            className="layer-card"
            whileHover={{ y: -2, scale: 1.01 }}
            transition={{ duration: ANIMATION.duration.fast }}
          >
            <CardHeader>
              <CardTitle className="text-lg font-semibold font-sans">Mission Performance</CardTitle>
              <CardDescription className="text-sm text-muted-foreground font-sans">
                Success rate over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-layer-2 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <BarChart3 className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground font-sans">Performance chart visualization</p>
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
            <CardHeader>
              <CardTitle className="text-lg font-semibold font-sans">Robot Utilization</CardTitle>
              <CardDescription className="text-sm text-muted-foreground font-sans">
                Active time by robot type
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-layer-2 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <Activity className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground font-sans">Utilization chart visualization</p>
                </div>
              </div>
            </CardContent>
          </MotionCard>
        </motion.div>
      </motion.div>

      {/* System Health */}
      <motion.div variants={ANIMATION.variants.staggerItem}>
        <MotionCard
          className="layer-card"
          whileHover={{ y: -2, scale: 1.01 }}
          transition={{ duration: ANIMATION.duration.fast }}
        >
          <CardHeader>
            <CardTitle className="text-lg font-semibold font-sans">System Health</CardTitle>
            <CardDescription className="text-sm text-muted-foreground font-sans">
              Current status of all system components
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { component: "Database", status: "healthy", uptime: "99.9%" },
                { component: "API Gateway", status: "healthy", uptime: "99.8%" },
                { component: "Message Queue", status: "warning", uptime: "98.2%" },
                { component: "File Storage", status: "healthy", uptime: "100%" },
                { component: "Authentication", status: "healthy", uptime: "99.9%" },
                { component: "Monitoring", status: "healthy", uptime: "99.7%" },
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-layer-2">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        item.status === "healthy"
                          ? "bg-green-500"
                          : item.status === "warning"
                            ? "bg-yellow-500"
                            : "bg-red-500"
                      }`}
                    />
                    <span className="text-sm font-sans">{item.component}</span>
                  </div>
                  <div className="text-right">
                    <Badge
                      variant={item.status === "healthy" ? "default" : "secondary"}
                      className={`text-xs font-mono ${
                        item.status === "healthy"
                          ? "bg-green-500/20 text-green-500 border-green-500/30"
                          : "bg-yellow-500/20 text-yellow-500 border-yellow-500/30"
                      }`}
                    >
                      {item.status}
                    </Badge>
                    <p className="text-sm text-muted-foreground font-sans mt-1">{item.uptime}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </MotionCard>
      </motion.div>
    </motion.div>
  )
}
