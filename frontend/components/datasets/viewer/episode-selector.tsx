"use client"

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
    <div className="flex gap-3 overflow-x-auto py-1 px-1">
      {episodes.map((episode) => (
        <button
          key={episode.id}
          className={cn(
            "flex-shrink-0 px-4 py-2.5 rounded-lg transition-all border",
            "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
            selectedEpisode === episode.id
              ? "border-primary bg-primary/10 text-primary ring-2 ring-primary"
              : "border-border bg-layer-2 hover:border-primary/50 hover:bg-layer-hover"
          )}
          onClick={() => onEpisodeSelect(episode.id)}
        >
          <div className="text-left">
            <p className="text-sm font-medium">{episode.name}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {formatDuration(episode.duration)}
              {episode.status !== "completed" && (
                <span className="ml-2 text-yellow-600">• {episode.status}</span>
              )}
            </p>
          </div>
        </button>
      ))}
    </div>
  )
}