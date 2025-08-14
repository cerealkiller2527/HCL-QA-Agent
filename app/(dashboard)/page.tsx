import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Database, Bot, Play, BarChart3, Plus, Activity, Clock, Zap } from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="space-y-2">
        <h1 className="font-heading text-3xl font-semibold">
          Welcome to <span className="text-lerobot-primary">LeRobot</span>
        </h1>
        <p className="text-muted-foreground text-lg">Build and scale robotic agents with our AI-powered platform</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link href="/datasets">
          <Card className="bg-layer-1 hover:bg-layer-2 transition-all duration-200 cursor-pointer hover:border-lerobot-primary/30 hover-lift layer-depth layer-depth-hover">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-lerobot-primary/10">
                  <Database className="h-5 w-5 text-lerobot-primary" />
                </div>
                <div>
                  <CardTitle className="text-base font-heading">Datasets</CardTitle>
                  <CardDescription className="text-sm">Training data</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-semibold font-mono-tech">847</div>
                <Button size="sm" variant="outline" className="h-7 text-xs bg-layer-2 hover:bg-layer-3">
                  <Plus className="h-3 w-3 mr-1" />
                  New
                </Button>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/robots">
          <Card className="bg-layer-1 hover:bg-layer-2 transition-all duration-200 cursor-pointer hover:border-lerobot-primary/30 hover-lift layer-depth layer-depth-hover">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-lerobot-primary/10">
                  <Bot className="h-5 w-5 text-lerobot-primary" />
                </div>
                <div>
                  <CardTitle className="text-base font-heading">Robots</CardTitle>
                  <CardDescription className="text-sm">Connected agents</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-semibold font-mono-tech">12</div>
                <div className="text-xs text-lerobot-primary font-medium bg-lerobot-primary/10 px-2 py-1 rounded">
                  Online
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/missions">
          <Card className="bg-layer-1 hover:bg-layer-2 transition-all duration-200 cursor-pointer hover:border-lerobot-primary/30 hover-lift layer-depth layer-depth-hover">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-lerobot-primary/10">
                  <Play className="h-5 w-5 text-lerobot-primary" />
                </div>
                <div>
                  <CardTitle className="text-base font-heading">Missions</CardTitle>
                  <CardDescription className="text-sm">Active operations</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-semibold font-mono-tech">23</div>
                <div className="text-xs text-lerobot-primary font-medium bg-lerobot-primary/10 px-2 py-1 rounded">
                  Running
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/analytics">
          <Card className="bg-layer-1 hover:bg-layer-2 transition-all duration-200 cursor-pointer hover:border-lerobot-primary/30 hover-lift layer-depth layer-depth-hover">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-lerobot-primary/10">
                  <BarChart3 className="h-5 w-5 text-lerobot-primary" />
                </div>
                <div>
                  <CardTitle className="text-base font-heading">Analytics</CardTitle>
                  <CardDescription className="text-sm">Performance metrics</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-semibold font-mono-tech">99.9%</div>
                <div className="text-xs text-lerobot-primary font-medium bg-lerobot-primary/10 px-2 py-1 rounded">
                  Uptime
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-layer-1 layer-depth">
          <CardHeader className="pb-4">
            <CardTitle className="font-heading text-lg flex items-center gap-2">
              <Activity className="h-5 w-5 text-lerobot-primary" />
              System Status
            </CardTitle>
            <CardDescription>Platform health and performance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: "Platform Status", value: "Operational", color: "text-lerobot-primary" },
              { label: "Active Robots", value: "12/15", color: "text-lerobot-primary" },
              { label: "Running Missions", value: "23", color: "text-lerobot-primary" },
              { label: "Data Storage", value: "2.4TB used", color: "text-muted-foreground" },
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-layer-2">
                <span className="text-sm font-medium">{item.label}</span>
                <span className={`font-mono-tech text-sm font-medium ${item.color}`}>{item.value}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-layer-1 layer-depth">
          <CardHeader className="pb-4">
            <CardTitle className="font-heading text-lg flex items-center gap-2">
              <Clock className="h-5 w-5 text-lerobot-primary" />
              Recent Activity
            </CardTitle>
            <CardDescription>Latest updates from your robotic agents</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { message: "New dataset 'kitchen_tasks_v2' uploaded", time: "2 minutes ago" },
                { message: "Robot ARM-001 completed mission successfully", time: "5 minutes ago" },
                { message: "Mission 'object_sorting' started", time: "12 minutes ago" },
                { message: "System backup completed", time: "1 hour ago" },
              ].map((activity, index) => (
                <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-layer-2">
                  <div className="w-2 h-2 rounded-full bg-lerobot-primary" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.message}</p>
                    <p className="text-xs text-muted-foreground font-mono-tech">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-layer-1 layer-depth">
        <CardHeader className="pb-4">
          <CardTitle className="font-heading text-lg flex items-center gap-2">
            <Zap className="h-5 w-5 text-lerobot-primary" />
            Quick Start
          </CardTitle>
          <CardDescription>Get started with common tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              <Link key={index} href={item.href}>
                <Button
                  variant="outline"
                  className="w-full h-auto p-4 flex flex-col items-center gap-3 hover:bg-layer-2 hover:border-lerobot-primary/30 transition-all hover-lift bg-layer-1 layer-depth-hover"
                >
                  <div className="p-2 rounded-lg bg-lerobot-primary/10">
                    <item.icon className="h-5 w-5 text-lerobot-primary" />
                  </div>
                  <div className="text-center">
                    <p className="font-heading font-medium text-sm">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                </Button>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
