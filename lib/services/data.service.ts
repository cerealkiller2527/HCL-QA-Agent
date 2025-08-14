import { mockDatasets, mockRobots } from "@/lib/data/mock-datasets"
import type { Dataset, Robot } from "@/lib/types/dataset"

// Simple data service for frontend-only development
class DataService {
  // Dataset operations
  async getDatasets(filters?: { search?: string; status?: string; robotType?: string }): Promise<Dataset[]> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 100))

    if (!filters) return mockDatasets

    return mockDatasets.filter((dataset) => {
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

      return true
    })
  }

  async getDataset(id: string): Promise<Dataset | null> {
    await new Promise((resolve) => setTimeout(resolve, 100))
    return mockDatasets.find((d) => d.id === id) || null
  }

  // Robot operations
  async getRobots(filters?: { status?: string; type?: string }): Promise<Robot[]> {
    await new Promise((resolve) => setTimeout(resolve, 100))

    if (!filters) return mockRobots

    return mockRobots.filter((robot) => {
      if (filters.status && robot.status !== filters.status) return false
      if (filters.type && robot.type !== filters.type) return false
      return true
    })
  }

  async getRobot(id: string): Promise<Robot | null> {
    await new Promise((resolve) => setTimeout(resolve, 100))
    return mockRobots.find((r) => r.id === id) || null
  }

  // Analytics operations
  async getAnalytics(): Promise<{
    totalDatasets: number
    totalRobots: number
    activeRobots: number
    totalRecordingTime: number
  }> {
    await new Promise((resolve) => setTimeout(resolve, 100))

    return {
      totalDatasets: mockDatasets.length,
      totalRobots: mockRobots.length,
      activeRobots: mockRobots.filter((r) => r.status === "online").length,
      totalRecordingTime: mockDatasets.reduce((acc, d) => acc + d.duration, 0),
    }
  }
}

export const dataService = new DataService()
