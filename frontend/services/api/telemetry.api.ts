import { apiClient } from '../config/apiClient';
import { 
  parseBackendResponse,
  ApiError 
} from '../utils/responseParser';
import { 
  EnhancedTelemetryDataSchema,
  TelemetryQueryParamsSchema,
  type EnhancedTelemetryData,
  type TelemetryQueryParams,
  type TelemetryPoint
} from '../schemas/domain.schema';
import { logError } from '../utils/errorHandler';
import { z } from 'zod';

/**
 * Telemetry API Functions
 * Handles telemetry data fetching and transformation
 */

export const telemetryApi = {
  /**
   * Fetch telemetry data for an episode
   */
  async fetchTelemetry(
    datasetId: string, 
    episodeId: number,
    params?: Partial<TelemetryQueryParams>
  ): Promise<{ 
    data: TelemetryPoint[]; 
    meta: Record<string, any> 
  }> {
    try {
      const [owner, ...nameParts] = datasetId.split('/');
      const datasetName = nameParts.join('/');
      
      if (!owner || !datasetName) {
        throw new ApiError(
          'INVALID_DATASET_ID',
          'Dataset ID must be in format "owner/dataset-name"'
        );
      }

      if (episodeId < 0) {
        throw new ApiError(
          'INVALID_EPISODE_ID',
          'Episode ID must be a non-negative number'
        );
      }

      // Validate query parameters
      const validatedParams = params ? TelemetryQueryParamsSchema.partial().parse(params) : {};
      
      // Convert features array to comma-separated string if provided
      const queryParams: any = { ...validatedParams };
      if (queryParams.features && Array.isArray(queryParams.features)) {
        queryParams.features = queryParams.features.join(',');
      }
      
      const { data } = await apiClient.get(
        `/api/v1/datasets/${encodeURIComponent(owner)}/${encodeURIComponent(datasetName)}/episodes/${episodeId}/telemetry`,
        { params: queryParams }
      );
      
      const result = parseBackendResponse(data, z.array(z.record(z.any())));
      
      // Transform the data into TelemetryPoint format
      const telemetryPoints: TelemetryPoint[] = result.data.map((point: any) => ({
        time: point.time || point.timestamp || 0,
        timestamp: point.timestamp,
        frame_index: point.frame_index,
        ...point // Include all other dynamic fields
      }));
      
      return {
        data: telemetryPoints,
        meta: result.meta || {}
      };
    } catch (error) {
      logError(error, `fetchTelemetry(${datasetId}, ${episodeId})`);
      throw error;
    }
  },

  /**
   * Fetch raw telemetry data without transformation
   */
  async fetchRawTelemetry(
    datasetId: string, 
    episodeId: number,
    format: 'json' | 'csv' = 'json'
  ): Promise<any> {
    try {
      const [owner, ...nameParts] = datasetId.split('/');
      const datasetName = nameParts.join('/');
      
      const { data } = await apiClient.get(
        `/api/v1/datasets/${encodeURIComponent(owner)}/${encodeURIComponent(datasetName)}/episodes/${episodeId}/telemetry`,
        { 
          params: { format },
          // For CSV, we want raw response
          responseType: format === 'csv' ? 'text' : 'json'
        }
      );
      
      if (format === 'csv') {
        return data; // Return raw CSV string
      }
      
      // For JSON, parse the backend response
      const result = parseBackendResponse(data, z.any());
      return result.data;
    } catch (error) {
      logError(error, `fetchRawTelemetry(${datasetId}, ${episodeId}, ${format})`);
      throw error;
    }
  },

  /**
   * Estimate memory usage for episode telemetry data
   */
  async estimateMemoryUsage(
    datasetId: string, 
    episodeId: number,
    features?: string[]
  ): Promise<{
    estimated_size_mb: number;
    estimated_points: number;
    features_count: number;
    recommendation: string;
  }> {
    try {
      const [owner, ...nameParts] = datasetId.split('/');
      const datasetName = nameParts.join('/');
      
      const params: any = {};
      if (features && features.length > 0) {
        params.features = features.join(',');
      }
      
      const { data } = await apiClient.get(
        `/api/v1/datasets/${encodeURIComponent(owner)}/${encodeURIComponent(datasetName)}/episodes/${episodeId}/memory-estimate`,
        { params }
      );
      
      return data;
    } catch (error) {
      logError(error, `estimateMemoryUsage(${datasetId}, ${episodeId})`);
      throw error;
    }
  },

  /**
   * Fetch enhanced telemetry data with complete statistics
   */
  async fetchEnhancedTelemetry(
    datasetId: string, 
    episodeId: number
  ): Promise<EnhancedTelemetryData> {
    try {
      const [owner, ...nameParts] = datasetId.split('/');
      const datasetName = nameParts.join('/');
      
      const { data } = await apiClient.get(
        `/api/v1/datasets/${encodeURIComponent(owner)}/${encodeURIComponent(datasetName)}/episodes/${episodeId}/telemetry`,
        { params: { format: 'json', max_points: 1000 } }
      );
      
      // Backend returns success_response() format: { success: true, data: [...], meta: {...} }
      const result = parseBackendResponse(data, z.array(z.record(z.any())));
      const telemetryPoints = result.data;
      
      // Transform backend array format to enhanced columnar format
      const enhancedData: EnhancedTelemetryData = {
        episode_id: episodeId,
        duration: 0,
        fps: 30,
        timestamps: [],
        states: {},
        actions: {},
        observations: {},
        feature_names: {},
        feature_types: {},
      };
      
      if (Array.isArray(telemetryPoints) && telemetryPoints.length > 0) {
        // Extract timestamps
        enhancedData.timestamps = telemetryPoints.map((point: any) => point.time || point.timestamp || 0);
        
        // Calculate duration
        const timestamps = enhancedData.timestamps;
        if (timestamps.length > 1) {
          enhancedData.duration = Math.max(...timestamps) - Math.min(...timestamps);
          enhancedData.fps = timestamps.length / enhancedData.duration;
        }
        
        // Group features by category following LeRobot's approach
        const samplePoint = telemetryPoints[0];
        Object.keys(samplePoint).forEach(key => {
          if (key === 'time' || key === 'timestamp' || key === 'frame_index') return;
          
          // Extract values for this feature across all points
          const values = telemetryPoints.map((point: any) => point[key] || 0);
          
          // Enhanced categorization logic following LeRobot's naming patterns
          // Actions: anything that starts with "action" or contains action patterns
          if (key.startsWith('action') || key.includes('action_') || key.endsWith('_action')) {
            enhancedData.actions[key] = values;
            enhancedData.feature_names[key] = [key];
            enhancedData.feature_types[key] = 'action';
          } 
          // States: observation.state patterns and joint names with suffixes
          else if (key.startsWith('observation.state') || key.includes('observation.state_') || 
                   // Common LeRobot joint naming patterns
                   key.includes('.pos') || key.includes('.vel') || key.includes('.effort') ||
                   key.includes('_pos') || key.includes('_vel') || key.includes('_effort') ||
                   // Specific joint names that appear in LeRobot datasets
                   key.includes('shoulder') || key.includes('elbow') || key.includes('wrist') || 
                   key.includes('gripper') || key.includes('joint') || key.includes('finger') ||
                   // Additional robot-specific naming patterns
                   key.includes('base') || key.includes('waist') || key.includes('forearm') ||
                   key.includes('thumb') || key.includes('index') || key.includes('middle')) {
            enhancedData.states[key] = values;
            enhancedData.feature_names[key] = [key];
            enhancedData.feature_types[key] = 'state';
          } 
          // Observations: other sensor data
          else {
            enhancedData.observations[key] = values;
            enhancedData.feature_names[key] = [key];
            enhancedData.feature_types[key] = 'observation';
          }
        });
      }
      
      return enhancedData;
    } catch (error) {
      logError(error, `fetchEnhancedTelemetry(${datasetId}, ${episodeId})`);
      throw error;
    }
  },

  /**
   * Fetch telemetry data (simplified wrapper for main viewer)
   */
  async fetchTelemetryData(datasetId: string, episodeId: number): Promise<EnhancedTelemetryData> {
    try {
      return await this.fetchEnhancedTelemetry(datasetId, episodeId);
    } catch (error) {
      logError(error, `fetchTelemetryData(${datasetId}, ${episodeId})`);
      throw error;
    }
  },
};

