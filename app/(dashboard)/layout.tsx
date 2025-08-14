"use client"

import type React from "react"
import { useState } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { ChevronLeft, Database, Bot, Play, BarChart3, Settings, Home, Zap } from "lucide-react"
import { cn } from "@/lib/utils"

const navigation = [
  { name: "Dashboard", href: "/", icon: Home, color: "text-lerobot-primary" },
  { name: "Datasets", href: "/datasets", icon: Database, color: "text-lerobot-primary" },
  { name: "Robots", href: "/robots", icon: Bot, color: "text-lerobot-primary" },
  { name: "Missions", href: "/missions", icon: Play, color: "text-lerobot-primary" },
  { name: "Analytics", href: "/analytics", icon: BarChart3, color: "text-lerobot-primary" },
  { name: "Settings", href: "/settings", icon: Settings, color: "text-muted-foreground" },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const pathname = usePathname()

  const isActiveRoute = (href: string) => {
    if (href === "/") {
      return pathname === "/"
    }
    if (href === "/datasets") {
      return pathname === "/datasets" || pathname.startsWith("/datasets/")
    }
    return pathname === href || pathname.startsWith(href + "/")
  }

  const getPageTitle = () => {
    const activeItem = navigation.find((item) => isActiveRoute(item.href))
    return activeItem?.name || "Dashboard"
  }

  return (
    <div className="flex h-screen bg-layer-0">
      {/* Sidebar */}
      <motion.div
        animate={{ width: sidebarCollapsed ? 64 : 256 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="bg-layer-1 border-r border-border flex flex-col layer-depth"
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-border bg-layer-2">
          <div className="flex items-center justify-between">
            <AnimatePresence mode="wait">
              {!sidebarCollapsed && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-1"
                >
                  <div className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-lerobot-primary" />
                    <h1 className="font-heading text-lg font-semibold text-lerobot-primary">LeRobot</h1>
                  </div>
                  <p className="text-xs text-muted-foreground font-mono-label">AI Robotics Platform</p>
                </motion.div>
              )}
            </AnimatePresence>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
            >
              <motion.div animate={{ rotate: sidebarCollapsed ? 180 : 0 }} transition={{ duration: 0.3 }}>
                <ChevronLeft className="h-4 w-4" />
              </motion.div>
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1">
          {navigation.map((item, index) => {
            const isActive = isActiveRoute(item.href)
            return (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link href={item.href}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    className={cn(
                      "w-full justify-start gap-3 h-10 text-left transition-all duration-200",
                      isActive
                        ? "bg-lerobot-primary hover:bg-lerobot-primary/90 text-white glow-primary"
                        : "hover:bg-layer-2 text-muted-foreground hover:text-foreground",
                      sidebarCollapsed && "justify-center px-2",
                    )}
                  >
                    <item.icon className={cn("h-4 w-4 flex-shrink-0", isActive ? "text-white" : item.color)} />
                    <AnimatePresence>
                      {!sidebarCollapsed && (
                        <motion.span
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: "auto" }}
                          exit={{ opacity: 0, width: 0 }}
                          transition={{ duration: 0.2 }}
                          className="font-medium text-sm font-mono-label"
                        >
                          {item.name}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </Button>
                </Link>
              </motion.div>
            )
          })}
        </nav>

        {/* Status Panel */}
        <AnimatePresence>
          {!sidebarCollapsed && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="p-3 border-t border-border"
            >
              <div className="bg-layer-2 rounded-lg p-3 space-y-2 layer-depth">
                <div className="flex items-center gap-2">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                    className="w-2 h-2 bg-lerobot-primary rounded-full"
                  />
                  <span className="text-xs font-medium font-mono-label">System Online</span>
                </div>
                <div className="text-xs text-muted-foreground space-y-1 font-mono-data">
                  <div className="flex justify-between">
                    <span>Robots:</span>
                    <span className="text-lerobot-primary font-medium">12</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Datasets:</span>
                    <span className="text-lerobot-primary font-medium">847</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <motion.header
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="h-16 border-b border-border bg-layer-1/80 backdrop-blur-sm layer-depth"
        >
          <div className="flex items-center justify-between h-full px-6">
            <motion.h2
              key={getPageTitle()}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
              className="font-heading text-xl font-semibold"
            >
              {getPageTitle()}
            </motion.h2>
            <div className="flex items-center gap-3">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-xs text-muted-foreground font-mono-data"
              >
                {new Date().toLocaleTimeString()}
              </motion.div>
              <ThemeToggle />
            </div>
          </div>
        </motion.header>

        {/* Content */}
        <main className="flex-1 overflow-auto bg-layer-0">
          <AnimatePresence mode="sync">
            <motion.div
              key={pathname}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="h-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}
