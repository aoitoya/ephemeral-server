import type { NextFunction, Request, Response } from 'express'

import logger from '../config/logger.js'
import { AppError } from './errors/index.js'

export const handleAppError = (
  error: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  if (error instanceof AppError) {
    const response = {
      error: {
        code: error.code,
        message: error.message,
        statusCode: error.statusCode,
      },
      success: false,
    }

    res.status(error.statusCode).json(response)
    return
  }

  logger.error('Unexpected error:', error)
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
