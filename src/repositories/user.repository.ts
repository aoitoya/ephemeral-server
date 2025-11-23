import { eq } from 'drizzle-orm'

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
        username: users.username,
      })
      .from(users)
    return result
  }
}

export default UserRepository
