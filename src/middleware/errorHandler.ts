import { NextFunction, Request, Response } from 'express'

import { AppError } from '../shared/errors/index.js'

function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  console.log(err)

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      code: err.code,
      message: err.message,
    })
  } else {
    res
      .status(500)
      .json({ code: 'INTERNAL_ERROR', message: 'Something went wrong' })
  }
}

export default errorHandler
