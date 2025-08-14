import type { SensorConfig } from "./sensorConfig" // Assuming SensorConfig is declared in another file

export interface RecordingTemplate {
  id: string
  name: string
  description: string
  robotType: "arm" | "mobile" | "humanoid" | "custom"
  sensors: SensorConfig[]
  settings: RecordingSettings
  createdAt: Date
}

export interface RecordingSettings {
  frameRate: number
  duration?: number // Optional max duration in seconds
  autoStop: boolean
  qualityThreshold: number
  compressionLevel: "none" | "low" | "medium" | "high"
  storageLocation: string
}

export interface RecordingMetrics {
  frameRate: number
  droppedFrames: number
  dataRate: number // MB/s
  storageUsed: number // bytes
  qualityScore: number // 0-100
  sensorHealth: Record<string, "good" | "warning" | "error">
}

export interface LiveSensorReading {
  sensorId: string
  timestamp: number
  value: any
  quality: "good" | "warning" | "error"
}
