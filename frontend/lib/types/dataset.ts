export interface Dataset {
  id: string
  name: string
  description: string
  robotType: "arm" | "mobile" | "humanoid" | "custom"
  createdAt: Date
  duration: number // in seconds
  frameCount: number
  fileSize: number // in bytes
  status: "recording" | "processing" | "ready" | "error"
  tags: string[]
  
  // Optional fields that may be available from backend
  episodeCount?: number
  fps?: number
  author?: string
  likes?: number
  downloads?: number
  private?: boolean
  
  // HuggingFace metadata fields
  languages?: string[] // Dataset languages
  taskCategories?: string[] // Task categories like "text-classification"
  taskIds?: string[] // Specific tasks like "sentiment-analysis"
  sizeCategories?: string // Size category like "100K<n<1M"
  multilinguality?: "monolingual" | "multilingual" | "translation" // If dataset is multilingual
  languageCreators?: string[] // How the data was created
  paperswithcodeId?: string // Link to Papers with Code
  prettyName?: string // Formatted display name
  license?: string // Dataset license info
  citation?: string // Citation information
}

// Episode-related interfaces for detailed dataset view
export interface Episode {
  id: number
  name: string
  duration: number
  status: string
  tasks: string[]
  length?: number
}

export interface VideoUrl {
  camera: string
  url: string
  resolution?: string
  fps?: number
}

export interface EpisodeData {
  episode: Episode
  videoUrls: VideoUrl[]
  telemetryData: Record<string, any>[]
  cameras: Record<string, string>[]
}

// Recording session interface for live recording features
export interface RecordingSession {
  id: string
  datasetId: string
  startTime: Date
  endTime?: Date
  status: "active" | "paused" | "stopped" | "error"
  frameRate: number
  currentFrame: number
  errors?: string[]
}

export interface Robot {
  id: string
  name: string
  type: "arm" | "mobile" | "humanoid" | "custom"
  model: string
  status: "online" | "offline" | "maintenance" | "error"
  location: string
  lastSeen: Date
  capabilities: string[]
  batteryLevel?: number
  currentTask?: string
}

export interface Mission {
  id: string
  name: string
  description: string
  robotId: string
  status: "pending" | "running" | "completed" | "failed" | "cancelled"
  priority: "low" | "medium" | "high" | "critical"
  createdAt: Date
  startedAt?: Date
  completedAt?: Date
  progress: number // 0-100
  estimatedDuration: number // seconds
  actualDuration?: number // seconds
  tasks: Task[]
}

export interface Task {
  id: string
  name: string
  type: string
  parameters: Record<string, any>
  status: "pending" | "running" | "completed" | "failed"
  startTime?: Date
  endTime?: Date
  duration?: number
}
