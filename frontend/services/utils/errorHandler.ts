import { AxiosError } from 'axios';
import { ZodError } from 'zod';
import { ApiError } from './responseParser';

/**
 * Error Handler Utilities
 * Centralized error handling for TanStack Query and API calls
 */

export interface ErrorInfo {
  code: string;
  message: string;
  details?: any;
  statusCode?: number;
  retryable?: boolean;
}

/**
 * Comprehensive error handler that converts any error to ErrorInfo
 */
export function handleError(error: unknown): ErrorInfo {
  // Handle our custom ApiError
  if (error instanceof ApiError) {
    return {
      code: error.code,
      message: error.message,
      details: error.details,
      statusCode: error.statusCode,
      retryable: isRetryableError(error.code, error.statusCode),
    };
  }

  // Handle Axios errors (network, HTTP status codes)
  if (error instanceof AxiosError) {
    const statusCode = error.response?.status;
    const responseData = error.response?.data;

    // Check if it's a backend error response format
    if (responseData && !responseData.success && responseData.error) {
      return {
        code: responseData.error.code || 'API_ERROR',
        message: responseData.error.message || 'Server error occurred',
        details: responseData.error.details,
        statusCode,
        retryable: isRetryableError(responseData.error.code, statusCode),
      };
    }

    // Handle FastAPI detail format
    if (responseData?.detail) {
      return {
        code: getErrorCodeFromStatus(statusCode),
        message: responseData.detail,
        statusCode,
        retryable: isRetryableError(undefined, statusCode),
      };
    }

    // Handle network errors
    if (error.code === 'ECONNABORTED') {
      return {
        code: 'TIMEOUT',
        message: 'Request timed out. Please try again.',
        retryable: true,
      };
    }

    if (error.code === 'ERR_NETWORK') {
      return {
        code: 'NETWORK_ERROR',
        message: 'Network error. Please check your connection.',
        retryable: true,
      };
    }

    // Handle HTTP status codes
    return {
      code: getErrorCodeFromStatus(statusCode),
      message: getErrorMessageFromStatus(statusCode, error.message),
      statusCode,
      retryable: isRetryableError(undefined, statusCode),
    };
  }

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    const issues = error.issues.map(issue => {
      const path = issue.path.join('.');
      return `${path}: ${issue.message}`;
    });

    return {
      code: 'VALIDATION_ERROR',
      message: `Data validation failed: ${issues.join(', ')}`,
      details: { zodError: error },
      retryable: false,
    };
  }

  // Handle generic Error objects
  if (error instanceof Error) {
    return {
      code: 'UNKNOWN_ERROR',
      message: error.message || 'An unexpected error occurred',
      details: { originalError: error },
      retryable: false,
    };
  }

  // Handle non-Error objects
  return {
    code: 'UNKNOWN_ERROR',
    message: 'An unexpected error occurred',
    details: { originalError: error },
    retryable: false,
  };
}

/**
 * Get error code from HTTP status code
 */
function getErrorCodeFromStatus(statusCode?: number): string {
  switch (statusCode) {
    case 400:
      return 'BAD_REQUEST';
    case 401:
      return 'UNAUTHORIZED';
    case 403:
      return 'FORBIDDEN';
    case 404:
      return 'NOT_FOUND';
    case 409:
      return 'CONFLICT';
    case 422:
      return 'VALIDATION_ERROR';
    case 429:
      return 'RATE_LIMITED';
    case 500:
      return 'INTERNAL_ERROR';
    case 502:
      return 'BAD_GATEWAY';
    case 503:
      return 'SERVICE_UNAVAILABLE';
    case 504:
      return 'GATEWAY_TIMEOUT';
    default:
      return 'HTTP_ERROR';
  }
}

/**
 * Get user-friendly error message from HTTP status code
 */
