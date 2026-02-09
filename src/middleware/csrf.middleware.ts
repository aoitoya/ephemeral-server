import type { Request as ExpressRequest, NextFunction, Response } from 'express'

import crypto from 'node:crypto'

export const validateCsrf = (
  req: ExpressRequest,
  res: Response,
  next: NextFunction
) => {
  const csrfHeader = req.header('x-xsrf-token')
  const csrfCookie = req.cookies['XSRF-TOKEN'] as string | undefined

  if (!csrfHeader || !csrfCookie) {
    return res.status(403).json({ error: 'Forbidden' })
  }

  const headerBuffer = Buffer.from(csrfHeader)
  const cookieBuffer = Buffer.from(csrfCookie)

  if (headerBuffer.length !== cookieBuffer.length) {
    return res.status(403).json({ error: 'Forbidden' })
  }

  if (!crypto.timingSafeEqual(headerBuffer, cookieBuffer)) {
    return res.status(403).json({ error: 'Forbidden' })
  }

  next()
}
