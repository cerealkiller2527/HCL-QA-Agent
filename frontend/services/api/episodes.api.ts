import { apiClient } from '../config/apiClient';
import { 
  parseBackendResponse,
  ApiError 
} from '../utils/responseParser';
import { 
  EpisodeSchema,
  EpisodeDataSchema,
  VideoUrlSchema,
  type Episode,
  type EpisodeData,
  type VideoUrl
} from '../schemas/domain.schema';
import { logError } from '../utils/errorHandler';
import { z } from 'zod';

/**
 * Episodes API Functions
 * Handles episode-related API calls with proper parsing
 */

export const episodesApi = {
  /**
   * Fetch episodes list for a dataset
   */
  async fetchEpisodes(datasetId: string): Promise<Episode[]> {
    try {
      const [owner, ...nameParts] = datasetId.split('/');
      const datasetName = nameParts.join('/');
      
      if (!owner || !datasetName) {
        throw new ApiError(
          'INVALID_DATASET_ID',
          'Dataset ID must be in format "owner/dataset-name"'
        );
      }
      
      const { data } = await apiClient.get(
        `/api/v1/datasets/${encodeURIComponent(owner)}/${encodeURIComponent(datasetName)}/episodes`
      );
      
      const result = parseBackendResponse(data, z.array(EpisodeSchema));
      return result.data;
    } catch (error) {
      logError(error, `fetchEpisodes(${datasetId})`);
      throw error;
    }
  },

  /**
   * Fetch complete episode data (videos, telemetry, cameras)
   */
  async fetchEpisodeData(datasetId: string, episodeId: number): Promise<EpisodeData> {
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
      
      const { data } = await apiClient.get(
        `/api/v1/datasets/${encodeURIComponent(owner)}/${encodeURIComponent(datasetName)}/episodes/${episodeId}`
      );
      
      const result = parseBackendResponse(data, EpisodeDataSchema);
      return result.data;
    } catch (error) {
      logError(error, `fetchEpisodeData(${datasetId}, ${episodeId})`);
      throw error;
    }
  },

  /**
   * Fetch enhanced episode data with complete telemetry and statistics
   */
  async fetchEnhancedEpisodeData(datasetId: string, episodeId: number): Promise<Record<string, any>> {
    try {
      const [owner, ...nameParts] = datasetId.split('/');
      const datasetName = nameParts.join('/');
      
      if (!owner || !datasetName) {
        throw new ApiError(
          'INVALID_DATASET_ID',
          'Dataset ID must be in format "owner/dataset-name"'
        );
      }
      
      const { data } = await apiClient.get(
        `/api/v1/datasets/${encodeURIComponent(owner)}/${encodeURIComponent(datasetName)}/episodes/${episodeId}/enhanced`
      );
      
      // Enhanced episode data has complex structure, return raw data for now
      return data;
    } catch (error) {
      logError(error, `fetchEnhancedEpisodeData(${datasetId}, ${episodeId})`);
      throw error;
    }
  },

  /**
   * Fetch video URLs for an episode
   */
  async fetchEpisodeVideos(datasetId: string, episodeId: number): Promise<{
    episode_id: number;
    video_count: number;
    videos: VideoUrl[];
    streaming_optimized: boolean;
    direct_access: boolean;
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
      
      const { data } = await apiClient.get(
        `/api/v1/datasets/${encodeURIComponent(owner)}/${encodeURIComponent(datasetName)}/episodes/${episodeId}/videos`
      );
      
      // Validate the videos array
      const videoSchema = z.object({
        episode_id: z.number(),
        video_count: z.number(),
        videos: z.array(VideoUrlSchema),
        streaming_optimized: z.boolean(),
        direct_access: z.boolean(),
      });
      
      return videoSchema.parse(data);
    } catch (error) {
      logError(error, `fetchEpisodeVideos(${datasetId}, ${episodeId})`);
      throw error;
    }
  },

  /**
   * Validate video accessibility for an episode
   */
  async validateVideoAccessibility(datasetId: string, episodeId: number): Promise<Record<string, any>> {
    try {
      const [owner, ...nameParts] = datasetId.split('/');
      const datasetName = nameParts.join('/');
      
      const { data } = await apiClient.get(
        `/api/v1/datasets/${encodeURIComponent(owner)}/${encodeURIComponent(datasetName)}/episodes/${episodeId}/videos/validate`
      );
      
      return data;
    } catch (error) {
      logError(error, `validateVideoAccessibility(${datasetId}, ${episodeId})`);
      throw error;
    }
  },

  /**
   * Get video metadata for an episode
   */
  async fetchVideoMetadata(datasetId: string, episodeId: number): Promise<Record<string, any>> {
    try {
      const [owner, ...nameParts] = datasetId.split('/');
      const datasetName = nameParts.join('/');
      
      const { data } = await apiClient.get(
        `/api/v1/datasets/${encodeURIComponent(owner)}/${encodeURIComponent(datasetName)}/episodes/${episodeId}/video-metadata`
      );
      
      return data;
    } catch (error) {
      logError(error, `fetchVideoMetadata(${datasetId}, ${episodeId})`);
      throw error;
    }
  },

  /**
   * Fetch video URLs for an episode (simplified wrapper)
   */
  async fetchVideoUrls(datasetId: string, episodeId: number): Promise<VideoUrl[]> {
    try {
      const result = await this.fetchEpisodeVideos(datasetId, episodeId);
      return result.videos;
    } catch (error) {
      logError(error, `fetchVideoUrls(${datasetId}, ${episodeId})`);
      throw error;
    }
  },
};