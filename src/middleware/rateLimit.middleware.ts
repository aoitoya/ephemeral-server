import type { RequestHandler } from 'express'

import rateLimit from 'express-rate-limit'

interface RateLimitOptions {
  legacyHeaders?: boolean
  max: number
  standardHeaders?: 'draft-7' | boolean
  windowMs: number
}
const rateLimitFn = rateLimit as unknown as (
  opts: RateLimitOptions
) => RequestHandler

export const globalLimiter = rateLimitFn({
  legacyHeaders: false,
  max: 15000,
  standardHeaders: 'draft-7',
  windowMs: 15 * 60 * 1000,
})

export const authLimiter = rateLimitFn({
  legacyHeaders: false,
  max: 10,
  standardHeaders: 'draft-7',
  windowMs: 60 * 1000,
})