/**
 * Utility functions for telemetry data transformation
 */

/**
 * Transform columnar telemetry data to row-based format for charts
 */
export function transformTelemetryToRowFormat(telemetryData: EnhancedTelemetryData): TelemetryPoint[] {
  const points: TelemetryPoint[] = [];
  const { timestamps, states, actions, observations } = telemetryData;
  
  for (let i = 0; i < timestamps.length; i++) {
    const point: TelemetryPoint = {
      time: timestamps[i],
      timestamp: timestamps[i],
      frame_index: i,
    };
    
    // Add state data
    Object.entries(states).forEach(([key, values]) => {
      if (Array.isArray(values) && values[i] !== undefined) {
        (point as any)[key] = values[i];
      }
    });
    
    // Add action data
    Object.entries(actions).forEach(([key, values]) => {
      if (Array.isArray(values) && values[i] !== undefined) {
        (point as any)[key] = values[i];
      }
    });
    
    // Add observation data
    Object.entries(observations).forEach(([key, values]) => {
      if (Array.isArray(values) && values[i] !== undefined) {
        (point as any)[key] = values[i];
      }
    });
    
    points.push(point);
  }
  
  return points;
}

/**
 * Downsample telemetry data to reduce chart complexity
 */
export function downsampleTelemetry(data: TelemetryPoint[], maxPoints: number): TelemetryPoint[] {
  if (data.length <= maxPoints) {
    return data;
  }
  
  const step = Math.ceil(data.length / maxPoints);
  const downsampled: TelemetryPoint[] = [];
  
  for (let i = 0; i < data.length; i += step) {
    downsampled.push(data[i]);
  }
  
  return downsampled;
}