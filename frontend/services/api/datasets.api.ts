import { apiClient } from '../config/apiClient';
import { 
  parseBackendResponse, 
  parsePaginatedArrayResponse,
  ApiError 
} from '../utils/responseParser';
import { 
  DatasetSchema, 
  DatasetDetailSchema,
  UserInfoSchema,
  type Dataset,
  type DatasetDetail,
  type UserInfo
} from '../schemas/domain.schema';
import { logError } from '../utils/errorHandler';

/**
 * Dataset API Functions
 * Uses new response parsers and proper error handling
 */

export const datasetsApi = {
  /**
   * Get current user information
   */
  async fetchUserInfo(): Promise<UserInfo> {
    try {
      const { data } = await apiClient.get('/api/v1/user');
      const result = parseBackendResponse(data, UserInfoSchema);
      return result.data;
    } catch (error) {
      logError(error, 'fetchUserInfo');
      throw error;
    }
  },

  /**
   * Fetch datasets with pagination
   */
  async fetchDatasets(page = 1, limit = 20): Promise<{ 
    data: Dataset[]; 
    meta: { page: number; limit: number; total: number; has_more: boolean } 
  }> {
    try {
      const { data } = await apiClient.get('/api/v1/datasets', {
        params: { page, limit }
      });
      
      return parsePaginatedArrayResponse(data, DatasetSchema);
    } catch (error) {
      logError(error, 'fetchDatasets');
      throw error;
    }
  },

  /**
   * Fetch single dataset by ID
   */
  async fetchDataset(datasetId: string): Promise<DatasetDetail> {
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
        `/api/v1/datasets/${encodeURIComponent(owner)}/${encodeURIComponent(datasetName)}`
      );
      
      const result = parseBackendResponse(data, DatasetDetailSchema);
      return result.data;
    } catch (error) {
      logError(error, `fetchDataset(${datasetId})`);
      throw error;
    }
  },

  /**
   * Get enhanced dataset details with complete LeRobot metadata
   */
  async fetchEnhancedDataset(datasetId: string): Promise<DatasetDetail> {
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
        `/api/v1/datasets/${encodeURIComponent(owner)}/${encodeURIComponent(datasetName)}/enhanced`
      );
      
      const result = parseBackendResponse(data, DatasetDetailSchema);
      return result.data;
    } catch (error) {
      logError(error, `fetchEnhancedDataset(${datasetId})`);
      throw error;
    }
  },

  /**
   * Get dataset features information
   */
  async fetchDatasetFeatures(datasetId: string): Promise<Record<string, any>> {
    try {
      const [owner, ...nameParts] = datasetId.split('/');
      const datasetName = nameParts.join('/');
      
      const { data } = await apiClient.get(
        `/api/v1/datasets/${encodeURIComponent(owner)}/${encodeURIComponent(datasetName)}/features`
      );
      
      // Features endpoint returns raw feature data, not wrapped in our schema
      return data;
    } catch (error) {
      logError(error, `fetchDatasetFeatures(${datasetId})`);
      throw error;
    }
  },

  /**
   * Get dataset analytics and statistics
   */
  async fetchDatasetAnalytics(datasetId: string): Promise<Record<string, any>> {
    try {
      const [owner, ...nameParts] = datasetId.split('/');
      const datasetName = nameParts.join('/');
      
      const { data } = await apiClient.get(
        `/api/v1/datasets/${encodeURIComponent(owner)}/${encodeURIComponent(datasetName)}/analytics`
      );
      
      return data;
    } catch (error) {
      logError(error, `fetchDatasetAnalytics(${datasetId})`);
      throw error;
    }
  },

  /**
   * Get dataset size information
   */
  async fetchDatasetSize(datasetId: string): Promise<{ size: number; formatted: string }> {
    try {
      const [owner, ...nameParts] = datasetId.split('/');
      const datasetName = nameParts.join('/');
      
      const { data } = await apiClient.get(
        `/api/v1/datasets/${encodeURIComponent(owner)}/${encodeURIComponent(datasetName)}/size`
      );
      
      return data;
    } catch (error) {
      logError(error, `fetchDatasetSize(${datasetId})`);
      throw error;
    }
  },

  /**
   * Validate dataset compatibility with LeRobot
   */
  async validateDatasetCompatibility(datasetId: string): Promise<Record<string, any>> {
    try {
      const [owner, ...nameParts] = datasetId.split('/');
      const datasetName = nameParts.join('/');
      
      const { data } = await apiClient.get(
        `/api/v1/datasets/${encodeURIComponent(owner)}/${encodeURIComponent(datasetName)}/compatibility`
      );
      
      return data;
    } catch (error) {
      logError(error, `validateDatasetCompatibility(${datasetId})`);
      throw error;
    }
  },

  /**
   * Get robot configuration for a dataset
   */
  async fetchRobotConfig(datasetId: string): Promise<Record<string, any>> {
    try {
      const [owner, ...nameParts] = datasetId.split('/');
      const datasetName = nameParts.join('/');
      
      const { data } = await apiClient.get(
        `/api/v1/datasets/${encodeURIComponent(owner)}/${encodeURIComponent(datasetName)}/robot-config`
      );
      
      return data;
    } catch (error) {
      logError(error, `fetchRobotConfig(${datasetId})`);
      throw error;
    }
  },

  /**
   * Delete a dataset (WARNING: Irreversible!)
   */
  async deleteDataset(datasetId: string): Promise<{ message: string }> {
    try {
      const [owner, ...nameParts] = datasetId.split('/');
      const datasetName = nameParts.join('/');
      
      if (!owner || !datasetName) {
        throw new ApiError(
          'INVALID_DATASET_ID',
          'Dataset ID must be in format "owner/dataset-name"'
        );
      }
      
      const { data } = await apiClient.delete(
        `/api/v1/datasets/${encodeURIComponent(owner)}/${encodeURIComponent(datasetName)}`
      );
      
      return data;
    } catch (error) {
      logError(error, `deleteDataset(${datasetId})`);
      throw error;
    }
  },

  /**
   * Check backend health
   */
  async checkHealth(): Promise<{ status: string; timestamp: string }> {
    try {
      const { data } = await apiClient.get('/health');
      return data;
    } catch (error) {
      logError(error, 'checkHealth');
      throw error;
    }
  },

  /**
   * Get backend configuration
   */
  async fetchBackendConfig(): Promise<Record<string, any>> {
    try {
      const { data } = await apiClient.get('/api/v1/config');
      return data;
    } catch (error) {
      logError(error, 'fetchBackendConfig');
      throw error;
    }
  },
};