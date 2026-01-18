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
    res.status(err.statusCode).json({ message: err.message })
  } else {
    res.status(500).json({ message: 'Something went wrong' })
  }
}

export default errorHandler
