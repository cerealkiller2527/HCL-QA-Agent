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
}

export interface DatasetMetadata {
  recordingEnvironment: string
  robotModel: string
  taskDescription: string
  recordingQuality: "low" | "medium" | "high"
  annotations?: string[]
}

export interface SensorConfig {
  id: string
  name: string
  type: "camera" | "lidar" | "imu" | "force" | "joint_position" | "custom"
  frequency: number // Hz
  enabled: boolean
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
}

export interface RobotAction {
  type: "move" | "grasp" | "release" | "wait" | "custom"
  parameters: Record<string, any>
  duration: number
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
}
