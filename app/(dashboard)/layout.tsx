"use client"

import type React from "react"
import { useState } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronLeft, Database, Bot, Play, BarChart3, Settings, Bell, RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"

const navigation = [
  { name: "Datasets", href: "/datasets", icon: Database, color: "text-lerobot-blue" },
  { name: "Robots", href: "/robots", icon: Bot, color: "text-lerobot-green" },
  { name: "Missions", href: "/missions", icon: Play, color: "text-lerobot-orange" },
  { name: "Analytics", href: "/analytics", icon: BarChart3, color: "text-lerobot-blue" },
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
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div
        className={cn(
          "bg-card border-r border-border transition-all duration-300 flex flex-col",
          sidebarCollapsed ? "w-16" : "w-64",
        )}
      >
        {/* Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            {!sidebarCollapsed && (
              <div>
                <h1 className="font-heading font-bold text-xl text-lerobot-orange">LeRobot</h1>
                <p className="text-xs text-muted-foreground">AI Robotics Platform</p>
              </div>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="text-muted-foreground hover:text-foreground"
            >
              <ChevronLeft className={cn("h-4 w-4 transition-transform", sidebarCollapsed && "rotate-180")} />
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navigation.map((item) => {
            const isActive = isActiveRoute(item.href)
            return (
              <Link key={item.name} href={item.href}>
                <Button
                  variant={isActive ? "default" : "ghost"}
                  className={cn(
                    "w-full justify-start gap-3 h-10",
                    isActive
                      ? "bg-lerobot-orange hover:bg-lerobot-orange/90 text-white"
                      : "hover:bg-accent hover:text-accent-foreground",
                  )}
                >
                  <item.icon className={cn("h-5 w-5", isActive ? "text-white" : item.color)} />
                  {!sidebarCollapsed && <span className="font-medium">{item.name}</span>}
                </Button>
              </Link>
            )
          })}
        </nav>

        {/* Status Panel */}
        {!sidebarCollapsed && (
          <div className="p-4 border-t border-border">
            <div className="bg-accent/50 rounded-lg p-3 space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-lerobot-green rounded-full animate-pulse" />
                <span className="text-xs font-medium">System Online</span>
              </div>
              <div className="text-xs text-muted-foreground space-y-1">
                <div>Robots: 12 Active</div>
                <div>Datasets: 847 Total</div>
                <div>Uptime: 99.9%</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-16 border-b border-border bg-card/50 backdrop-blur-sm">
          <div className="flex items-center justify-between h-full px-6">
            <div className="flex items-center gap-4">
              <h2 className="font-heading font-semibold text-lg">
                {navigation.find((item) => isActiveRoute(item.href))?.name || "Dashboard"}
              </h2>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-xs text-muted-foreground">Last update: {new Date().toLocaleTimeString()}</div>
              <Button variant="ghost" size="icon">
                <Bell className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  )
}
