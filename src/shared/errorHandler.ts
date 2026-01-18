import type { NextFunction, Request, Response } from 'express'

import { AppError, DatabaseError } from './errors/index.js'

export const handleAppError = (
  error: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  if (error instanceof AppError) {
    const response: {
      error: {
        code: string
        message: string
        originalError?: {
          message: string
          stack?: string
        }
        statusCode: number
      }
      success: boolean
    } = {
      error: {
        code: error.code,
        message: error.message,
        statusCode: error.statusCode,
      },
      success: false,
    }

    if (error instanceof DatabaseError && error.originalError) {
      if (process.env.NODE_ENV === 'development') {
        response.error.originalError = {
          message: error.originalError.message,
          stack: error.originalError.stack,
        }
      }
    }

    res.status(error.statusCode).json(response)
    return
  }

  console.error('Unexpected error:', error)
  res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
      statusCode: 500,
    },
    success: false,
  })
}

export const errorHandler = (
  error: unknown,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  handleAppError(error, req, res, next)
}
