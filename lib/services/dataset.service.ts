import { apiClient } from "@/lib/api/base"
import type { Dataset, DatasetMetadata, RecordingSession } from "@/lib/types/dataset"
import { mockDatasets } from "@/lib/data/mock-datasets"

export interface DatasetFilters {
  search?: string
  status?: string
  robotType?: string
  tags?: string[]
  dateFrom?: Date
  dateTo?: Date
}

export interface CreateDatasetRequest {
  name: string
  description: string
  robotType: Dataset["robotType"]
  tags: string[]
  metadata: Partial<DatasetMetadata>
}

export interface UpdateDatasetRequest extends Partial<CreateDatasetRequest> {
  id: string
}

class DatasetService {
  private readonly endpoint = "/datasets"

  // For development, use mock data
  private useMockData = process.env.NODE_ENV === "development"

  async getDatasets(filters?: DatasetFilters): Promise<Dataset[]> {
    if (this.useMockData) {
      return this.filterMockDatasets(mockDatasets, filters)
    }

    try {
      const response = await apiClient.get<Dataset[]>(this.endpoint, filters)
      return response.data
    } catch (error) {
      console.error("Failed to fetch datasets:", error)
      return this.filterMockDatasets(mockDatasets, filters)
    }
  }

  async getDataset(id: string): Promise<Dataset | null> {
    if (this.useMockData) {
      return mockDatasets.find((d) => d.id === id) || null
    }

    try {
      const response = await apiClient.get<Dataset>(`${this.endpoint}/${id}`)
      return response.data
    } catch (error) {
      console.error(`Failed to fetch dataset ${id}:`, error)
      return mockDatasets.find((d) => d.id === id) || null
    }
  }

  async createDataset(data: CreateDatasetRequest): Promise<Dataset> {
    if (this.useMockData) {
      const newDataset: Dataset = {
        id: `dataset_${Date.now()}`,
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
        duration: 0,
        frameCount: 0,
        fileSize: 0,
        status: "recording",
        sensors: [],
        metadata: {
          recordingEnvironment: "",
          robotModel: "",
          taskDescription: data.description,
          recordingQuality: "medium",
          version: "1.0.0",
          ...data.metadata,
        },
      }
      mockDatasets.unshift(newDataset)
      return newDataset
    }

    const response = await apiClient.post<Dataset>(this.endpoint, data)
    return response.data
  }

  async updateDataset(data: UpdateDatasetRequest): Promise<Dataset> {
    if (this.useMockData) {
      const index = mockDatasets.findIndex((d) => d.id === data.id)
      if (index === -1) throw new Error("Dataset not found")

      const updated = {
        ...mockDatasets[index],
        ...data,
        updatedAt: new Date(),
      }
      mockDatasets[index] = updated
      return updated
    }

    const response = await apiClient.put<Dataset>(`${this.endpoint}/${data.id}`, data)
    return response.data
  }

  async deleteDataset(id: string): Promise<void> {
    if (this.useMockData) {
      const index = mockDatasets.findIndex((d) => d.id === id)
      if (index !== -1) {
        mockDatasets.splice(index, 1)
      }
      return
    }

    await apiClient.delete(`${this.endpoint}/${id}`)
  }

  async startRecording(datasetId: string): Promise<RecordingSession> {
    const response = await apiClient.post<RecordingSession>(`${this.endpoint}/${datasetId}/record`)
    return response.data
  }

  async stopRecording(datasetId: string): Promise<void> {
    await apiClient.post(`${this.endpoint}/${datasetId}/stop`)
  }

  private filterMockDatasets(datasets: Dataset[], filters?: DatasetFilters): Dataset[] {
    if (!filters) return datasets

    return datasets.filter((dataset) => {
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        const matchesSearch =
          dataset.name.toLowerCase().includes(searchLower) ||
          dataset.description.toLowerCase().includes(searchLower) ||
          dataset.tags.some((tag) => tag.toLowerCase().includes(searchLower))
        if (!matchesSearch) return false
      }

      if (filters.status && dataset.status !== filters.status) return false
      if (filters.robotType && dataset.robotType !== filters.robotType) return false

      if (filters.tags && filters.tags.length > 0) {
        const hasMatchingTag = filters.tags.some((tag) => dataset.tags.includes(tag))
        if (!hasMatchingTag) return false
      }

      if (filters.dateFrom && dataset.createdAt < filters.dateFrom) return false
      if (filters.dateTo && dataset.createdAt > filters.dateTo) return false

      return true
    })
  }
}

export const datasetService = new DatasetService()
