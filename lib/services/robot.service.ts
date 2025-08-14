import { apiClient } from "@/lib/api/base"
import type { Robot } from "@/lib/types/dataset"
import { mockRobots } from "@/lib/data/mock-datasets"

export interface RobotFilters {
  status?: Robot["status"]
  type?: Robot["type"]
  location?: string
}

export interface RobotCommand {
  type: "start" | "stop" | "pause" | "resume" | "emergency_stop"
  parameters?: Record<string, any>
}

class RobotService {
  private readonly endpoint = "/robots"
  private useMockData = process.env.NODE_ENV === "development"

  async getRobots(filters?: RobotFilters): Promise<Robot[]> {
    if (this.useMockData) {
      return this.filterMockRobots(mockRobots, filters)
    }

    try {
      const response = await apiClient.get<Robot[]>(this.endpoint, filters)
      return response.data
    } catch (error) {
      console.error("Failed to fetch robots:", error)
      return this.filterMockRobots(mockRobots, filters)
    }
  }

  async getRobot(id: string): Promise<Robot | null> {
    if (this.useMockData) {
      return mockRobots.find((r) => r.id === id) || null
    }

    try {
      const response = await apiClient.get<Robot>(`${this.endpoint}/${id}`)
      return response.data
    } catch (error) {
      console.error(`Failed to fetch robot ${id}:`, error)
      return mockRobots.find((r) => r.id === id) || null
    }
  }

  async sendCommand(robotId: string, command: RobotCommand): Promise<void> {
    if (this.useMockData) {
      console.log(`Mock command sent to ${robotId}:`, command)
      return
    }

    await apiClient.post(`${this.endpoint}/${robotId}/command`, command)
  }

  async updateRobotStatus(robotId: string, status: Robot["status"]): Promise<Robot> {
    if (this.useMockData) {
      const robot = mockRobots.find((r) => r.id === robotId)
      if (!robot) throw new Error("Robot not found")

      robot.status = status
      robot.lastSeen = new Date()
      return robot
    }

    const response = await apiClient.put<Robot>(`${this.endpoint}/${robotId}/status`, { status })
    return response.data
  }

  private filterMockRobots(robots: Robot[], filters?: RobotFilters): Robot[] {
    if (!filters) return robots

    return robots.filter((robot) => {
      if (filters.status && robot.status !== filters.status) return false
      if (filters.type && robot.type !== filters.type) return false
      if (filters.location && robot.location !== filters.location) return false
      return true
    })
  }
}

export const robotService = new RobotService()
