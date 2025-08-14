"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { ChevronLeft, Database, Bot, Play, BarChart3, Settings, Home, Menu } from "lucide-react"
import { cn } from "@/lib/utils"

const navigation = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Datasets", href: "/datasets", icon: Database },
  { name: "Robots", href: "/robots", icon: Bot },
  { name: "Missions", href: "/missions", icon: Play },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Settings", href: "/settings", icon: Settings },
]

const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
}

const pageTransition = {
  duration: 0.2,
  ease: "easeOut",
}

const HCLTechLogo = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 200 60" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="hcl-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="hsl(var(--primary))" />
        <stop offset="100%" stopColor="hsl(var(--primary) / 0.8)" />
      </linearGradient>
    </defs>
    <rect x="0" y="0" width="200" height="60" rx="8" fill="url(#hcl-gradient)" />
    <text x="100" y="38" textAnchor="middle" className="fill-white font-sans font-bold text-[24px]">
      HCLTech
    </text>
  </svg>
)

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const savedState = localStorage.getItem("sidebar-collapsed")
    if (savedState !== null) {
      setSidebarCollapsed(JSON.parse(savedState))
    }
    setMounted(true)
  }, [])

  const toggleSidebar = () => {
    const newState = !sidebarCollapsed
    setSidebarCollapsed(newState)
    localStorage.setItem("sidebar-collapsed", JSON.stringify(newState))
  }

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

  if (!mounted) {
    return null
  }

  return (
    <div className="flex h-screen bg-layer-0">
      {/* Sidebar */}
      <motion.div
        animate={{ width: sidebarCollapsed ? 64 : 220 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="bg-layer-1 border-r border-border flex flex-col"
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            <AnimatePresence mode="wait">
              {!sidebarCollapsed && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <HCLTechLogo className="h-8 w-auto" />
                </motion.div>
              )}
            </AnimatePresence>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleSidebar}
                className={cn(
                  "h-8 w-8 relative overflow-hidden group",
                  "bg-layer-2 hover:bg-layer-active border border-border/50",
                  "hover:border-primary/30 transition-all duration-200",
                )}
              >
                <motion.div
                  animate={{ rotate: sidebarCollapsed ? 180 : 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="relative z-10"
                >
                  {sidebarCollapsed ? (
                    <Menu className="h-4 w-4 text-primary" />
                  ) : (
                    <ChevronLeft className="h-4 w-4 text-primary" />
                  )}
                </motion.div>
                {/* Subtle glow effect */}
                <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              </Button>
            </motion.div>
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
                        className="text-label"
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

        {/* Time and Theme Toggle */}
        <div className="p-3 border-t border-border">
          <AnimatePresence>
            {!sidebarCollapsed ? (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="space-y-3"
              >
                {/* Time and Theme Toggle */}
                <div className="bg-layer-2 rounded-lg p-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-code text-muted-foreground font-mono text-sm">
                      {new Date().toLocaleTimeString()}
                    </div>
                    <ThemeToggle />
                  </div>
                </div>

                {/* Status Panel */}
                <div className="bg-layer-2 rounded-lg p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full" />
                    <span className="text-code">System Online</span>
                  </div>
                  <div className="text-caption space-y-1">
                    <div className="flex justify-between">
                      <span>Robots:</span>
                      <span className="text-primary font-mono-medium">12</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Datasets:</span>
                      <span className="text-primary font-mono-medium">847</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col items-center gap-2"
              >
                <ThemeToggle />
                <div className="w-2 h-2 bg-primary rounded-full" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 overflow-auto bg-layer-0 p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={pageTransition}
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
