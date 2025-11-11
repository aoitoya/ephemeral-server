import jwt from 'jsonwebtoken'
import crypto from 'node:crypto'

import env from '../config/env.js'

export function generateAccessToken(user: { id: string }) {
  const accessToken = jwt.sign({ sub: user.id }, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN,
  })

  return accessToken
}

export function generateCsrfToken() {
  return crypto.randomBytes(16).toString('hex')
}

export function generateRefreshToken(length = 48) {
  return crypto.randomBytes(length).toString('hex')
}

export function hashToken(token: string) {
  return crypto.createHash('sha256').update(token).digest('hex')
}
