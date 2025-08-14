import type { Dataset } from "@/lib/types/dataset"

export const mockDatasets: Dataset[] = [
  {
    id: "1",
    name: "Kitchen Tasks v2.1",
    description:
      "Comprehensive dataset for kitchen manipulation tasks including object grasping, pouring, and cleaning",
    robotType: "arm",
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-20"),
    duration: 3600, // 1 hour
    frameCount: 108000,
    fileSize: 2.4 * 1024 * 1024 * 1024, // 2.4 GB
    status: "ready",
    tags: ["manipulation", "kitchen", "grasping"],
    metadata: {
      recordingEnvironment: "Kitchen Lab A",
      robotModel: "UR5e",
      taskDescription: "Object manipulation in kitchen environment",
      recordingQuality: "high",
      annotations: ["object_labels", "grasp_points", "trajectories"],
    },
    sensors: [
      { id: "cam_1", name: "RGB Camera", type: "camera", frequency: 30, enabled: true },
      { id: "cam_2", name: "Depth Camera", type: "camera", frequency: 30, enabled: true },
      { id: "joint_pos", name: "Joint Positions", type: "joint_position", frequency: 100, enabled: true },
      { id: "force_sensor", name: "Force/Torque", type: "force", frequency: 100, enabled: true },
    ],
  },
  {
    id: "2",
    name: "Navigation Dataset",
    description: "Mobile robot navigation in office environments with obstacle avoidance",
    robotType: "mobile",
    createdAt: new Date("2024-01-10"),
    updatedAt: new Date("2024-01-18"),
    duration: 7200, // 2 hours
    frameCount: 216000,
    fileSize: 5.1 * 1024 * 1024 * 1024, // 5.1 GB
    status: "ready",
    tags: ["navigation", "slam", "obstacle_avoidance"],
    metadata: {
      recordingEnvironment: "Office Floor 3",
      robotModel: "TurtleBot3",
      taskDescription: "Autonomous navigation with dynamic obstacles",
      recordingQuality: "high",
    },
    sensors: [
      { id: "lidar", name: "LiDAR", type: "lidar", frequency: 10, enabled: true },
      { id: "rgb_cam", name: "RGB Camera", type: "camera", frequency: 15, enabled: true },
      { id: "imu", name: "IMU", type: "imu", frequency: 50, enabled: true },
    ],
  },
  {
    id: "3",
    name: "Assembly Line Demo",
    description: "Industrial robot performing assembly tasks with precision",
    robotType: "arm",
    createdAt: new Date("2024-01-08"),
    updatedAt: new Date("2024-01-08"),
    duration: 1800, // 30 minutes
    frameCount: 54000,
    fileSize: 1.2 * 1024 * 1024 * 1024, // 1.2 GB
    status: "processing",
    tags: ["assembly", "industrial", "precision"],
    metadata: {
      recordingEnvironment: "Factory Floor B",
      robotModel: "KUKA KR6",
      taskDescription: "Automated assembly of electronic components",
      recordingQuality: "medium",
    },
    sensors: [
      { id: "cam_overhead", name: "Overhead Camera", type: "camera", frequency: 25, enabled: true },
      { id: "joint_sensors", name: "Joint Encoders", type: "joint_position", frequency: 200, enabled: true },
    ],
  },
  {
    id: "4",
    name: "Human-Robot Interaction",
    description: "Dataset capturing natural human-robot collaborative tasks",
    robotType: "humanoid",
    createdAt: new Date("2024-01-05"),
    updatedAt: new Date("2024-01-12"),
    duration: 5400, // 1.5 hours
    frameCount: 162000,
    fileSize: 8.7 * 1024 * 1024 * 1024, // 8.7 GB
    status: "ready",
    tags: ["hri", "collaboration", "social"],
    metadata: {
      recordingEnvironment: "HRI Lab",
      robotModel: "Pepper",
      taskDescription: "Collaborative task execution with human partners",
      recordingQuality: "high",
      annotations: ["human_poses", "interaction_events", "speech_transcripts"],
    },
    sensors: [
      { id: "rgb_head", name: "Head Camera", type: "camera", frequency: 30, enabled: true },
      { id: "depth_chest", name: "Chest Depth Sensor", type: "camera", frequency: 30, enabled: true },
      { id: "microphone", name: "Audio", type: "custom", frequency: 44100, enabled: true },
    ],
  },
  {
    id: "5",
    name: "Warehouse Picking",
    description: "Automated picking and sorting in warehouse environment",
    robotType: "arm",
    createdAt: new Date("2024-01-03"),
    updatedAt: new Date("2024-01-03"),
    duration: 2700, // 45 minutes
    frameCount: 81000,
    fileSize: 3.2 * 1024 * 1024 * 1024, // 3.2 GB
    status: "error",
    tags: ["picking", "warehouse", "logistics"],
    metadata: {
      recordingEnvironment: "Warehouse A",
      robotModel: "ABB IRB 1200",
      taskDescription: "Automated item picking and bin sorting",
      recordingQuality: "medium",
    },
    sensors: [
      { id: "wrist_cam", name: "Wrist Camera", type: "camera", frequency: 20, enabled: true },
      { id: "force_wrist", name: "Wrist Force Sensor", type: "force", frequency: 100, enabled: true },
    ],
  },
]
