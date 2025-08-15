import type { Dataset, Robot, Mission } from "@/lib/types/dataset"

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
      recordingConditions: {
        lighting: "artificial",
        temperature: 22,
        humidity: 45,
      },
      collaborators: ["Dr. Smith", "Lab Assistant A"],
      version: "2.1.0",
    },
    sensors: [
      {
        id: "cam_1",
        name: "RGB Camera",
        type: "camera",
        frequency: 30,
        enabled: true,
        resolution: "1920x1080",
        accuracy: 95,
      },
      {
        id: "cam_2",
        name: "Depth Camera",
        type: "camera",
        frequency: 30,
        enabled: true,
        resolution: "640x480",
        accuracy: 92,
      },
      {
        id: "joint_pos",
        name: "Joint Positions",
        type: "joint_position",
        frequency: 100,
        enabled: true,
        accuracy: 99.5,
      },
      { id: "force_sensor", name: "Force/Torque", type: "force", frequency: 100, enabled: true, accuracy: 98 },
    ],
    metrics: {
      averageFrameRate: 29.8,
      droppedFrames: 127,
      dataIntegrity: 99.2,
      compressionRatio: 0.65,
      processingTime: 1847,
      qualityScore: 94,
    },
    validation: {
      isValid: true,
      errors: [],
      warnings: ["Minor lighting variations detected"],
      completeness: 99.8,
      lastValidated: new Date("2024-01-21"),
    },
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
      recordingConditions: {
        lighting: "mixed",
        temperature: 24,
        humidity: 38,
      },
      version: "1.0.0",
    },
    sensors: [
      { id: "lidar", name: "LiDAR", type: "lidar", frequency: 10, enabled: true, accuracy: 99 },
      { id: "rgb_cam", name: "RGB Camera", type: "camera", frequency: 15, enabled: true, resolution: "1280x720" },
      { id: "imu", name: "IMU", type: "imu", frequency: 50, enabled: true, accuracy: 96 },
    ],
    metrics: {
      averageFrameRate: 14.9,
      droppedFrames: 45,
      dataIntegrity: 99.7,
      compressionRatio: 0.72,
      processingTime: 3421,
      qualityScore: 96,
    },
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
      version: "1.0.0",
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
      version: "1.2.0",
    },
    sensors: [
      { id: "rgb_head", name: "Head Camera", type: "camera", frequency: 30, enabled: true },
      { id: "depth_chest", name: "Chest Depth Sensor", type: "camera", frequency: 30, enabled: true },
      { id: "microphone", name: "Audio", type: "audio", frequency: 44100, enabled: true },
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
      version: "1.0.0",
    },
    sensors: [
      { id: "wrist_cam", name: "Wrist Camera", type: "camera", frequency: 20, enabled: true },
      { id: "force_wrist", name: "Wrist Force Sensor", type: "force", frequency: 100, enabled: true },
    ],
    validation: {
      isValid: false,
      errors: ["Sensor calibration failure", "Data corruption detected"],
      warnings: [],
      completeness: 67.3,
      lastValidated: new Date("2024-01-04"),
    },
  },
]

export const mockRobots: Robot[] = [
  {
    id: "robot_001",
    name: "ARM-001",
    type: "arm",
    model: "UR5e",
    status: "online",
    location: "Kitchen Lab A",
    lastSeen: new Date(),
    capabilities: ["manipulation", "grasping", "precision_tasks"],
    currentTask: "Kitchen Tasks Recording",
  },
  {
    id: "robot_002",
    name: "MOBILE-001",
    type: "mobile",
    model: "TurtleBot3",
    status: "online",
    location: "Office Floor 3",
    lastSeen: new Date(Date.now() - 300000), // 5 minutes ago
    capabilities: ["navigation", "mapping", "obstacle_avoidance"],
    batteryLevel: 87,
  },
  {
    id: "robot_003",
    name: "PEPPER-001",
    type: "humanoid",
    model: "Pepper",
    status: "maintenance",
    location: "HRI Lab",
    lastSeen: new Date(Date.now() - 3600000), // 1 hour ago
    capabilities: ["interaction", "speech", "gesture_recognition"],
    batteryLevel: 45,
  },
]

export const mockMissions: Mission[] = [
  {
    id: "mission_001",
    name: "Kitchen Data Collection",
    description: "Collect manipulation data for kitchen tasks",
    robotId: "robot_001",
    status: "running",
    priority: "high",
    createdAt: new Date(Date.now() - 7200000), // 2 hours ago
    startedAt: new Date(Date.now() - 3600000), // 1 hour ago
    progress: 67,
    estimatedDuration: 5400, // 1.5 hours
    tasks: [
      {
        id: "task_001",
        name: "Setup Recording",
        type: "setup",
        parameters: { template: "kitchen_manipulation" },
        status: "completed",
        startTime: new Date(Date.now() - 3600000),
        endTime: new Date(Date.now() - 3300000),
        duration: 300,
      },
      {
        id: "task_002",
        name: "Record Grasping Tasks",
        type: "recording",
        parameters: { duration: 1800 },
        status: "running",
        startTime: new Date(Date.now() - 3300000),
      },
    ],
  },
  {
    id: "mission_002",
    name: "Office Navigation Mapping",
    description: "Create detailed map of office environment",
    robotId: "robot_002",
    status: "completed",
    priority: "medium",
    createdAt: new Date(Date.now() - 86400000), // 1 day ago
    startedAt: new Date(Date.now() - 82800000),
    completedAt: new Date(Date.now() - 79200000),
    progress: 100,
    estimatedDuration: 3600,
    actualDuration: 3600,
    tasks: [
      {
        id: "task_003",
        name: "Initial Mapping",
        type: "mapping",
        parameters: { area: "office_floor_3" },
        status: "completed",
        duration: 3600,
      },
    ],
  },
]
