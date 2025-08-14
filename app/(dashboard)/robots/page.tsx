import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bot, Wifi, WifiOff, Battery, Cpu, Plus, Settings } from "lucide-react"
import { mockRobots } from "@/lib/data/mock-datasets"

const statusConfig = {
  online: { color: "bg-primary", label: "Online", icon: Wifi },
  offline: { color: "bg-muted-foreground", label: "Offline", icon: WifiOff },
  maintenance: { color: "bg-destructive", label: "Maintenance", icon: Settings },
  busy: { color: "bg-secondary", label: "Busy", icon: Cpu },
}

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

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold font-sans">Robot Fleet</h1>
          <p className="text-muted-foreground font-sans">Monitor and manage your robotic agents</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90">
          <Plus className="h-4 w-4 mr-2" />
          Add Robot
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="layer-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              <div>
                <p className="text-2xl font-mono font-medium">{onlineRobots}</p>
                <p className="text-sm text-muted-foreground font-sans">Online</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="layer-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-secondary rounded-full" />
              <div>
                <p className="text-2xl font-mono font-medium">{maintenanceRobots}</p>
                <p className="text-sm text-muted-foreground font-sans">Maintenance</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="layer-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-muted-foreground rounded-full" />
              <div>
                <p className="text-2xl font-mono font-medium">{offlineRobots}</p>
                <p className="text-sm text-muted-foreground font-sans">Offline</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="layer-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Battery className="h-5 w-5 text-primary" />
              <div>
                <p className="text-2xl font-mono font-medium">{avgBattery}%</p>
                <p className="text-sm text-muted-foreground font-sans">Avg Battery</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Robot Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockRobots.map((robot) => {
          const StatusIcon = statusConfig[robot.status as keyof typeof statusConfig].icon
          return (
            <Card key={robot.id} className="layer-interactive group">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg font-semibold font-sans group-hover:text-primary transition-colors">
                      {robot.name}
                    </CardTitle>
                    <CardDescription className="text-xs font-mono">{robot.id}</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-2 h-2 rounded-full ${statusConfig[robot.status as keyof typeof statusConfig].color}`}
                    />
                    <StatusIcon className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Robot Type & Status */}
                <div className="flex items-center justify-between">
                  <Badge
                    className={`text-xs font-mono ${robotTypeConfig[robot.type as keyof typeof robotTypeConfig].color}`}
                  >
                    {robotTypeConfig[robot.type as keyof typeof robotTypeConfig].label}
                  </Badge>
                  <Badge
                    variant={
                      robot.status === "online" ? "default" : robot.status === "maintenance" ? "destructive" : "outline"
                    }
                    className="text-xs font-mono"
                  >
                    {statusConfig[robot.status as keyof typeof statusConfig].label}
                  </Badge>
                </div>

                {/* Battery */}
                {robot.batteryLevel && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground font-sans">Battery</span>
                      <span className="font-mono">{robot.batteryLevel}%</span>
                    </div>
                    <div className="w-full bg-layer-2 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          robot.batteryLevel > 60
                            ? "bg-primary"
                            : robot.batteryLevel > 30
                              ? "bg-secondary"
                              : "bg-destructive"
                        }`}
                        style={{ width: `${robot.batteryLevel}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Details */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground font-sans">Location:</span>
                    <span className="font-sans">{robot.location}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground font-sans">Last Seen:</span>
                    <span className="font-mono text-xs">{robot.lastSeen.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground font-sans">Current Task:</span>
                    <span className="text-right font-sans">{robot.currentTask || "Idle"}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button size="sm" variant="outline" className="flex-1 bg-transparent text-xs font-mono">
                    <Bot className="h-4 w-4 mr-1" />
                    Control
                  </Button>
                  <Button size="sm" variant="outline" className="bg-transparent">
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
