import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bot, Wifi, WifiOff, Battery, Cpu, Plus, Settings } from "lucide-react"

const mockRobots = [
  {
    id: "robot-001",
    name: "Kitchen Assistant",
    type: "arm",
    status: "online",
    battery: 87,
    location: "Kitchen Lab A",
    lastSeen: "2 minutes ago",
    currentTask: "Object sorting",
  },
  {
    id: "robot-002",
    name: "Mobile Scout",
    type: "mobile",
    status: "online",
    battery: 92,
    location: "Warehouse Floor 2",
    lastSeen: "1 minute ago",
    currentTask: "Navigation mapping",
  },
  {
    id: "robot-003",
    name: "Assembly Unit",
    type: "arm",
    status: "offline",
    battery: 45,
    location: "Factory Line B",
    lastSeen: "15 minutes ago",
    currentTask: "Maintenance",
  },
  {
    id: "robot-004",
    name: "Research Bot",
    type: "humanoid",
    status: "busy",
    battery: 78,
    location: "HRI Lab",
    lastSeen: "Active now",
    currentTask: "Human interaction study",
  },
]

const statusConfig = {
  online: { color: "bg-lerobot-green", label: "Online", icon: Wifi },
  offline: { color: "bg-muted-foreground", label: "Offline", icon: WifiOff },
  busy: { color: "bg-lerobot-orange", label: "Busy", icon: Cpu },
}

const robotTypeConfig = {
  arm: { label: "Robotic Arm", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400" },
  mobile: { label: "Mobile Robot", color: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400" },
  humanoid: { label: "Humanoid", color: "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400" },
}

export default function RobotsPage() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold">Robot Fleet</h1>
          <p className="text-muted-foreground">Monitor and manage your robotic agents</p>
        </div>
        <Button className="bg-lerobot-green hover:bg-lerobot-green/90">
          <Plus className="h-4 w-4 mr-2" />
          Add Robot
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-lerobot-green rounded-full animate-pulse" />
              <div>
                <p className="text-2xl font-bold">12</p>
                <p className="text-sm text-muted-foreground">Online</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-lerobot-orange rounded-full" />
              <div>
                <p className="text-2xl font-bold">3</p>
                <p className="text-sm text-muted-foreground">Busy</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-muted-foreground rounded-full" />
              <div>
                <p className="text-2xl font-bold">2</p>
                <p className="text-sm text-muted-foreground">Offline</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Battery className="h-5 w-5 text-lerobot-blue" />
              <div>
                <p className="text-2xl font-bold">84%</p>
                <p className="text-sm text-muted-foreground">Avg Battery</p>
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
            <Card key={robot.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg font-heading">{robot.name}</CardTitle>
                    <CardDescription>{robot.id}</CardDescription>
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
                  <Badge className={robotTypeConfig[robot.type as keyof typeof robotTypeConfig].color}>
                    {robotTypeConfig[robot.type as keyof typeof robotTypeConfig].label}
                  </Badge>
                  <Badge
                    variant={robot.status === "online" ? "default" : robot.status === "busy" ? "secondary" : "outline"}
                  >
                    {statusConfig[robot.status as keyof typeof statusConfig].label}
                  </Badge>
                </div>

                {/* Battery */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Battery</span>
                    <span className="font-mono">{robot.battery}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        robot.battery > 60
                          ? "bg-lerobot-green"
                          : robot.battery > 30
                            ? "bg-lerobot-orange"
                            : "bg-lerobot-red"
                      }`}
                      style={{ width: `${robot.battery}%` }}
                    />
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Location:</span>
                    <span>{robot.location}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Last Seen:</span>
                    <span>{robot.lastSeen}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Current Task:</span>
                    <span className="text-right">{robot.currentTask}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                    <Bot className="h-4 w-4 mr-1" />
                    Control
                  </Button>
                  <Button size="sm" variant="outline">
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
