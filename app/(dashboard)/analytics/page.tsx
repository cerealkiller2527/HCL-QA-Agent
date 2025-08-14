import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BarChart3, TrendingUp, TrendingDown, Activity, Download, Calendar } from "lucide-react"

export default function AnalyticsPage() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Performance insights and system metrics</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Calendar className="h-4 w-4 mr-2" />
            Last 30 Days
          </Button>
          <Button className="bg-lerobot-blue hover:bg-lerobot-blue/90">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Mission Success Rate</p>
                <p className="text-2xl font-bold">94.2%</p>
              </div>
              <div className="flex items-center gap-1 text-lerobot-green">
                <TrendingUp className="h-4 w-4" />
                <span className="text-sm">+2.1%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Mission Duration</p>
                <p className="text-2xl font-bold">42m</p>
              </div>
              <div className="flex items-center gap-1 text-lerobot-green">
                <TrendingDown className="h-4 w-4" />
                <span className="text-sm">-5.3%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">System Uptime</p>
                <p className="text-2xl font-bold">99.9%</p>
              </div>
              <div className="flex items-center gap-1 text-lerobot-green">
                <TrendingUp className="h-4 w-4" />
                <span className="text-sm">+0.1%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Data Collected</p>
                <p className="text-2xl font-bold">2.4TB</p>
              </div>
              <div className="flex items-center gap-1 text-lerobot-blue">
                <TrendingUp className="h-4 w-4" />
                <span className="text-sm">+12.5%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="font-heading">Mission Performance</CardTitle>
            <CardDescription>Success rate over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">Performance chart visualization</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-heading">Robot Utilization</CardTitle>
            <CardDescription>Active time by robot type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
              <div className="text-center">
                <Activity className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">Utilization chart visualization</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="font-heading">System Health</CardTitle>
          <CardDescription>Current status of all system components</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { component: "Database", status: "healthy", uptime: "99.9%" },
              { component: "API Gateway", status: "healthy", uptime: "99.8%" },
              { component: "Message Queue", status: "warning", uptime: "98.2%" },
              { component: "File Storage", status: "healthy", uptime: "100%" },
              { component: "Authentication", status: "healthy", uptime: "99.9%" },
              { component: "Monitoring", status: "healthy", uptime: "99.7%" },
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-accent/30">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      item.status === "healthy"
                        ? "bg-lerobot-green"
                        : item.status === "warning"
                          ? "bg-lerobot-orange"
                          : "bg-lerobot-red"
                    }`}
                  />
                  <span className="font-medium text-sm">{item.component}</span>
                </div>
                <div className="text-right">
                  <Badge variant={item.status === "healthy" ? "default" : "secondary"}>{item.status}</Badge>
                  <p className="text-xs text-muted-foreground mt-1">{item.uptime}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
