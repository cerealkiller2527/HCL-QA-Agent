import axios, { AxiosError, AxiosResponse } from 'axios';
import { ZodError } from 'zod';

// Get API URL from environment variable
const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error(
    'NEXT_PUBLIC_API_URL environment variable is required. ' +
    'Please set it to your backend API URL (e.g., http://localhost:8000)'
  );
}

// Validate API URL format
try {
  const url = new URL(API_URL);
  if (url.protocol !== 'https:' && url.protocol !== 'http:') {
    throw new Error('API_URL must use HTTP or HTTPS protocol');
  }
} catch (error) {
  throw new Error(`Invalid NEXT_PUBLIC_API_URL format: ${API_URL}`);
}

// Create axios instance with enhanced configuration for TanStack Query
export const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for debugging and request preparation
apiClient.interceptors.request.use(
  (config) => {
    // Add request ID for tracking
    config.metadata = { startTime: Date.now() };
    
    // Debug logging
    if (process.env.NEXT_PUBLIC_DEBUG === 'true') {
      console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`, {
        params: config.params,
        data: config.data,
      });
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling and logging
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Calculate request duration
    const duration = Date.now() - (response.config.metadata?.startTime || 0);
    
    // Debug logging
    if (process.env.NEXT_PUBLIC_DEBUG === 'true') {
      console.log(`✅ API Response: ${response.status} ${response.config.url} (${duration}ms)`, {
        data: response.data,
      });
    }
    
    return response;
  },
  (error: AxiosError) => {
    // Calculate request duration
    const duration = Date.now() - (error.config?.metadata?.startTime || 0);
    
    // Enhanced error logging
    if (process.env.NEXT_PUBLIC_DEBUG === 'true') {
      console.error(`❌ API Error: ${error.response?.status} ${error.config?.url} (${duration}ms)`, {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
    }

    // Handle specific error cases with proper error objects
    const statusCode = error.response?.status;
    const errorData = error.response?.data;

    switch (statusCode) {
      case 401:
        console.error('🔒 Authentication error - invalid or missing token');
        break;
      case 403:
        console.error('🚫 Permission denied');
        break;
      case 404:
        console.error('🔍 Resource not found');
        break;
      case 429:
        console.error('⏳ Rate limit exceeded');
        break;
      case 500:
        console.error('🔥 Server error');
        break;
      default:
        console.error(`🔴 HTTP Error ${statusCode}`);
    }

    return Promise.reject(error);
  }
);

// Enhanced error handler that works with our backend response format
export function handleApiError(error: unknown): string {
  // Handle Zod validation errors
  if (error instanceof ZodError) {
    const issues = error.issues.map(issue => {
      const path = issue.path.join('.');
      return `${path}: ${issue.message}`;
    });
    return `Validation error: ${issues.join(', ')}`;
  }
  
  // Handle Axios errors with backend format
  if (axios.isAxiosError(error)) {
    const responseData = error.response?.data;
    
    // Handle backend error response format: { success: false, error: { code, message, details } }
    if (responseData && !responseData.success && responseData.error) {
      return responseData.error.message || 'Server error occurred';
    }
    
    // Handle FastAPI detail format
    if (responseData?.detail) {
      return responseData.detail;
    }
    
    // Handle status codes
    switch (error.response?.status) {
      case 401:
        return 'Authentication required. Please check your credentials.';
      case 403:
        return 'Permission denied. You do not have access to this resource.';
      case 404:
        return 'Resource not found.';
      case 429:
        return 'Too many requests. Please wait a moment before trying again.';
      case 500:
        return 'Server error. Please try again later.';
      case 503:
        return 'Service temporarily unavailable. Please try again later.';
      default:
        return error.message || 'Network error occurred';
    }
  }
  
  // Handle other errors
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'An unexpected error occurred';
}

// API Error class for structured error handling
export class ApiError extends Error {
  constructor(
    public code: string,
    public message: string,
    public details?: any,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Type augmentation for axios config
declare module 'axios' {
  interface InternalAxiosRequestConfig {
    metadata?: {
      startTime: number;
    };
  }
}