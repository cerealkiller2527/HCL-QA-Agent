import type { Robot } from "@/lib/types/dataset"
import type { ApiResponse } from "@/lib/api/base"
import { apiClient } from "@/lib/api/base"
import { mockRobots } from "@/lib/data/mock-datasets"

export interface RobotFilters {
  status?: string
  type?: string
  location?: string
  capabilities?: string[]
}

export class RobotService {
  private static instance: RobotService
  private cache = new Map<string, Robot>()
  private cacheExpiry = new Map<string, number>()
  private readonly CACHE_TTL = 30 * 1000 // 30 seconds for real-time data

  static getInstance(): RobotService {
    if (!RobotService.instance) {
      RobotService.instance = new RobotService()
    }
    return RobotService.instance
  }

  private isCacheValid(key: string): boolean {
    const expiry = this.cacheExpiry.get(key)
    return expiry ? Date.now() < expiry : false
  }

  private setCache(key: string, data: Robot): void {
    this.cache.set(key, data)
    this.cacheExpiry.set(key, Date.now() + this.CACHE_TTL)
  }

  async getRobots(filters?: RobotFilters): Promise<ApiResponse<Robot[]>> {
    try {
      if (process.env.NODE_ENV === "development") {
        let filteredData = [...mockRobots]

        if (filters) {
          if (filters.status) {
            filteredData = filteredData.filter((r) => r.status === filters.status)
          }
          if (filters.type) {
            filteredData = filteredData.filter((r) => r.type === filters.type)
          }
          if (filters.location) {
            filteredData = filteredData.filter((r) => r.location.includes(filters.location!))
          }
          if (filters.capabilities?.length) {
            filteredData = filteredData.filter((r) => filters.capabilities!.some((cap) => r.capabilities.includes(cap)))
          }
        }

        return { data: filteredData, success: true }
      }

      return await apiClient.get<Robot[]>("/robots", filters)
    } catch (error) {
      throw error
    }
  }

  async getRobot(id: string): Promise<ApiResponse<Robot>> {
    if (this.isCacheValid(id)) {
      const cached = this.cache.get(id)!
      return { data: cached, success: true }
    }

    try {
      if (process.env.NODE_ENV === "development") {
        const robot = mockRobots.find((r) => r.id === id)
        if (!robot) {
          throw new Error("Robot not found")
        }
        this.setCache(id, robot)
        return { data: robot, success: true }
      }

      const response = await apiClient.get<Robot>(`/robots/${id}`)
      if (response.success) {
        this.setCache(id, response.data)
      }
      return response
    } catch (error) {
      throw error
    }
  }

  async updateRobotStatus(id: string, status: Robot["status"]): Promise<ApiResponse<Robot>> {
    try {
      if (process.env.NODE_ENV === "development") {
        const robot = mockRobots.find((r) => r.id === id)
        if (!robot) {
          throw new Error("Robot not found")
        }
        robot.status = status
        robot.lastSeen = new Date()
        this.setCache(id, robot)
        return { data: robot, success: true }
      }

      const response = await apiClient.put<Robot>(`/robots/${id}/status`, { status })
      if (response.success) {
        this.setCache(id, response.data)
      }
      return response
    } catch (error) {
      throw error
    }
  }

  async getRobotStats(): Promise<
    ApiResponse<{
      total: number
      online: number
      offline: number
      maintenance: number
      avgBattery: number
    }>
  > {
    try {
      if (process.env.NODE_ENV === "development") {
        const stats = {
          total: mockRobots.length,
          online: mockRobots.filter((r) => r.status === "online").length,
          offline: mockRobots.filter((r) => r.status === "offline").length,
          maintenance: mockRobots.filter((r) => r.status === "maintenance").length,
          avgBattery: Math.round(mockRobots.reduce((acc, r) => acc + (r.batteryLevel || 0), 0) / mockRobots.length),
        }
        return { data: stats, success: true }
      }

      return await apiClient.get("/robots/stats")
    } catch (error) {
      throw error
    }
  }

  clearCache(): void {
    this.cache.clear()
    this.cacheExpiry.clear()
  }
}

export const robotService = RobotService.getInstance()
