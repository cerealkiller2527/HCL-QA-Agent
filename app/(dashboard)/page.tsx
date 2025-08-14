"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Database, Bot, Play, BarChart3, Plus, Activity, Clock, Zap } from "lucide-react"
import Link from "next/link"
import { ANIMATION_VARIANTS, ANIMATION_DURATION, ANIMATION_EASING } from "@/lib/constants/animations"
import { createStaggerAnimation, createHoverAnimation } from "@/lib/utils/animations"

const MotionCard = motion(Card)
const MotionButton = motion(Button)

export default function DashboardPage() {
  const containerVariants = createStaggerAnimation(0.1, ANIMATION_DURATION.medium)

  const cardHover = createHoverAnimation("lift")
  const buttonHover = createHoverAnimation("scale")

  return (
    <motion.div
      className="p-6 space-y-6 max-w-7xl mx-auto"
      variants={containerVariants}
      initial="initial"
      animate="animate"
    >
      <motion.div className="space-y-2" variants={ANIMATION_VARIANTS.slideInFromBottom}>
        <h1 className="text-display">
          Welcome to <span className="text-primary">LeRobot</span>
        </h1>
        <p className="text-muted-foreground text-lg font-body">
          Build and scale robotic agents with our AI-powered platform
        </p>
      </motion.div>

      <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" variants={containerVariants}>
        {[
          { href: "/datasets", icon: Database, title: "Datasets", desc: "Training data", value: "847", action: "New" },
          { href: "/robots", icon: Bot, title: "Robots", desc: "Connected agents", value: "12", status: "Online" },
          {
            href: "/missions",
            icon: Play,
            title: "Missions",
            desc: "Active operations",
            value: "23",
            status: "Running",
          },
          {
            href: "/analytics",
            icon: BarChart3,
            title: "Analytics",
            desc: "Performance metrics",
            value: "99.9%",
            status: "Uptime",
          },
        ].map((item, index) => (
          <motion.div key={index} variants={ANIMATION_VARIANTS.staggerItem}>
            <Link href={item.href}>
              <MotionCard
                className="layer-interactive cursor-pointer"
                whileHover={cardHover}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: ANIMATION_DURATION.fast, ease: ANIMATION_EASING.easeOut }}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <motion.div
                      className="p-2 rounded-lg bg-primary/10"
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: ANIMATION_DURATION.fast }}
                    >
                      <item.icon className="h-5 w-5 text-primary" />
                    </motion.div>
                    <div>
                      <CardTitle className="text-subtitle">{item.title}</CardTitle>
                      <CardDescription className="text-caption">{item.desc}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <motion.div
                      className="text-2xl font-mono-medium"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: index * 0.1 + 0.3, duration: ANIMATION_DURATION.medium }}
                    >
                      {item.value}
                    </motion.div>
                    {item.action ? (
                      <Button size="sm" variant="outline" className="h-7 text-code bg-transparent">
                        <Plus className="h-3 w-3 mr-1" />
                        {item.action}
                      </Button>
                    ) : (
                      <div className="text-code text-primary bg-primary/10 px-2 py-1 rounded">{item.status}</div>
                    )}
                  </div>
                </CardContent>
              </MotionCard>
            </Link>
          </motion.div>
        ))}
      </motion.div>

      <motion.div className="grid grid-cols-1 lg:grid-cols-2 gap-6" variants={containerVariants}>
        <motion.div variants={ANIMATION_VARIANTS.staggerItem}>
          <MotionCard className="layer-card" whileHover={cardHover} transition={{ duration: ANIMATION_DURATION.fast }}>
            <CardHeader className="pb-4">
              <CardTitle className="text-subtitle flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                System Status
              </CardTitle>
              <CardDescription className="text-caption">Platform health and performance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { label: "Platform Status", value: "Operational", color: "text-primary" },
                { label: "Active Robots", value: "12/15", color: "text-primary" },
                { label: "Running Missions", value: "23", color: "text-primary" },
                { label: "Data Storage", value: "2.4TB used", color: "text-muted-foreground" },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg bg-layer-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 + 0.5, duration: ANIMATION_DURATION.medium }}
                  whileHover={{ x: 4 }}
                >
                  <span className="text-label">{item.label}</span>
                  <span className={`font-mono-medium text-sm ${item.color}`}>{item.value}</span>
                </motion.div>
              ))}
            </CardContent>
          </MotionCard>
        </motion.div>

        <motion.div variants={ANIMATION_VARIANTS.staggerItem}>
          <MotionCard className="layer-card" whileHover={cardHover} transition={{ duration: ANIMATION_DURATION.fast }}>
            <CardHeader className="pb-4">
              <CardTitle className="text-subtitle flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Recent Activity
              </CardTitle>
              <CardDescription className="text-caption">Latest updates from your robotic agents</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { message: "New dataset 'kitchen_tasks_v2' uploaded", time: "2 minutes ago" },
                  { message: "Robot ARM-001 completed mission successfully", time: "5 minutes ago" },
                  { message: "Mission 'object_sorting' started", time: "12 minutes ago" },
                  { message: "System backup completed", time: "1 hour ago" },
                ].map((activity, index) => (
                  <motion.div
                    key={index}
                    className="flex items-center gap-3 p-3 rounded-lg bg-layer-2"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 + 0.6, duration: ANIMATION_DURATION.medium }}
                    whileHover={{ scale: 1.02, x: 4 }}
                  >
                    <motion.div
                      className="w-2 h-2 rounded-full bg-primary"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, delay: index * 0.5 }}
                    />
                    <div className="flex-1">
                      <p className="text-label">{activity.message}</p>
                      <p className="text-caption">{activity.time}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </MotionCard>
        </motion.div>
      </motion.div>

      <motion.div variants={ANIMATION_VARIANTS.staggerItem}>
        <MotionCard className="layer-card" whileHover={cardHover} transition={{ duration: ANIMATION_DURATION.fast }}>
          <CardHeader className="pb-4">
            <CardTitle className="text-subtitle flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Quick Start
            </CardTitle>
            <CardDescription className="font-body">Get started with common tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-4" variants={containerVariants}>
              {[
                {
                  href: "/datasets/recorder",
                  icon: Database,
                  title: "Record Dataset",
                  desc: "Start recording new training data",
                },
                { href: "/robots", icon: Bot, title: "Connect Robot", desc: "Add a new robot to your fleet" },
                { href: "/missions", icon: Play, title: "Create Mission", desc: "Start a new robotic mission" },
              ].map((item, index) => (
                <motion.div key={index} variants={ANIMATION_VARIANTS.staggerItem}>
                  <Link href={item.href}>
                    <MotionButton
                      variant="outline"
                      className="w-full h-auto p-4 flex flex-col items-center gap-3 layer-interactive bg-transparent"
                      whileHover={buttonHover}
                      whileTap={{ scale: 0.95 }}
                      transition={{ duration: ANIMATION_DURATION.fast }}
                    >
                      <motion.div
                        className="p-2 rounded-lg bg-primary/10"
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ duration: ANIMATION_DURATION.fast }}
                      >
                        <item.icon className="h-5 w-5 text-primary" />
                      </motion.div>
                      <div className="text-center">
                        <p className="text-label">{item.title}</p>
                        <p className="text-caption">{item.desc}</p>
                      </div>
                    </MotionButton>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </CardContent>
        </MotionCard>
      </motion.div>
    </motion.div>
  )
}
