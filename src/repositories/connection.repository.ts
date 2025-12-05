import { and, eq, ne, or } from 'drizzle-orm'
import { alias } from 'drizzle-orm/pg-core'

import { db } from '../db/connection.js'
import { Connection, connections, NewConnection, users } from '../db/schema.js'

export class ConnectionRepository {
  async acceptConnection(connectionId: string) {
    return await this.updateConnection(connectionId, {
      acceptedAt: new Date(),
      status: 'active',
    })
  }

  async createConnection(
    data: Pick<NewConnection, 'requestedBy' | 'status' | 'userA' | 'userB'>
  ) {
    const result = await db
      .insert(connections)
      .values({
        requestedBy: data.requestedBy,
        status: data.status ?? 'pending',
        userA: data.userA,
        userB: data.userB,
      })
      .returning()

    return result[0]
  }

  async deleteConnection(connectionId: string) {
    const result = await db
      .delete(connections)
      .where(eq(connections.id, connectionId))
      .returning()

    return result[0] || null
  }

  async findConnectionBetweenUsers(
    userId1: string,
    userId2: string
  ): Promise<Connection | null> {
    const [userA, userB] = [userId1, userId2].sort((a, b) => a.localeCompare(b))

    const result = await db
      .select()
      .from(connections)
      .where(and(eq(connections.userA, userA), eq(connections.userB, userB)))
      .limit(1)

    return result[0] || null
  }

  async findConnectionById(
    connectionId: string,
    userId?: string
  ): Promise<Connection | null> {
    const whereClause = userId
      ? and(
          eq(connections.id, connectionId),
          or(eq(connections.userA, userId), eq(connections.userB, userId))
        )
      : eq(connections.id, connectionId)

    const result = await db
      .select()
      .from(connections)
      .where(whereClause)
      .limit(1)

    return result[0] || null
  }

  async findConnectionsByUser(
    userId: string,
    status?: Connection['status'],
    reqBy?: 'me' | 'others'
  ): Promise<
    {
      createdAt: Date
      id: string
      status: 'active' | 'blocked' | 'cancelled' | 'pending' | 'rejected'
      user: {
        id: string
        username: string
      }
    }[]
  > {
    const whereClause = and(
      or(eq(connections.userA, userId), eq(connections.userB, userId)),
      status ? eq(connections.status, status) : undefined,
      reqBy === 'me' ? eq(connections.requestedBy, userId) : undefined,
      reqBy === 'others' ? ne(connections.requestedBy, userId) : undefined
    )

    const userA = alias(users, 'userA')
    const userB = alias(users, 'userB')

    const query = db
      .select({
        createdAt: connections.createdAt,
        id: connections.id,
        status: connections.status,
        userA: connections.userA,
        userAUsername: userA.username,
        userB: connections.userB,
        userBUsername: userB.username,
      })
      .from(connections)
      .where(whereClause)
      .leftJoin(userA, eq(connections.userA, userA.id))
      .leftJoin(userB, eq(connections.userB, userB.id))

    const result = await query

    return result.map((r) => ({
      createdAt: r.createdAt,
      id: r.id,
      status: r.status,
      user:
        r.userA === userId
          ? { id: r.userB, username: r.userBUsername ?? '' }
          : { id: r.userA, username: r.userAUsername ?? '' },
    }))
  }

  async findOnlineConnectionsByUser(userId: string) {
    const userA = alias(users, 'userA')
    const userB = alias(users, 'userB')

    const result = await db
      .select({
        id: connections.id,
        userA: connections.userA,
        userAUsername: userA.username,
        userB: connections.userB,
        userBUsername: userB.username,
      })
      .from(connections)
      .leftJoin(userA, eq(connections.userA, userA.id))
      .leftJoin(userB, eq(connections.userB, userB.id))
      .where(
        and(
          or(eq(connections.userA, userId), eq(connections.userB, userId)),
          eq(connections.status, 'active'),
          and(eq(userA.isOnline, true), eq(userB.isOnline, true))
        )
      )

    return result.map((r) =>
      r.userA === userId
        ? {
            id: r.userB,
            username: r.userBUsername,
          }
        : { id: r.userA, username: r.userAUsername }
    )
  }

  async findPendingConnection(
    connectionId: string,
    userId: string
  ): Promise<Connection | null> {
    const result = await db
      .select()
      .from(connections)
      .where(
        and(
          eq(connections.id, connectionId),
          or(eq(connections.userA, userId), eq(connections.userB, userId)),
          eq(connections.status, 'pending')
        )
      )
      .limit(1)

    return result[0] || null
  }

  async findPendingConnections(userId: string) {
    return await db
      .select()
      .from(connections)
      .where(
        and(
          or(eq(connections.userA, userId), eq(connections.userB, userId)),
          eq(connections.status, 'pending'),
          eq(connections.requestedBy, userId)
        )
      )
  }

  async rejectConnection(connectionId: string) {
    return await this.updateConnection(connectionId, {
      status: 'rejected',
    })
  }

  async updateConnection(
    connectionId: string,
    data: Partial<typeof connections.$inferInsert>
  ) {
    const result = await db
      .update(connections)
      .set(data)
      .where(eq(connections.id, connectionId))
      .returning()

    return result[0] || null
  }
}

export const connectionRepository = new ConnectionRepository()
