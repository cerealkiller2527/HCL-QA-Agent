import { z } from 'zod';

/**
 * Domain Schemas
 * These schemas match the exact Pydantic models from the backend
 */

// Enums matching backend exactly
export const RobotTypeEnum = z.enum([
  'arm', 'mobile', 'humanoid', 'so100', 'so101', 'bimanual', 'custom',
  'aloha', 'koch', 'lekiwi', 'viperx', 'stretch3', 'hope_jr'
]);

export const DatasetStatusEnum = z.enum(['ready', 'processing', 'recording', 'error']);

export const MultilingualityEnum = z.enum(['monolingual', 'multilingual', 'translation']);

export const SensorTypeEnum = z.enum([
  'force_torque', 'imu', 'pressure', 'proprioception', 'vision', 
  'depth', 'audio', 'tactile', 'custom'
]);

export const FeatureCategoryEnum = z.enum(['state', 'action', 'observation', 'sensor', 'environment']);

// Core Dataset Schema (matches DatasetResponse from backend)
export const DatasetSchema = z.object({
  // Required fields
  id: z.string(),
  name: z.string(),
  description: z.string(),
  tags: z.array(z.string()),
  createdAt: z.string(),
  frameCount: z.number().min(0),
  duration: z.number().min(0),
  fileSize: z.number().min(0),
  status: DatasetStatusEnum,
  robotType: RobotTypeEnum,
  
  // Optional fields that may be available
  episodeCount: z.number().nullable().optional(),
  fps: z.number().nullable().optional(),
  author: z.string().nullable().optional(),
  likes: z.number().nullable().optional(),
  downloads: z.number().nullable().optional(),
  private: z.boolean().nullable().optional(),
  
  // HuggingFace metadata fields
  languages: z.array(z.string()).nullable().optional(),
  taskCategories: z.array(z.string()).nullable().optional(),
  taskIds: z.array(z.string()).nullable().optional(),
  sizeCategories: z.string().nullable().optional(),
  multilinguality: MultilingualityEnum.nullable().optional(),
  languageCreators: z.array(z.string()).nullable().optional(),
  paperswithcodeId: z.string().nullable().optional(),
  prettyName: z.string().nullable().optional(),
  license: z.string().nullable().optional(),
  citation: z.string().nullable().optional(),
});

// Feature Info Schema (matches FeatureInfo from backend)
export const FeatureInfoSchema = z.object({
  name: z.string(),
  dtype: z.string(),
  shape: z.array(z.number()),
  names: z.array(z.string()).nullable().optional(),
  feature_type: z.string(),
});

// Video Info Schema (matches VideoInfo from backend)
export const VideoInfoSchema = z.object({
  codec: z.string().nullable().optional(),
  fps: z.number().nullable().optional(),
  resolution: z.string().nullable().optional(),
  pixel_format: z.string().nullable().optional(),
  is_depth: z.boolean(),
});

// Extended Dataset Detail Schema (matches DatasetDetailResponse from backend)
export const DatasetDetailSchema = DatasetSchema.extend({
  features: z.union([
    z.record(FeatureInfoSchema),
    z.array(z.string()),
    z.array(FeatureInfoSchema)
  ]).nullable().optional(),
  videoKeys: z.array(z.string()).nullable().optional(),
  sensors: z.array(z.record(z.any())).nullable().optional(),
  metadata: z.record(z.any()).nullable().optional(),
  
  // Enhanced LeRobot fields
  codebaseVersion: z.string().nullable().optional(),
  totalChunks: z.number().nullable().optional(),
  chunksSize: z.number().nullable().optional(),
  dataPath: z.string().nullable().optional(),
  videoPath: z.string().nullable().optional(),
  splits: z.record(z.string()).nullable().optional(),
  multiRobot: z.boolean().default(false),
  videoInfo: z.record(VideoInfoSchema).nullable().optional(),
});

// Episode Schema (matches EpisodeResponse from backend)
export const EpisodeSchema = z.object({
  id: z.number(),
  name: z.string(),
  duration: z.number().min(0),
  status: z.string(),
  tasks: z.array(z.string()),
  length: z.number().optional(),
  frame_count: z.number().optional(),
});