function getErrorMessageFromStatus(statusCode?: number, fallback?: string): string {
  switch (statusCode) {
    case 400:
      return 'Invalid request. Please check your input.';
    case 401:
      return 'Authentication required. Please check your credentials.';
    case 403:
      return 'Permission denied. You do not have access to this resource.';
    case 404:
      return 'Resource not found.';
    case 409:
      return 'Conflict occurred. Resource may already exist.';
    case 422:
      return 'Invalid data provided. Please check your input.';
    case 429:
      return 'Too many requests. Please wait a moment before trying again.';
    case 500:
      return 'Server error. Please try again later.';
    case 502:
      return 'Service temporarily unavailable. Please try again later.';
    case 503:
      return 'Service maintenance in progress. Please try again later.';
    case 504:
      return 'Request timeout. Please try again.';
    default:
      return fallback || 'An error occurred while processing your request.';
  }
}

/**
 * Determine if an error is retryable
 */
function isRetryableError(errorCode?: string, statusCode?: number): boolean {
  // Retryable error codes
  const retryableCodes = [
    'TIMEOUT',
    'NETWORK_ERROR',
    'RATE_LIMITED',
    'INTERNAL_ERROR',
    'BAD_GATEWAY',
    'SERVICE_UNAVAILABLE',
    'GATEWAY_TIMEOUT',
  ];

  if (errorCode && retryableCodes.includes(errorCode)) {
    return true;
  }

  // Retryable status codes
  const retryableStatusCodes = [429, 500, 502, 503, 504];
  
  if (statusCode && retryableStatusCodes.includes(statusCode)) {
    return true;
  }

  return false;
}

/**
 * Format error for user display
 */
export function formatErrorForUser(error: unknown): string {
  const errorInfo = handleError(error);
  
  // Map specific error codes to user-friendly messages
  switch (errorInfo.code) {
    case 'DATASET_NOT_FOUND':
      return 'Dataset not found. It may have been deleted or you may not have access.';
    case 'EPISODE_NOT_FOUND':
      return 'Episode not found in this dataset.';
    case 'TELEMETRY_NOT_FOUND':
      return 'No telemetry data available for this episode.';
    case 'RATE_LIMITED':
      return 'Too many requests. Please wait a moment before trying again.';
    case 'NETWORK_ERROR':
      return 'Network error. Please check your connection and try again.';
    case 'TIMEOUT':
      return 'Request timed out. Please try again.';
    case 'UNAUTHORIZED':
      return 'Authentication required. Please check your HuggingFace token.';
    case 'FORBIDDEN':
      return 'You do not have permission to access this resource.';
    case 'VALIDATION_ERROR':
      return 'Invalid data received. Please try again.';
    default:
      return errorInfo.message;
  }
}

/**
 * Check if error should trigger a retry in TanStack Query
 */
export function shouldRetry(error: unknown, retryCount: number): boolean {
  const errorInfo = handleError(error);
  
  // Don't retry more than 3 times
  if (retryCount >= 3) {
    return false;
  }
  
  // Don't retry client errors (4xx except 429)
  if (errorInfo.statusCode && errorInfo.statusCode >= 400 && errorInfo.statusCode < 500 && errorInfo.statusCode !== 429) {
    return false;
  }
  
  return errorInfo.retryable || false;
}

/**
 * Get retry delay with exponential backoff
 */
export function getRetryDelay(retryCount: number): number {
  // Exponential backoff: 1s, 2s, 4s, 8s, capped at 30s
  return Math.min(1000 * Math.pow(2, retryCount), 30000);
}

/**
 * Log error for debugging (only in development)
 */
export function logError(error: unknown, context?: string): void {
  if (process.env.NODE_ENV === 'development') {
    const errorInfo = handleError(error);
    console.group(`🔴 Error${context ? ` in ${context}` : ''}`);
    console.error('Code:', errorInfo.code);
    console.error('Message:', errorInfo.message);
    console.error('Status:', errorInfo.statusCode);
    console.error('Retryable:', errorInfo.retryable);
    if (errorInfo.details) {
      console.error('Details:', errorInfo.details);
    }
    console.groupEnd();
  }
}