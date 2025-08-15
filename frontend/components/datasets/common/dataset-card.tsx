"use client"

import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Calendar,
  Clock,
  HardDrive,
  Eye,
  Download,
  Play,
  AlertCircle,
  CheckCircle,
  Loader2,
  Trash2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { ANIMATION } from "@/lib/constants"

interface Dataset {
  id: string
  name: string
  description: string
  status: "ready" | "processing" | "recording" | "error"
  robotType: "arm" | "mobile" | "humanoid" | "custom"
  tags: string[]
  duration: number
  fileSize: number
  frameCount: number
  createdAt: Date
}

const statusConfig = {
  ready: { icon: CheckCircle, color: "text-green-500", bg: "bg-green-500/10", label: "Ready" },
  processing: { icon: Loader2, color: "text-blue-500", bg: "bg-blue-500/10", label: "Processing" },
  recording: { icon: Play, color: "text-yellow-500", bg: "bg-yellow-500/10", label: "Recording" },
  error: { icon: AlertCircle, color: "text-red-500", bg: "bg-red-500/10", label: "Error" },
}

const robotTypeConfig = {
  arm: { label: "Robotic Arm", color: "bg-blue-500/10 text-blue-500" },
  mobile: { label: "Mobile Robot", color: "bg-green-500/10 text-green-500" },
  humanoid: { label: "Humanoid", color: "bg-purple-500/10 text-purple-500" },
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

interface DatasetCardProps {
  dataset: Dataset
  onDelete?: () => void
  showDeleteButton?: boolean
}

export function DatasetCard({ dataset, onDelete, showDeleteButton = true }: DatasetCardProps) {
  const router = useRouter()
  const StatusIcon = statusConfig[dataset.status].icon
  const isProcessing = dataset.status === "processing"

  const handleCardClick = () => {
    router.push(`/datasets/${dataset.id}`)
  }

  return (
    <motion.div variants={ANIMATION.variants.staggerItem} onClick={handleCardClick}>
      <Card className="layer-card group cursor-pointer hover:shadow-lg transition-all duration-200">
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
            <Button
              size="sm"
              variant="outline"
              className="bg-transparent hover:bg-primary/10"
              onClick={(e) => {
                e.stopPropagation()
                // Download functionality here
              }}
            >
              <Download className="h-4 w-4 mr-1" />
              Download
            </Button>
            {showDeleteButton && onDelete && (
              <Button
                size="sm"
                variant="outline"
                className="bg-transparent hover:bg-red-50 hover:border-red-200 hover:text-red-600"
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete()
                }}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
