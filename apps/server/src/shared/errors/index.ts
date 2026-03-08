export type TokenErrorType = 'EXPIRED' | 'INVALID'

export class AppError extends Error {
  constructor(
    message: string,
    public statusCode = 500,
    public code = 'APP_ERROR'
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string, code = 'AUTHENTICATION_ERROR') {
    super(message, 401, code)
    this.name = 'AuthenticationError'
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string) {
    super(message, 403, 'AUTHORIZATION_ERROR')
    this.name = 'AuthorizationError'
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, 'CONFLICT_ERROR')
    this.name = 'ConflictError'
  }
}

export class DatabaseError extends AppError {
  constructor(
    message: string,
    public originalError?: Error
  ) {
    super(message, 500, 'DATABASE_ERROR')
    this.name = 'DatabaseError'
  }
}

export class NotFoundError extends AppError {
  constructor(message: string) {
    super(message, 404, 'NOT_FOUND')
    this.name = 'NotFoundError'
  }
}

export class RateLimitError extends AppError {
  constructor(message: string) {
    super(message, 429, 'RATE_LIMIT_ERROR')
    this.name = 'RateLimitError'
  }
}

export class ServiceUnavailableError extends AppError {
  constructor(message: string) {
    super(message, 503, 'SERVICE_UNAVAILABLE')
    this.name = 'ServiceUnavailableError'
  }
}

export class TokenError extends AppError {
  constructor(
    message = 'Token error',
    public tokenErrorType: TokenErrorType = 'INVALID'
  ) {
    const code = tokenErrorType === 'EXPIRED' ? 'TOKEN_EXPIRED' : 'TOKEN_ERROR'
    super(message, 401, code)
    this.name = 'TokenError'
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400, 'VALIDATION_ERROR')
    this.name = 'ValidationError'
  }
}
