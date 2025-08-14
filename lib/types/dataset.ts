export interface Dataset {
  id: string
  name: string
  description: string
  robotType: "arm" | "mobile" | "humanoid" | "custom"
  createdAt: Date
  updatedAt: Date
  duration: number // in seconds
  frameCount: number
  fileSize: number // in bytes
  status: "recording" | "processing" | "ready" | "error"
  tags: string[]
  metadata: DatasetMetadata
  sensors: SensorConfig[]
  metrics?: DatasetMetrics
  validation?: ValidationResults
}

export interface DatasetMetadata {
  recordingEnvironment: string
  robotModel: string
  taskDescription: string
  recordingQuality: "low" | "medium" | "high"
  annotations?: string[]
  recordingConditions?: {
    lighting: "natural" | "artificial" | "mixed"
    temperature: number
    humidity: number
  }
  collaborators?: string[]
  version: string
}

export interface SensorConfig {
  id: string
  name: string
  type: "camera" | "lidar" | "imu" | "force" | "joint_position" | "audio" | "custom"
  frequency: number // Hz
  enabled: boolean
  resolution?: string
  accuracy?: number
  calibrationDate?: Date
}

export interface DatasetMetrics {
  averageFrameRate: number
  droppedFrames: number
  dataIntegrity: number // 0-100 percentage
  compressionRatio: number
  processingTime: number // seconds
  qualityScore: number // 0-100
}

export interface ValidationResults {
  isValid: boolean
  errors: string[]
  warnings: string[]
  completeness: number // 0-100 percentage
  lastValidated: Date
}

export interface DataPoint {
  timestamp: number
  frameIndex: number
  robotState: RobotState
  sensorReadings: Record<string, any>
  actions: RobotAction[]
}

export interface RobotState {
  jointPositions: number[]
  endEffectorPose: {
    position: [number, number, number]
    orientation: [number, number, number, number] // quaternion
  }
  velocity: number[]
  torque: number[]
  temperature?: number[]
  batteryLevel?: number
  errorFlags?: string[]
}

export interface RobotAction {
  type: "move" | "grasp" | "release" | "wait" | "custom"
  parameters: Record<string, any>
  duration: number
  success?: boolean
  confidence?: number
}

export interface RecordingSession {
  id: string
  datasetId: string
  startTime: Date
  endTime?: Date
  status: "active" | "paused" | "stopped" | "error"
  frameRate: number
  activeSensors: string[]
  currentFrame: number
  metrics: {
    dataRate: number // MB/s
    storageUsed: number // bytes
    qualityScore: number
  }
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
