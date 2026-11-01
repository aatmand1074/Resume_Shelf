export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: unknown
  }
  timestamp: number
}

export function createSuccessResponse<T>(data: T): ApiResponse<T> {
  return {
    success: true,
    data,
    timestamp: Date.now(),
  }
}

export function createErrorResponse(
  message: string,
  code = 'INTERNAL_ERROR',
  details?: unknown
): ApiResponse<never> {
  return {
    success: false,
    error: {
      code,
      message,
      details,
    },
    timestamp: Date.now(),
  }
}

export class AppError extends Error {
  constructor(
    message: string,
    public readonly code: string = 'APP_ERROR',
    public readonly status: number = 400,
    public readonly details?: unknown
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 'VALIDATION_ERROR', 422, details)
    this.name = 'ValidationError'
  }
}

export class NotFoundError extends AppError {
  constructor(entity: string, id: string) {
    super(`${entity} with id '${id}' not found`, 'NOT_FOUND', 404)
    this.name = 'NotFoundError'
  }
}

export class StorageError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 'STORAGE_ERROR', 500, details)
    this.name = 'StorageError'
  }
}
