import type { RecordingTemplate } from "@/lib/types/recording"

export const recordingTemplates: RecordingTemplate[] = [
  {
    id: "kitchen_manipulation",
    name: "Kitchen Manipulation",
    description: "Standard template for kitchen task recording with arm robots",
    robotType: "arm",
    createdAt: new Date("2024-01-01"),
    sensors: [
      { id: "rgb_cam", name: "RGB Camera", type: "camera", frequency: 30, enabled: true },
      { id: "depth_cam", name: "Depth Camera", type: "camera", frequency: 30, enabled: true },
      { id: "joint_pos", name: "Joint Positions", type: "joint_position", frequency: 100, enabled: true },
      { id: "force_sensor", name: "Force/Torque", type: "force", frequency: 100, enabled: true },
    ],
    settings: {
      frameRate: 30,
      autoStop: false,
      qualityThreshold: 85,
      compressionLevel: "medium",
      storageLocation: "/datasets/kitchen",
    },
  },
  {
    id: "navigation_mapping",
    name: "Navigation & Mapping",
    description: "Template for mobile robot navigation and SLAM data collection",
    robotType: "mobile",
    createdAt: new Date("2024-01-01"),
    sensors: [
      { id: "lidar", name: "LiDAR", type: "lidar", frequency: 10, enabled: true },
      { id: "rgb_cam", name: "RGB Camera", type: "camera", frequency: 15, enabled: true },
      { id: "imu", name: "IMU", type: "imu", frequency: 50, enabled: true },
    ],
    settings: {
      frameRate: 15,
      duration: 3600, // 1 hour max
      autoStop: true,
      qualityThreshold: 90,
      compressionLevel: "low",
      storageLocation: "/datasets/navigation",
    },
  },
  {
    id: "human_interaction",
    name: "Human-Robot Interaction",
    description: "Template for recording human-robot collaborative tasks",
    robotType: "humanoid",
    createdAt: new Date("2024-01-01"),
    sensors: [
      { id: "rgb_head", name: "Head Camera", type: "camera", frequency: 30, enabled: true },
      { id: "depth_chest", name: "Chest Depth Sensor", type: "camera", frequency: 30, enabled: true },
      { id: "microphone", name: "Audio", type: "custom", frequency: 44100, enabled: true },
    ],
    settings: {
      frameRate: 30,
      autoStop: false,
      qualityThreshold: 80,
      compressionLevel: "high",
      storageLocation: "/datasets/hri",
    },
  },
]
