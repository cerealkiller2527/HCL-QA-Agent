import type { Dataset, Robot, Mission } from "@/lib/types/dataset"

export const mockDatasets: Dataset[] = [
  {
    id: "1",
    name: "Kitchen Tasks v2.1",
    description:
      "Comprehensive dataset for kitchen manipulation tasks including object grasping, pouring, and cleaning",
    robotType: "arm",
    createdAt: new Date("2024-01-15"),
    duration: 3600, // 1 hour
    frameCount: 108000,
    fileSize: 2.4 * 1024 * 1024 * 1024, // 2.4 GB
    status: "ready",
    tags: ["manipulation", "kitchen", "grasping"],
    // Optional fields that might come from backend
    episodeCount: 15,
    fps: 30,
    author: "Dr. Smith",
    likes: 42,
    downloads: 127,
    private: false,
  },
  {
    id: "2",
    name: "Navigation Dataset",
    description: "Mobile robot navigation in office environments with obstacle avoidance",
    robotType: "mobile",
    createdAt: new Date("2024-01-10"),
    duration: 7200, // 2 hours
    frameCount: 216000,
    fileSize: 5.1 * 1024 * 1024 * 1024, // 5.1 GB
    status: "ready",
    tags: ["navigation", "slam", "obstacle_avoidance"],
    episodeCount: 8,
    fps: 15,
    author: "Robotics Lab",
    downloads: 89,
    private: false,
  },
  {
    id: "3",
    name: "Assembly Line Demo",
    description: "Industrial robot performing assembly tasks with precision",
    robotType: "arm",
    createdAt: new Date("2024-01-08"),
    duration: 1800, // 30 minutes
    frameCount: 54000,
    fileSize: 1.2 * 1024 * 1024 * 1024, // 1.2 GB
    status: "processing",
    tags: ["assembly", "industrial", "precision"],
    fps: 25,
    author: "Industrial Automation Team",
    private: true,
  },
  {
    id: "4",
    name: "Human-Robot Interaction",
    description: "Dataset capturing natural human-robot collaborative tasks",
    robotType: "humanoid",
    createdAt: new Date("2024-01-05"),
    duration: 5400, // 1.5 hours
    frameCount: 162000,
    fileSize: 8.7 * 1024 * 1024 * 1024, // 8.7 GB
    status: "ready",
    tags: ["hri", "collaboration", "social"],
    episodeCount: 24,
    fps: 30,
    author: "HRI Research Group",
    likes: 156,
    downloads: 234,
    private: false,
  },
  {
    id: "5",
    name: "Warehouse Picking",
    description: "Automated picking and sorting in warehouse environment",
    robotType: "arm",
    createdAt: new Date("2024-01-03"),
    duration: 2700, // 45 minutes
    frameCount: 81000,
    fileSize: 0, // Test case for missing file size
    status: "error",
    tags: ["picking", "warehouse", "logistics"],
    fps: 20,
    author: "Logistics Team",
    private: false,
  },
  {
    id: "6",
    name: "Test Dataset - Empty Description",
    description: "", // Test case for empty description
    robotType: "custom",
    createdAt: new Date("2024-01-01"),
    duration: 300,
    frameCount: 9000,
    fileSize: 0, // Test case for zero file size
    status: "ready",
    tags: ["test"],
  },
  {
    id: "7",
    name: "Multilingual Conversational AI Dataset with Very Long Name and Description Overflow Test",
    description: "This is an extremely comprehensive multilingual conversational AI dataset that contains thousands of hours of natural language conversations across multiple languages including English, Spanish, French, German, Chinese, Japanese, Korean, Arabic, Hindi, Portuguese, Russian, and many other languages. The dataset was carefully curated to include diverse conversational patterns, cultural contexts, regional dialects, and domain-specific terminology covering topics like healthcare, technology, education, entertainment, business, science, and everyday social interactions. Each conversation includes detailed annotations for sentiment analysis, intent classification, entity recognition, and contextual understanding to support advanced natural language processing research and development.",
    robotType: "humanoid",
    createdAt: new Date("2024-02-01"),
    duration: 18000, // 5 hours
    frameCount: 324000,
    fileSize: 12.5 * 1024 * 1024 * 1024, // 12.5 GB
    status: "ready",
    tags: ["nlp", "conversation", "multilingual", "ai"],
    episodeCount: 45,
    fps: 18,
    author: "AI Research Consortium",
    likes: 892,
    downloads: 1247,
    private: false,
    // HuggingFace metadata fields for testing
    languages: ["en", "es", "fr", "de", "zh", "ja", "ko", "ar", "hi", "pt", "ru"],
    taskCategories: ["text-classification", "question-answering", "conversational"],
    taskIds: ["sentiment-analysis", "intent-classification", "entity-recognition"],
    sizeCategories: "10M<n<100M",
    multilinguality: "multilingual",
    languageCreators: ["crowdsourced", "expert-generated"],
    license: "cc-by-4.0",
    prettyName: "Multilingual Conversational AI Dataset",
    citation: "Smith, J., et al. (2024). Multilingual Conversational AI Dataset. Proceedings of AI Conference.",
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