// Video URL Schema (matches enhanced video URLs from backend)
export const VideoUrlSchema = z.object({
  camera_id: z.string(),
  camera_name: z.string(),
  url: z.string(),
  direct_access: z.boolean(),
  metadata: z.object({
    resolution: z.object({
      width: z.number(),
      height: z.number(),
      channels: z.number(),
      formatted: z.string(),
    }),
    fps: z.number(),
    codec: z.string(),
    pixel_format: z.string(),
    container_format: z.string(),
    is_depth: z.boolean(),
    file_size_bytes: z.number(),
    file_size_formatted: z.string(),
    bitrate_bps: z.number(),
    bitrate_mbps: z.number(),
    duration_seconds: z.number(),
  }),
  streaming_info: z.object({
    supports_range_requests: z.boolean(),
    recommended_preload: z.string(),
    cors_enabled: z.boolean(),
    quality_adaptive: z.boolean(),
    seek_support: z.boolean(),
  }),
});

// Camera Info Schema
export const CameraInfoSchema = z.object({
  id: z.string(),
  name: z.string(),
});

// Episode Data Schema (matches EpisodeDataResponse from backend)
export const EpisodeDataSchema = z.object({
  episode: EpisodeSchema,
  videoUrls: z.array(VideoUrlSchema),
  telemetryData: z.array(z.record(z.any())),
  cameras: z.array(CameraInfoSchema),
});

// User Info Schema (matches UserInfoResponse from backend)
export const UserInfoSchema = z.object({
  username: z.string(),
  fullname: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
  organizations: z.array(z.record(z.any())),
});

// Telemetry Schemas (matches telemetry.py schemas)
export const TelemetryPointSchema = z.object({
  time: z.number(),
  timestamp: z.number().optional(),
  frame_index: z.number().optional(),
}).catchall(z.any()); // Allow additional dynamic fields

export const FeatureStatisticsSchema = z.object({
  min: z.union([z.number(), z.array(z.number())]),
  max: z.union([z.number(), z.array(z.number())]),
  mean: z.union([z.number(), z.array(z.number())]),
  std: z.union([z.number(), z.array(z.number())]),
  count: z.number(),
});

export const EnhancedTelemetryDataSchema = z.object({
  episode_id: z.number(),
  duration: z.number(),
  fps: z.number(),
  timestamps: z.array(z.number()),
  states: z.record(z.union([z.array(z.number()), z.array(z.array(z.number()))])),
  actions: z.record(z.union([z.array(z.number()), z.array(z.array(z.number()))])),
  observations: z.record(z.union([z.array(z.number()), z.array(z.array(z.number()))])),
  sensors: z.record(z.union([z.array(z.number()), z.array(z.array(z.number()))])).optional(),
  feature_names: z.record(z.array(z.string())),
  feature_units: z.record(z.string()).optional(),
  feature_types: z.record(z.string()),
  multi_robot_data: z.record(z.any()).optional(),
  robot_configs: z.record(z.any()).optional(),
});

export const SensorReadingSchema = z.object({
  sensor_id: z.string(),
  sensor_type: SensorTypeEnum,
  timestamp: z.number(),
  value: z.union([z.number(), z.array(z.number())]),
  quality: z.string().optional(),
  unit: z.string().optional(),
});

export const TelemetryQueryParamsSchema = z.object({
  start_time: z.number().optional(),
  end_time: z.number().optional(),
  features: z.array(z.string()).optional(),
  downsample: z.number().optional(),
  max_points: z.number().optional(),
});

// Type inference for TypeScript
export type RobotType = z.infer<typeof RobotTypeEnum>;
export type DatasetStatus = z.infer<typeof DatasetStatusEnum>;
export type Dataset = z.infer<typeof DatasetSchema>;
export type DatasetDetail = z.infer<typeof DatasetDetailSchema>;
export type Episode = z.infer<typeof EpisodeSchema>;
export type EpisodeData = z.infer<typeof EpisodeDataSchema>;
export type VideoUrl = z.infer<typeof VideoUrlSchema>;
export type CameraInfo = z.infer<typeof CameraInfoSchema>;
export type UserInfo = z.infer<typeof UserInfoSchema>;
export type TelemetryPoint = z.infer<typeof TelemetryPointSchema>;
export type EnhancedTelemetryData = z.infer<typeof EnhancedTelemetryDataSchema>;
export type FeatureInfo = z.infer<typeof FeatureInfoSchema>;
export type VideoInfo = z.infer<typeof VideoInfoSchema>;
export type SensorReading = z.infer<typeof SensorReadingSchema>;
export type TelemetryQueryParams = z.infer<typeof TelemetryQueryParamsSchema>;
export type FeatureStatistics = z.infer<typeof FeatureStatisticsSchema>;