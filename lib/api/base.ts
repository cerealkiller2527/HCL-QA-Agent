// Base API configuration and utilities
export interface ApiResponse<T> {
  data: T
  success: boolean
  message?: string
  errors?: string[]
  meta?: {
    total?: number
    page?: number
    limit?: number
    hasMore?: boolean
  }
}

class ApiError {
  message: string
  code: string
  status: number
  details?: Record<string, any>

  constructor({
    message,
    code,
    status,
    details,
  }: { message: string; code: string; status: number; details?: Record<string, any> }) {
    this.message = message
    this.code = code
    this.status = status
    this.details = details
  }
}

export class ApiClient {
  private baseUrl: string
  private defaultHeaders: Record<string, string>

  constructor(baseUrl = "/api", defaultHeaders = {}) {
    this.baseUrl = baseUrl
    this.defaultHeaders = {
      "Content-Type": "application/json",
      ...defaultHeaders,
    }
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`
    const config: RequestInit = {
      headers: {
        ...this.defaultHeaders,
        ...options.headers,
      },
      ...options,
    }

    try {
      const response = await fetch(url, config)
      const data = await response.json()

      if (!response.ok) {
        throw new ApiError({
          message: data.message || "Request failed",
          code: data.code || "UNKNOWN_ERROR",
          status: response.status,
          details: data.details,
        })
      }

      return data
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }
      throw new ApiError({
        message: "Network error",
        code: "NETWORK_ERROR",
        status: 0,
      })
    }
  }

  async get<T>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    const searchParams = params ? new URLSearchParams(params).toString() : ""
    const url = searchParams ? `${endpoint}?${searchParams}` : endpoint
    return this.request<T>(url, { method: "GET" })
  }

  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "DELETE" })
  }
}

export const apiClient = new ApiClient()
