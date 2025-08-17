import { z } from 'zod';

/**
 * Backend Response Schemas
 * These schemas match the exact response format from the backend utils/responses.py
 */

// Success response wrapper from success_response()
export const BackendSuccessResponseSchema = z.object({
  success: z.literal(true),
  data: z.unknown(),
  meta: z.record(z.any()).optional(),
  timestamp: z.string()
});

// Error response wrapper from error_response()
export const BackendErrorResponseSchema = z.object({
  success: z.literal(false),
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.record(z.any()).optional()
  }),
  timestamp: z.string()
});

// Paginated response wrapper from paginated_response()
export const BackendPaginatedResponseSchema = z.object({
  success: z.literal(true),
  data: z.unknown(),
  meta: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    has_more: z.boolean()
  }),
  timestamp: z.string()
});

// Union type for any backend response
export const BackendResponseSchema = z.union([
  BackendSuccessResponseSchema,
  BackendErrorResponseSchema,
  BackendPaginatedResponseSchema
]);

// Type inference for TypeScript
export type BackendSuccessResponse = z.infer<typeof BackendSuccessResponseSchema>;
export type BackendErrorResponse = z.infer<typeof BackendErrorResponseSchema>;
export type BackendPaginatedResponse = z.infer<typeof BackendPaginatedResponseSchema>;
export type BackendResponse = z.infer<typeof BackendResponseSchema>;

// Utility types for extracting data and meta
export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  has_more: boolean;
};

export type ApiSuccessResult<T> = {
  data: T;
  meta?: Record<string, any>;
};

export type ApiPaginatedResult<T> = {
  data: T;
  meta: PaginationMeta;
};