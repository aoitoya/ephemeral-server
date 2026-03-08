import crypto from 'node:crypto'

export function generateCsrfToken() {
  return crypto.randomBytes(16).toString('hex')
}
