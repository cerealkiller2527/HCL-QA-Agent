"use client"

import type React from "react"
import { useState } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { ChevronLeft, Database, Bot, Play, BarChart3, Settings, Bell, RefreshCw, Zap } from "lucide-react"
import { cn } from "@/lib/utils"

const navigation = [
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
    if (href === "/datasets") {
      return pathname === "/datasets" || pathname.startsWith("/datasets/")
    }
    return pathname === href || pathname.startsWith(href + "/")
  }

  return (
    <div className="flex h-screen bg-layer-0">
      <div
        className={cn(
          "bg-layer-1 border-r border-border transition-all duration-300 flex flex-col layer-depth",
          sidebarCollapsed ? "w-16" : "w-64",
        )}
      >
        <div className="p-4 border-b border-border bg-layer-2">
          <div className="flex items-center justify-between">
            {!sidebarCollapsed && (
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-lerobot-primary" />
                  <h1 className="font-heading text-lg font-semibold text-lerobot-primary">LeRobot</h1>
                </div>
                <p className="text-xs text-muted-foreground font-mono-label">AI Robotics Platform</p>
              </div>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
            >
              <ChevronLeft
                className={cn("h-4 w-4 transition-transform duration-300", sidebarCollapsed && "rotate-180")}
              />
            </Button>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {navigation.map((item) => {
            const isActive = isActiveRoute(item.href)
            return (
              <Link key={item.name} href={item.href}>
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
                  {!sidebarCollapsed && <span className="font-medium text-sm font-mono-label">{item.name}</span>}
                </Button>
              </Link>
            )
          })}
        </nav>

        {!sidebarCollapsed && (
          <div className="p-3 border-t border-border">
            <div className="bg-layer-2 rounded-lg p-3 space-y-2 layer-depth">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-lerobot-primary rounded-full status-pulse" />
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
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-border bg-layer-1/80 backdrop-blur-sm layer-depth">
          <div className="flex items-center justify-between h-full px-6">
            <div className="flex items-center gap-4">
              <h2 className="font-heading text-xl font-semibold">
                {navigation.find((item) => isActiveRoute(item.href))?.name || "Dashboard"}
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-xs text-muted-foreground font-mono-data">{new Date().toLocaleTimeString()}</div>
              <ThemeToggle />
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Bell className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto bg-layer-0">{children}</main>
      </div>
    </div>
  )
}
