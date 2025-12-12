import { desc, eq } from 'drizzle-orm'

import { db } from '../../db/connection.js'
import { notifications, users } from '../../db/schema.js'

export class NotificationRepository {
  async addApproveConnectionReq(userId: string, actorId: string) {
    const result = await db
      .insert(notifications)
      .values({ actorId, type: 'connection:req-approved', userId })
      .returning()

    return result[0]
  }

  async addNewConnectionReq(userId: string, actorId: string) {
    const result = await db
      .insert(notifications)
      .values({ actorId, type: 'connection:new-req', userId })
      .returning()

    return result[0]
  }

  async getNotifications(userId: string) {
    const result = await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt))
      .leftJoin(users, eq(notifications.actorId, users.id))

    return result
  }
}
