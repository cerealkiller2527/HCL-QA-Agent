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
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Datasets", href: "/datasets", icon: Database },
  { name: "Robots", href: "/robots", icon: Bot },
  { name: "Missions", href: "/missions", icon: Play },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Settings", href: "/settings", icon: Settings },
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
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="bg-sidebar-background border-r border-sidebar-border flex flex-col"
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center justify-between">
            <AnimatePresence mode="wait">
              {!sidebarCollapsed && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="space-y-1"
                >
                  <div className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-primary" />
                    <h1 className="font-heading text-lg font-semibold text-primary">LeRobot</h1>
                  </div>
                  <p className="text-xs text-muted-foreground font-mono-sm">AI Robotics Platform</p>
                </motion.div>
              )}
            </AnimatePresence>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
            >
              <motion.div animate={{ rotate: sidebarCollapsed ? 180 : 0 }} transition={{ duration: 0.2 }}>
                <ChevronLeft className="h-4 w-4" />
              </motion.div>
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1">
          {navigation.map((item) => {
            const isActive = isActiveRoute(item.href)
            return (
              <Link key={item.name} href={item.href}>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start gap-3 h-10 text-left transition-all duration-150",
                    isActive
                      ? "bg-layer-active text-primary border border-primary/20"
                      : "hover:bg-layer-hover text-muted-foreground hover:text-foreground",
                    sidebarCollapsed && "justify-center px-2",
                  )}
                >
                  <item.icon className="h-4 w-4 flex-shrink-0" />
                  <AnimatePresence>
                    {!sidebarCollapsed && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: "auto" }}
                        exit={{ opacity: 0, width: 0 }}
                        transition={{ duration: 0.15 }}
                        className="font-medium text-sm font-body"
                      >
                        {item.name}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Button>
              </Link>
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
              transition={{ duration: 0.2 }}
              className="p-3 border-t border-sidebar-border"
            >
              <div className="bg-layer-2 rounded-lg p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  <span className="text-xs font-medium font-mono-sm">System Online</span>
                </div>
                <div className="text-xs text-muted-foreground space-y-1 font-mono">
                  <div className="flex justify-between">
                    <span>Robots:</span>
                    <span className="text-primary font-medium">12</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Datasets:</span>
                    <span className="text-primary font-medium">847</span>
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
        <header className="h-16 border-b border-border bg-layer-1">
          <div className="flex items-center justify-between h-full px-6">
            <h2 className="font-heading text-xl font-semibold">{getPageTitle()}</h2>
            <div className="flex items-center gap-3">
              <div className="text-xs text-muted-foreground font-mono">{new Date().toLocaleTimeString()}</div>
              <ThemeToggle />
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto bg-layer-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
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
