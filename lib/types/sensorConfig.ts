export interface SensorConfig {
  id: string
  name: string
  type: "camera" | "lidar" | "imu" | "force" | "joint_position" | "custom"
  frequency: number // Hz
  enabled: boolean
}
