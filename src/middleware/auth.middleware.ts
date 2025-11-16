import type { Request as ExpressRequest, NextFunction, Response } from 'express'

import jwt from 'jsonwebtoken'

import env from '../config/env.js'

export const authenticateToken = (
  req: ExpressRequest,
  res: Response,
  next: NextFunction
) => {
  const csrfHeader = req.header('x-xsrf-token')
  const csrfCookie = req.cookies['XSRF-TOKEN'] as string | undefined

  if (!csrfHeader || !csrfCookie || csrfHeader !== csrfCookie) {
    return res.status(403).json({ error: 'Forbidden' })
  }

  const authHeader = req.headers.authorization
  const token = authHeader?.startsWith('Bearer ')
    ? authHeader.slice(7)
    : undefined

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  let decoded: jwt.JwtPayload | string

  try {
    decoded = jwt.verify(token, env.JWT_ACCESS_SECRET)

    if (typeof decoded !== 'object') {
      return res.status(401).json({ error: 'Unauthorized' })
    }
  } catch (error) {
    console.log(error)
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const sessionUser = req.session.user
  if (!sessionUser) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  if (sessionUser.id !== decoded.sub) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  next()
}
