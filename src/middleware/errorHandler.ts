import { NextFunction, Request, Response } from 'express'

function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  console.log(err)
  res.status(500).json({ message: 'Something went wrong' })
}

export default errorHandler
