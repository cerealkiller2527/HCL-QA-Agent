import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Play, Pause, Square, Clock, Target, Plus, Eye } from "lucide-react"

const mockMissions = [
  {
    id: "mission-001",
    name: "Kitchen Cleanup Protocol",
    description: "Automated cleaning and organization of kitchen workspace",
    status: "running",
    progress: 67,
    robot: "Kitchen Assistant",
    startTime: "2024-01-20T14:30:00Z",
    estimatedDuration: 45,
    priority: "high",
  },
  {
    id: "mission-002",
    name: "Warehouse Inventory Scan",
    description: "Complete inventory scanning of warehouse section A",
    status: "running",
    progress: 23,
    robot: "Mobile Scout",
    startTime: "2024-01-20T13:15:00Z",
    estimatedDuration: 120,
    priority: "medium",
  },
  {
    id: "mission-003",
    name: "Assembly Line Quality Check",
    description: "Automated quality inspection of manufactured components",
    status: "paused",
    progress: 89,
    robot: "Assembly Unit",
    startTime: "2024-01-20T12:00:00Z",
    estimatedDuration: 60,
    priority: "high",
  },
  {
    id: "mission-004",
    name: "Human Interaction Study",
    description: "Collaborative task execution with research participants",
    status: "completed",
    progress: 100,
    robot: "Research Bot",
    startTime: "2024-01-20T10:00:00Z",
    estimatedDuration: 90,
    priority: "low",
  },
]

const statusConfig = {
  running: { color: "bg-lerobot-green", label: "Running", icon: Play },
  paused: { color: "bg-lerobot-orange", label: "Paused", icon: Pause },
  completed: { color: "bg-lerobot-blue", label: "Completed", icon: Target },
  failed: { color: "bg-lerobot-red", label: "Failed", icon: Square },
}

const priorityConfig = {
  high: { color: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400" },
  medium: { color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400" },
  low: { color: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400" },
}

function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hours > 0) return `${hours}h ${mins}m`
  return `${mins}m`
}

function getElapsedTime(startTime: string): string {
  const start = new Date(startTime)
  const now = new Date()
  const elapsed = Math.floor((now.getTime() - start.getTime()) / (1000 * 60))
  return formatDuration(elapsed)
}

export default function MissionsPage() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold">Mission Control</h1>
          <p className="text-muted-foreground">Monitor and manage robotic missions</p>
        </div>
        <Button className="bg-lerobot-orange hover:bg-lerobot-orange/90">
          <Plus className="h-4 w-4 mr-2" />
          New Mission
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Play className="h-5 w-5 text-lerobot-green" />
              <div>
                <p className="text-2xl font-bold">23</p>
                <p className="text-sm text-muted-foreground">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Target className="h-5 w-5 text-lerobot-blue" />
              <div>
                <p className="text-2xl font-bold">156</p>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Pause className="h-5 w-5 text-lerobot-orange" />
              <div>
                <p className="text-2xl font-bold">4</p>
                <p className="text-sm text-muted-foreground">Paused</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">94%</p>
                <p className="text-sm text-muted-foreground">Success Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mission List */}
      <div className="space-y-4">
        {mockMissions.map((mission) => {
          const StatusIcon = statusConfig[mission.status as keyof typeof statusConfig].icon
          return (
            <Card key={mission.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-3">
                      <CardTitle className="text-lg font-heading">{mission.name}</CardTitle>
                      <Badge className={priorityConfig[mission.priority as keyof typeof priorityConfig].color}>
                        {mission.priority} priority
                      </Badge>
                    </div>
                    <CardDescription>{mission.description}</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-2 h-2 rounded-full ${statusConfig[mission.status as keyof typeof statusConfig].color}`}
                    />
                    <StatusIcon className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Progress */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-mono">{mission.progress}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="h-2 bg-lerobot-blue rounded-full transition-all"
                      style={{ width: `${mission.progress}%` }}
                    />
                  </div>
                </div>

                {/* Details */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Robot</p>
                    <p className="font-medium">{mission.robot}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Elapsed</p>
                    <p className="font-mono">{getElapsedTime(mission.startTime)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Duration</p>
                    <p className="font-mono">{formatDuration(mission.estimatedDuration)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Status</p>
                    <Badge
                      variant={
                        mission.status === "running"
                          ? "default"
                          : mission.status === "completed"
                            ? "secondary"
                            : "outline"
                      }
                    >
                      {statusConfig[mission.status as keyof typeof statusConfig].label}
                    </Badge>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button size="sm" variant="outline" className="bg-transparent">
                    <Eye className="h-4 w-4 mr-1" />
                    View Details
                  </Button>
                  {mission.status === "running" && (
                    <Button size="sm" variant="outline">
                      <Pause className="h-4 w-4 mr-1" />
                      Pause
                    </Button>
                  )}
                  {mission.status === "paused" && (
                    <Button size="sm" variant="outline">
                      <Play className="h-4 w-4 mr-1" />
                      Resume
                    </Button>
                  )}
                  <Button size="sm" variant="outline">
                    <Square className="h-4 w-4 mr-1" />
                    Stop
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
