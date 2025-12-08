import { and, eq, or } from 'drizzle-orm'

import { db } from '../db/connection.js'
import { chatMessages, NewChatMessage, users } from '../db/schema.js'

export class ChatMessageRepository {
  async addMessage(params: NewChatMessage) {
    const result = await db.insert(chatMessages).values(params).returning()
    return result[0]
  }

  async getMessages(userA: string, userB?: string) {
    const whereClause = userB
      ? or(
          and(
            eq(chatMessages.recipentId, userA),
            eq(chatMessages.senderId, userB)
          ),
          and(
            eq(chatMessages.recipentId, userB),
            eq(chatMessages.senderId, userA)
          )
        )
      : eq(chatMessages.recipentId, userA)

    const result = await db
      .select({
        content: chatMessages.content,
        createdAt: chatMessages.createdAt,
        from: {
          id: users.id,
          username: users.username,
        },
        id: chatMessages.id,
      })
      .from(chatMessages)
      .where(whereClause)
      .leftJoin(users, eq(chatMessages.senderId, users.id))
    return result
  }
}
