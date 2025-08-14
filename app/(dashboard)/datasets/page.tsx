"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Search,
  Plus,
  Calendar,
  Clock,
  HardDrive,
  Eye,
  Download,
  Play,
  AlertCircle,
  CheckCircle,
  Loader2,
} from "lucide-react"
import { mockDatasets } from "@/lib/data/mock-datasets"
import { cn } from "@/lib/utils"

const statusConfig = {
  ready: { icon: CheckCircle, color: "text-primary", bg: "bg-primary/10", label: "Ready" },
  processing: { icon: Loader2, color: "text-primary", bg: "bg-primary/10", label: "Processing" },
  recording: { icon: Play, color: "text-primary", bg: "bg-primary/10", label: "Recording" },
  error: { icon: AlertCircle, color: "text-destructive", bg: "bg-destructive/10", label: "Error" },
}

const robotTypeConfig = {
  arm: { label: "Robotic Arm", color: "bg-primary/10 text-primary" },
  mobile: { label: "Mobile Robot", color: "bg-primary/10 text-primary" },
  humanoid: { label: "Humanoid", color: "bg-primary/10 text-primary" },
  custom: { label: "Custom", color: "bg-muted text-muted-foreground" },
}

function formatFileSize(bytes: number): string {
  const sizes = ["B", "KB", "MB", "GB", "TB"]
  if (bytes === 0) return "0 B"
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i]
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  if (hours > 0) return `${hours}h ${minutes}m`
  return `${minutes}m`
}

export default function DatasetsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [robotTypeFilter, setRobotTypeFilter] = useState<string>("all")

  const filteredDatasets = mockDatasets.filter((dataset) => {
    const matchesSearch =
      dataset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dataset.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dataset.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesStatus = statusFilter === "all" || dataset.status === statusFilter
    const matchesRobotType = robotTypeFilter === "all" || dataset.robotType === robotTypeFilter

    return matchesSearch && matchesStatus && matchesRobotType
  })

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold font-sans">Datasets</h1>
          <p className="text-muted-foreground font-sans">Manage your robotics training data</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90">
          <Plus className="h-4 w-4 mr-2" />
          New Dataset
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search datasets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-layer-1 border-border"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-40 bg-layer-1 border-border">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="ready">Ready</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="recording">Recording</SelectItem>
            <SelectItem value="error">Error</SelectItem>
          </SelectContent>
        </Select>
        <Select value={robotTypeFilter} onValueChange={setRobotTypeFilter}>
          <SelectTrigger className="w-full sm:w-40 bg-layer-1 border-border">
            <SelectValue placeholder="Robot Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="arm">Robotic Arm</SelectItem>
            <SelectItem value="mobile">Mobile Robot</SelectItem>
            <SelectItem value="humanoid">Humanoid</SelectItem>
            <SelectItem value="custom">Custom</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Dataset Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDatasets.map((dataset) => {
          const StatusIcon = statusConfig[dataset.status].icon
          const isProcessing = dataset.status === "processing"

          return (
            <Card key={dataset.id} className="layer-interactive group">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <CardTitle className="text-lg font-semibold font-sans group-hover:text-primary transition-colors">
                      {dataset.name}
                    </CardTitle>
                    <CardDescription className="line-clamp-2 font-sans">{dataset.description}</CardDescription>
                  </div>
                  <div
                    className={cn(
                      "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-mono",
                      statusConfig[dataset.status].bg,
                    )}
                  >
                    <StatusIcon
                      className={cn("h-3 w-3", statusConfig[dataset.status].color, isProcessing && "animate-spin")}
                    />
                    {statusConfig[dataset.status].label}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Robot Type & Tags */}
                <div className="flex flex-wrap gap-2">
                  <Badge className={cn("text-xs font-mono", robotTypeConfig[dataset.robotType].color)}>
                    {robotTypeConfig[dataset.robotType].label}
                  </Badge>
                  {dataset.tags.slice(0, 2).map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs font-mono">
                      {tag}
                    </Badge>
                  ))}
                  {dataset.tags.length > 2 && (
                    <Badge variant="secondary" className="text-xs font-mono">
                      +{dataset.tags.length - 2}
                    </Badge>
                  )}
                </div>

                {/* Metadata */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span className="font-mono">{formatDuration(dataset.duration)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <HardDrive className="h-4 w-4" />
                    <span className="font-mono">{formatFileSize(dataset.fileSize)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span className="font-mono">{dataset.createdAt.toLocaleDateString()}</span>
                  </div>
                  <div className="text-muted-foreground font-mono">{dataset.frameCount.toLocaleString()} frames</div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button size="sm" variant="outline" className="flex-1 bg-transparent text-xs font-mono">
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  <Button size="sm" variant="outline" className="bg-transparent">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Empty State */}
      {filteredDatasets.length === 0 && (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-layer-2 rounded-full flex items-center justify-center mb-4">
            <Search className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold font-sans mb-2">No datasets found</h3>
          <p className="text-muted-foreground mb-4 font-sans">
            {searchQuery || statusFilter !== "all" || robotTypeFilter !== "all"
              ? "Try adjusting your search or filters"
              : "Get started by creating your first dataset"}
          </p>
          <Button className="bg-primary hover:bg-primary/90">
            <Plus className="h-4 w-4 mr-2" />
            Create Dataset
          </Button>
        </div>
      )}
    </div>
  )
}
