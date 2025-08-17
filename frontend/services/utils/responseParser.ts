import { z } from 'zod';
import { 
  BackendSuccessResponseSchema, 
  BackendErrorResponseSchema, 
  BackendPaginatedResponseSchema,
  type ApiSuccessResult,
  type ApiPaginatedResult 
} from '../schemas/backend.schema';

/**
 * Response Parser Utilities
 * Handle parsing backend response wrappers from utils/responses.py
 */

// Custom error class for API errors
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

  toString(): string {
    return `ApiError [${this.code}]: ${this.message}`;
  }
}

/**
 * Parse a backend success response and extract the data
 */
export function parseSuccessResponse<T>(
  response: any,
  dataSchema: z.ZodSchema<T>
): ApiSuccessResult<T> {
  // First validate the response wrapper
  const wrappedResponse = BackendSuccessResponseSchema.parse(response);
  
  // If success is false, this should not happen but handle gracefully
  if (!wrappedResponse.success) {
    throw new ApiError(
      'INVALID_RESPONSE',
      'Response marked as unsuccessful but parsed as success response'
    );
  }
  
  // Parse the actual data using the provided schema
  const data = dataSchema.parse(wrappedResponse.data);
  
  return {
    data,
    meta: wrappedResponse.meta
  };
}

/**
 * Parse a backend paginated response and extract the data
 */
export function parsePaginatedResponse<T>(
  response: any,
  dataSchema: z.ZodSchema<T>
): ApiPaginatedResult<T> {
  // First validate the paginated response wrapper
  const wrappedResponse = BackendPaginatedResponseSchema.parse(response);
  
  // Parse the actual data using the provided schema
  const data = dataSchema.parse(wrappedResponse.data);
  
  return {
    data,
    meta: wrappedResponse.meta
  };
}

/**
 * Parse any backend response and handle errors
 */
export function parseBackendResponse<T>(
  response: any,
  dataSchema: z.ZodSchema<T>
): ApiSuccessResult<T> {
  try {
    // Check if it's an error response first
    if (response.success === false) {
      const errorResponse = BackendErrorResponseSchema.parse(response);
      throw new ApiError(
        errorResponse.error.code,
        errorResponse.error.message,
        errorResponse.error.details
      );
    }
    
    // Try parsing as success response
    return parseSuccessResponse(response, dataSchema);
    
  } catch (error) {
    // If it's already an ApiError, re-throw it
    if (error instanceof ApiError) {
      throw error;
    }
    
    // If it's a Zod validation error, create a more helpful error
    if (error instanceof z.ZodError) {
      const issues = error.issues.map(issue => {
        const path = issue.path.join('.');
        return `${path}: ${issue.message}`;
      });
      
      throw new ApiError(
        'VALIDATION_ERROR',
        `Response validation failed: ${issues.join(', ')}`,
        { zodError: error, originalResponse: response }
      );
    }
    
    // For any other error, wrap it
    throw new ApiError(
      'PARSE_ERROR',
      `Failed to parse response: ${error instanceof Error ? error.message : 'Unknown error'}`,
      { originalError: error, originalResponse: response }
    );
  }
}

/**
 * Utility function for parsing arrays of data (like datasets list)
 */
export function parseArrayResponse<T>(
  response: any,
  itemSchema: z.ZodSchema<T>
): ApiSuccessResult<T[]> {
  const arraySchema = z.array(itemSchema);
  return parseBackendResponse(response, arraySchema);
}

/**
 * Utility function for parsing paginated arrays of data
 */
export function parsePaginatedArrayResponse<T>(
  response: any,
  itemSchema: z.ZodSchema<T>
): ApiPaginatedResult<T[]> {
  const arraySchema = z.array(itemSchema);
  return parsePaginatedResponse(response, arraySchema);
}

/**
 * Handle and format API errors for user display
 */
export function formatApiError(error: unknown): string {
  if (error instanceof ApiError) {
    // Map specific error codes to user-friendly messages
    switch (error.code) {
      case 'DATASET_NOT_FOUND':
        return 'Dataset not found. It may have been deleted or you may not have access.';
      case 'EPISODE_NOT_FOUND':
        return 'Episode not found in this dataset.';
      case 'TELEMETRY_NOT_FOUND':
        return 'No telemetry data available for this episode.';
      case 'RATE_LIMIT_EXCEEDED':
        return 'Too many requests. Please wait a moment before trying again.';
      case 'FETCH_ERROR':
        return 'Failed to fetch data. Please check your connection and try again.';
      case 'VALIDATION_ERROR':
        return 'Invalid data received from server. Please try again.';
      case 'PARSE_ERROR':
        return 'Unable to process server response. Please try again.';
      default:
        return error.message || 'An unexpected error occurred.';
    }
  }
  
  // Handle Zod validation errors
  if (error instanceof z.ZodError) {
    return 'Invalid data format received from server.';
  }
  
  // Handle generic errors
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'An unexpected error occurred.';
}

/**
 * Type guard to check if an error is an ApiError
 */
export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

/**
 * Create a standardized error response for consistency
 */
export function createErrorResponse(
  code: string,
  message: string,
  details?: any
): never {
  throw new ApiError(code, message, details);
}