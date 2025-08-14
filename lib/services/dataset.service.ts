import type { Dataset, DatasetMetrics } from "@/lib/types/dataset"
import type { ApiResponse } from "@/lib/api/base"
import { apiClient } from "@/lib/api/base"
import { mockDatasets } from "@/lib/data/mock-datasets"

export interface DatasetFilters {
  robotType?: string
  status?: string
  tags?: string[]
  dateRange?: {
    start: Date
    end: Date
  }
  search?: string
}

export interface DatasetSortOptions {
  field: "name" | "createdAt" | "updatedAt" | "fileSize" | "duration"
  direction: "asc" | "desc"
}

export class DatasetService {
  private static instance: DatasetService
  private cache = new Map<string, Dataset>()
  private cacheExpiry = new Map<string, number>()
  private readonly CACHE_TTL = 5 * 60 * 1000 // 5 minutes

  static getInstance(): DatasetService {
    if (!DatasetService.instance) {
      DatasetService.instance = new DatasetService()
    }
    return DatasetService.instance
  }

  private isCacheValid(key: string): boolean {
    const expiry = this.cacheExpiry.get(key)
    return expiry ? Date.now() < expiry : false
  }

  private setCache(key: string, data: Dataset): void {
    this.cache.set(key, data)
    this.cacheExpiry.set(key, Date.now() + this.CACHE_TTL)
  }

  async getDatasets(
    filters?: DatasetFilters,
    sort?: DatasetSortOptions,
    pagination?: { page: number; limit: number },
  ): Promise<ApiResponse<Dataset[]>> {
    try {
      // In development, use mock data
      if (process.env.NODE_ENV === "development") {
        let filteredData = [...mockDatasets]

        // Apply filters
        if (filters) {
          if (filters.robotType) {
            filteredData = filteredData.filter((d) => d.robotType === filters.robotType)
          }
          if (filters.status) {
            filteredData = filteredData.filter((d) => d.status === filters.status)
          }
          if (filters.tags?.length) {
            filteredData = filteredData.filter((d) => filters.tags!.some((tag) => d.tags.includes(tag)))
          }
          if (filters.search) {
            const search = filters.search.toLowerCase()
            filteredData = filteredData.filter(
              (d) => d.name.toLowerCase().includes(search) || d.description.toLowerCase().includes(search),
            )
          }
        }

        // Apply sorting
        if (sort) {
          filteredData.sort((a, b) => {
            const aVal = a[sort.field]
            const bVal = b[sort.field]
            const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0
            return sort.direction === "desc" ? -comparison : comparison
          })
        }

        // Apply pagination
        const total = filteredData.length
        if (pagination) {
          const start = (pagination.page - 1) * pagination.limit
          filteredData = filteredData.slice(start, start + pagination.limit)
        }

        return {
          data: filteredData,
          success: true,
          meta: {
            total,
            page: pagination?.page || 1,
            limit: pagination?.limit || total,
            hasMore: pagination ? pagination.page * pagination.limit < total : false,
          },
        }
      }

      // Production API call
      return await apiClient.get<Dataset[]>("/datasets", {
        ...filters,
        ...sort,
        ...pagination,
      })
    } catch (error) {
      throw error
    }
  }

  async getDataset(id: string): Promise<ApiResponse<Dataset>> {
    // Check cache first
    if (this.isCacheValid(id)) {
      const cached = this.cache.get(id)!
      return { data: cached, success: true }
    }

    try {
      if (process.env.NODE_ENV === "development") {
        const dataset = mockDatasets.find((d) => d.id === id)
        if (!dataset) {
          throw new Error("Dataset not found")
        }
        this.setCache(id, dataset)
        return { data: dataset, success: true }
      }

      const response = await apiClient.get<Dataset>(`/datasets/${id}`)
      if (response.success) {
        this.setCache(id, response.data)
      }
      return response
    } catch (error) {
      throw error
    }
  }

  async createDataset(dataset: Omit<Dataset, "id" | "createdAt" | "updatedAt">): Promise<ApiResponse<Dataset>> {
    try {
      if (process.env.NODE_ENV === "development") {
        const newDataset: Dataset = {
          ...dataset,
          id: `dataset_${Date.now()}`,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
        mockDatasets.push(newDataset)
        this.setCache(newDataset.id, newDataset)
        return { data: newDataset, success: true }
      }

      const response = await apiClient.post<Dataset>("/datasets", dataset)
      if (response.success) {
        this.setCache(response.data.id, response.data)
      }
      return response
    } catch (error) {
      throw error
    }
  }

  async updateDataset(id: string, updates: Partial<Dataset>): Promise<ApiResponse<Dataset>> {
    try {
      if (process.env.NODE_ENV === "development") {
        const index = mockDatasets.findIndex((d) => d.id === id)
        if (index === -1) {
          throw new Error("Dataset not found")
        }

        const updated = {
          ...mockDatasets[index],
          ...updates,
          updatedAt: new Date(),
        }
        mockDatasets[index] = updated
        this.setCache(id, updated)
        return { data: updated, success: true }
      }

      const response = await apiClient.put<Dataset>(`/datasets/${id}`, updates)
      if (response.success) {
        this.setCache(id, response.data)
      }
      return response
    } catch (error) {
      throw error
    }
  }

  async deleteDataset(id: string): Promise<ApiResponse<void>> {
    try {
      if (process.env.NODE_ENV === "development") {
        const index = mockDatasets.findIndex((d) => d.id === id)
        if (index === -1) {
          throw new Error("Dataset not found")
        }
        mockDatasets.splice(index, 1)
        this.cache.delete(id)
        this.cacheExpiry.delete(id)
        return { data: undefined, success: true }
      }

      const response = await apiClient.delete<void>(`/datasets/${id}`)
      if (response.success) {
        this.cache.delete(id)
        this.cacheExpiry.delete(id)
      }
      return response
    } catch (error) {
      throw error
    }
  }

  async getDatasetMetrics(id: string): Promise<ApiResponse<DatasetMetrics>> {
    try {
      if (process.env.NODE_ENV === "development") {
        const dataset = mockDatasets.find((d) => d.id === id)
        if (!dataset?.metrics) {
          throw new Error("Metrics not found")
        }
        return { data: dataset.metrics, success: true }
      }

      return await apiClient.get<DatasetMetrics>(`/datasets/${id}/metrics`)
    } catch (error) {
      throw error
    }
  }

  clearCache(): void {
    this.cache.clear()
    this.cacheExpiry.clear()
  }
}

export const datasetService = DatasetService.getInstance()
