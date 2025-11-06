import type { Request as ExpressRequest, NextFunction, Response } from 'express'

import jwt from 'jsonwebtoken'

import env from '../config/env.js'

export interface AuthenticatedRequest<T = unknown> extends ExpressRequest {
  body: T
  userId?: string
}

export const authenticateToken = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization
  const token = authHeader?.split(' ')[1]

  if (!token) {
    return res.status(401).json({ message: 'No token provided' })
  }

  const decoded = jwt.verify(token, env.JWT_SECRET) as { id: string }
  req.userId = decoded.id
  next()
}
