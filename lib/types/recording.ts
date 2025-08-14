import type { SensorConfig } from "./dataset"

export interface RecordingTemplate {
  id: string
  name: string
  description: string
  robotType: "arm" | "mobile" | "humanoid" | "custom"
  sensors: SensorConfig[]
  settings: RecordingSettings
  createdAt: Date
  usageCount?: number
  lastUsed?: Date
  isActive: boolean
}

export interface RecordingSettings {
  frameRate: number
  duration?: number // Optional max duration in seconds
  autoStop: boolean
  qualityThreshold: number
  compressionLevel: "none" | "low" | "medium" | "high"
  storageLocation: string
  bufferSize: number // MB
  maxFileSize: number // MB
  backupEnabled: boolean
  encryptionEnabled: boolean
}

export interface TriggerCondition {
  type: "sensor_threshold" | "time_based" | "event_based"
  sensorId?: string
  threshold?: number
  schedule?: string // cron expression
  eventType?: string
}

export interface RecordingMetrics {
  frameRate: number
  droppedFrames: number
  dataRate: number // MB/s
  storageUsed: number // bytes
  qualityScore: number // 0-100
  uptime: number // seconds
  errorCount: number
  warningCount: number
  lastError?: string
  performanceScore: number // 0-100
}

export type SensorHealth = Record<string, "good" | "warning" | "error">

export interface LiveSensorReading {
  sensorId: string
  timestamp: number
  value: any
  quality: "good" | "warning" | "error"
  latency: number // ms
  confidence?: number // 0-1
  calibrationStatus: "calibrated" | "needs_calibration" | "error"
}

export interface SystemMetrics {
  cpuUsage: number // 0-100
  memoryUsage: number // 0-100
  diskUsage: number // 0-100
  networkLatency: number // ms
  activeConnections: number
  timestamp: Date
}

export interface AnalyticsData {
  totalDatasets: number
  totalRecordingTime: number // seconds
  totalStorageUsed: number // bytes
  averageQualityScore: number
  mostUsedRobotType: string
  recentActivity: ActivityLog[]
}

export interface ActivityLog {
  id: string
  timestamp: Date
  type: "dataset_created" | "recording_started" | "recording_stopped" | "error" | "system_event"
  description: string
  userId?: string
  robotId?: string
  datasetId?: string
}
