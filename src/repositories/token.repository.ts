import { eq, lt } from 'drizzle-orm'
import crypto from 'node:crypto'

import { db } from '../db/connection.js'
import { RefreshToken, refreshTokens } from '../db/schema.js'

class TokenRepository {
  async deleteExpiredTokens() {
    await db
      .delete(refreshTokens)
      .where(lt(refreshTokens.expiresAt, new Date()))
  }

  async getValidToken(token: string) {
    const tokenHash = hashToken(token)
    const result = await db
      .select()
      .from(refreshTokens)
      .where(eq(refreshTokens.tokenHash, tokenHash))
      .limit(1)

    return (result[0] ?? null) as null | RefreshToken
  }

  async revokeAllTokens(userId: string) {
    await db.delete(refreshTokens).where(eq(refreshTokens.userId, userId))
  }

  async revokeToken(token: string) {
    const tokenHash = hashToken(token)
    await db
      .update(refreshTokens)
      .set({ revoked: true })
      .where(eq(refreshTokens.tokenHash, tokenHash))
  }

  async rotateToken(oldToken: string, newToken: string, expiresAt: Date) {
    const oldTokenHash = hashToken(oldToken)
    const newTokenHash = hashToken(newToken)
    const [revokedToken] = await db
      .update(refreshTokens)
      .set({ revoked: true })
      .where(eq(refreshTokens.tokenHash, oldTokenHash))
      .returning()

    const [savedToken] = await db
      .insert(refreshTokens)
      .values({
        deviceInfo: revokedToken.deviceInfo,
        expiresAt,
        tokenHash: newTokenHash,
        userId: revokedToken.userId,
      })
      .returning()

    return savedToken
  }

  async save(
    userId: string,
    token: string,
    expiresAt: Date,
    deviceInfo?: string
  ) {
    const tokenHash = hashToken(token)
    await db.insert(refreshTokens).values({
      deviceInfo,
      expiresAt,
      tokenHash,
      userId,
    })
  }
}

export function hashToken(token: string) {
  return crypto.createHash('sha256').update(token).digest('hex')
}

const tokenRepository = new TokenRepository()
export default tokenRepository
