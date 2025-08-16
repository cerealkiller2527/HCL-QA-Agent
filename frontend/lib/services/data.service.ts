/**
 * Data service that connects to the backend API
 * Maintains the same interface as the mock version for seamless integration
 */

import { mockRobots } from "@/lib/data/mock-datasets"
import datasetsApi from "@/lib/api/datasets.api"
import type { Dataset as ApiDataset, DatasetWithMetrics, Robot } from "@/lib/api/schemas/validation"

// Type adapter to convert API response to frontend Dataset type
function adaptApiDataset(apiDataset: ApiDataset): DatasetWithMetrics {
  return {
    ...apiDataset,
    // Convert createdAt string to Date object if needed by components
    createdAt: new Date(apiDataset.createdAt),
    updatedAt: new Date(apiDataset.createdAt), // Use createdAt as updatedAt for now
    
    // Ensure all required fields have values
    size: apiDataset.fileSize?.toString() || "0 B",
    metadata: {
      recordingEnvironment: "HuggingFace Hub",
      robotModel: apiDataset.robotType || "Unknown",
      taskDescription: apiDataset.description || "",
      recordingQuality: "high" as const,
      version: "1.0.0",
    },
    sensors: [],
    metrics: {
      averageFrameRate: apiDataset.fps || 30,
      droppedFrames: 0,
      dataIntegrity: 100,
      compressionRatio: 0.65,
      processingTime: 0,
      qualityScore: 95,
    },
  };
}

class DataService {
  private USE_MOCK_DATA = false; // Set to true to use mock data for testing
  
  // Dataset operations
  async getDatasets(filters?: { 
    search?: string; 
    status?: string; 
    robotType?: string 
  }): Promise<any[]> {
    try {
      // Fetch all datasets from API
      const apiDatasets = await datasetsApi.getAll();
      
      // Convert API response to frontend format
      let datasets = apiDatasets.map(adaptApiDataset);
      
      // Apply frontend filtering if filters are provided
      if (filters) {
        datasets = datasets.filter((dataset) => {
          // Search filter
          if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            const matchesSearch =
              dataset.name.toLowerCase().includes(searchLower) ||
              dataset.description.toLowerCase().includes(searchLower) ||
              dataset.tags.some((tag: string) => tag.toLowerCase().includes(searchLower));
            if (!matchesSearch) return false;
          }
          
          // Status filter
          if (filters.status && filters.status !== 'all' && dataset.status !== filters.status) {
            return false;
          }
          
          // Robot type filter
          if (filters.robotType && filters.robotType !== 'all' && dataset.robotType !== filters.robotType) {
            return false;
          }
          
          return true;
        });
      }
      
      return datasets;
    } catch (error) {
      console.error('Failed to fetch datasets from API:', error);
      // Return empty array on error instead of crashing
      return [];
    }
  }

  async getDataset(id: string): Promise<any | null> {
    try {
      const apiDataset = await datasetsApi.getById(id);
      if (!apiDataset) return null;
      
      return adaptApiDataset(apiDataset);
    } catch (error) {
      console.error(`Failed to fetch dataset ${id}:`, error);
      return null;
    }
  }

  // Robot operations (still using mock data for now)
  async getRobots(filters?: { status?: string; type?: string }): Promise<Robot[]> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 100));

    if (!filters) return mockRobots;

    return mockRobots.filter((robot) => {
      if (filters.status && robot.status !== filters.status) return false;
      if (filters.type && robot.type !== filters.type) return false;
      return true;
    });
  }

  async getRobot(id: string): Promise<Robot | null> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    return mockRobots.find((r) => r.id === id) || null;
  }

  // Analytics operations
  async getAnalytics(): Promise<{
    totalDatasets: number;
    totalRobots: number;
    activeRobots: number;
    totalRecordingTime: number;
  }> {
    try {
      const datasets = await this.getDatasets();
      
      return {
        totalDatasets: datasets.length,
        totalRobots: mockRobots.length,
        activeRobots: mockRobots.filter((r) => r.status === "online").length,
        totalRecordingTime: datasets.reduce((acc, d) => acc + (d.duration || 0), 0),
      };
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      return {
        totalDatasets: 0,
        totalRobots: 0,
        activeRobots: 0,
        totalRecordingTime: 0,
      };
    }
  }

  // Health check
  async checkApiHealth(): Promise<boolean> {
    return datasetsApi.checkHealth();
  }
}

export const dataService = new DataService();