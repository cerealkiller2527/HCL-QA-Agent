"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Camera } from "lucide-react"
import { cn } from "@/lib/utils"

interface Episode {
  id: number
  name: string
  duration: number
  status: string
}

interface EpisodeSelectorProps {
  episodes: Episode[]
  selectedEpisode: number
  onEpisodeSelect: (episodeId: number) => void
  formatDuration: (seconds: number) => string
}

export function EpisodeSelector({ episodes, selectedEpisode, onEpisodeSelect, formatDuration }: EpisodeSelectorProps) {
  return (
    <Card className="layer-card">
      <CardContent className="p-3">
        <div
          className="flex gap-2 overflow-x-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-border hover:scrollbar-thumb-muted-foreground"
          style={{
            scrollbarWidth: "thin",
            scrollbarColor: "hsl(var(--border)) transparent",
          }}
        >
          {episodes.map((episode) => (
            <motion.div
              key={episode.id}
              className={cn(
                "flex-shrink-0 px-3 py-2 rounded-md border cursor-pointer transition-all flex items-center gap-2 min-w-fit",
                selectedEpisode === episode.id
                  ? "border-primary bg-primary/10"
                  : "border-border hover:shadow-[inset_0_0_0_2px_hsl(var(--primary))]",
              )}
              onClick={() => onEpisodeSelect(episode.id)}
              whileTap={{ scale: 0.98 }}
            >
              <div className="w-6 h-4 bg-layer-2 rounded flex items-center justify-center border border-border">
                <Camera className="h-2.5 w-2.5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium font-sans">{episode.name}</p>
                <p className="text-xs text-muted-foreground font-mono">{formatDuration(episode.duration)}</p>
              </div>
              <Badge
                variant={
                  episode.status === "completed"
                    ? "default"
                    : episode.status === "processing"
                      ? "secondary"
                      : "destructive"
                }
                className="text-xs"
              >
                {episode.status}
              </Badge>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
