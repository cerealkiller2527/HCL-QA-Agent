import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Database, Bot, Play, BarChart3, Plus, Activity, Clock } from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
  return (
    <div className="p-6 space-y-6">
      {/* Welcome Section */}
      <div className="space-y-2">
        <h1 className="font-heading text-3xl font-bold">
          Welcome to <span className="text-lerobot-orange">LeRobot</span>
        </h1>
        <p className="text-muted-foreground text-lg">Build and scale robotic agents with our AI-powered platform</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link href="/datasets">
          <Card className="hover:shadow-md transition-shadow cursor-pointer border-lerobot-blue/20 hover:border-lerobot-blue/40">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <Database className="h-8 w-8 text-lerobot-blue" />
                <div>
                  <CardTitle className="text-base">Datasets</CardTitle>
                  <CardDescription>Manage training data</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">847</div>
                <Button size="sm" variant="outline">
                  <Plus className="h-4 w-4 mr-1" />
                  New
                </Button>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/robots">
          <Card className="hover:shadow-md transition-shadow cursor-pointer border-lerobot-green/20 hover:border-lerobot-green/40">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <Bot className="h-8 w-8 text-lerobot-green" />
                <div>
                  <CardTitle className="text-base">Robots</CardTitle>
                  <CardDescription>Connected agents</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">12</div>
                <div className="text-sm text-lerobot-green font-medium">Online</div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/missions">
          <Card className="hover:shadow-md transition-shadow cursor-pointer border-lerobot-orange/20 hover:border-lerobot-orange/40">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <Play className="h-8 w-8 text-lerobot-orange" />
                <div>
                  <CardTitle className="text-base">Missions</CardTitle>
                  <CardDescription>Active operations</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">23</div>
                <div className="text-sm text-lerobot-orange font-medium">Running</div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/analytics">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <BarChart3 className="h-8 w-8 text-lerobot-blue" />
                <div>
                  <CardTitle className="text-base">Analytics</CardTitle>
                  <CardDescription>Performance metrics</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">99.9%</div>
                <div className="text-sm text-lerobot-green font-medium">Uptime</div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* System Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="font-heading flex items-center gap-2">
              <Activity className="h-5 w-5" />
              System Status
            </CardTitle>
            <CardDescription>Current platform health and performance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { label: "Platform Status", value: "Operational", color: "text-lerobot-green" },
              { label: "Active Robots", value: "12/15", color: "text-lerobot-blue" },
              { label: "Running Missions", value: "23", color: "text-lerobot-orange" },
              { label: "Data Storage", value: "2.4TB used", color: "text-muted-foreground" },
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-accent/30">
                <span className="font-medium">{item.label}</span>
                <span className={`font-mono ${item.color}`}>{item.value}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-heading flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>Latest updates from your robotic agents</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  type: "dataset",
                  message: "New dataset 'kitchen_tasks_v2' uploaded",
                  time: "2 minutes ago",
                  color: "text-lerobot-blue",
                },
                {
                  type: "robot",
                  message: "Robot ARM-001 completed mission successfully",
                  time: "5 minutes ago",
                  color: "text-lerobot-green",
                },
                {
                  type: "mission",
                  message: "Mission 'object_sorting' started",
                  time: "12 minutes ago",
                  color: "text-lerobot-orange",
                },
                {
                  type: "system",
                  message: "System backup completed",
                  time: "1 hour ago",
                  color: "text-muted-foreground",
                },
              ].map((activity, index) => (
                <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-accent/30">
                  <div className={`w-2 h-2 rounded-full ${activity.color.replace("text-", "bg-")}`} />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.message}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Start */}
      <Card>
        <CardHeader>
          <CardTitle className="font-heading">Quick Start</CardTitle>
          <CardDescription>Get started with common tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/datasets/recorder">
              <Button variant="outline" className="w-full h-auto p-4 flex flex-col items-center gap-2 bg-transparent">
                <Database className="h-6 w-6 text-lerobot-blue" />
                <div className="text-center">
                  <p className="font-medium">Record Dataset</p>
                  <p className="text-xs text-muted-foreground">Start recording new training data</p>
                </div>
              </Button>
            </Link>
            <Link href="/robots">
              <Button variant="outline" className="w-full h-auto p-4 flex flex-col items-center gap-2 bg-transparent">
                <Bot className="h-6 w-6 text-lerobot-green" />
                <div className="text-center">
                  <p className="font-medium">Connect Robot</p>
                  <p className="text-xs text-muted-foreground">Add a new robot to your fleet</p>
                </div>
              </Button>
            </Link>
            <Link href="/missions">
              <Button variant="outline" className="w-full h-auto p-4 flex flex-col items-center gap-2 bg-transparent">
                <Play className="h-6 w-6 text-lerobot-orange" />
                <div className="text-center">
                  <p className="font-medium">Create Mission</p>
                  <p className="text-xs text-muted-foreground">Start a new robotic mission</p>
                </div>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
