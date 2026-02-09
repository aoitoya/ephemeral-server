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
    return res.status(403).json({ code: 'CSRF_MISMATCH', message: 'Forbidden' })
  }

  const authHeader = req.headers.authorization
  const token = authHeader?.startsWith('Bearer ')
    ? authHeader.slice(7)
    : undefined

  if (!token) {
    return res
      .status(401)
      .json({ code: 'NO_TOKEN', message: 'Unauthorized: no token' })
  }

  let decoded: jwt.JwtPayload | string

  try {
    decoded = jwt.verify(token, env.JWT_ACCESS_SECRET)

    if (typeof decoded !== 'object') {
      return res
        .status(401)
        .json({ code: 'INVALID_TOKEN', message: 'Invalid token' })
    }
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        code: 'TOKEN_EXPIRED',
        message: 'Token has expired',
      })
    }
    return res
      .status(401)
      .json({ code: 'INVALID_TOKEN', message: 'Invalid token' })
  }

  const sessionUser = req.session.user
  if (!sessionUser) {
    return res
      .status(401)
      .json({ code: 'NO_SESSION', message: 'Unauthorized: session' })
  }

  if (sessionUser.id !== decoded.sub) {
    return res
      .status(401)
      .json({ code: 'USER_MISMATCH', message: 'Unauthorized: no user' })
  }

  next()
}
