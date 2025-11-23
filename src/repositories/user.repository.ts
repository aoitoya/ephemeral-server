import { eq, sql } from 'drizzle-orm'

import { db } from '../db/connection.js'
import { NewUser, User, users } from '../db/schema.js'

class UserRepository {
  async create(data: NewUser): Promise<User> {
    const result = await db.insert(users).values(data).returning()
    return result[0]
  }

  async findByUsername(username: string): Promise<null | User> {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1)
    return result[0] ?? null
  }

  async getAll(): Promise<Omit<User, 'createdAt' | 'password'>[]> {
    const result = await db
      .select({
        id: users.id,
        isOnline: users.isOnline,
        lastOnline: users.lastOnline,
        username: users.username,
      })
      .from(users)
    return result
  }

  async setStatus(userId: string, isOnline: boolean) {
    const update = isOnline
      ? { isOnline }
      : { isOnline, lastOnline: sql`CURRENT_TIMESTAMP` }
    await db.update(users).set(update).where(eq(users.id, userId))
  }
}

export default UserRepository
