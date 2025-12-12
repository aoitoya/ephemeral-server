import { Connection } from '../../db/schema.js'
import { notificationService } from '../../index.js'
import { ConnectionRepository } from './connection.repository.js'

export class ConnectionService {
  private connectionRepository: ConnectionRepository

  constructor() {
    this.connectionRepository = new ConnectionRepository()
  }

  async getConnectionBetweenUsers(userId1: string, userId2: string) {
    return await this.connectionRepository.findConnectionBetweenUsers(
      userId1,
      userId2
    )
  }

  async getConnections(
    userId: string,
    status?: Connection['status'],
    reqBy?: 'me' | 'others'
  ) {
    return await this.connectionRepository.findConnectionsByUser(
      userId,
      status,
      reqBy
    )
  }

  async getOnlineConnections(userId: string) {
    return await this.connectionRepository.findOnlineConnectionsByUser(userId)
  }

  async removeConnection(connectionId: string, userId: string) {
    const connection = await this.connectionRepository.findConnectionById(
      connectionId,
      userId
    )

    if (!connection) {
      throw new Error('Connection not found')
    }

    return await this.connectionRepository.updateConnection(connectionId, {
      status: 'cancelled',
    })
  }

  async requestConnection(
    targetUserId: string,
    actorUser: { id: string; username: string }
  ) {
    const existingConnection =
      await this.connectionRepository.findConnectionBetweenUsers(
        actorUser.id,
        targetUserId
      )

    if (existingConnection) {
      if (existingConnection.status === 'rejected') {
        return await this.connectionRepository.updateConnection(
          existingConnection.id,
          {
            blockedBy: null,
            requestedBy: actorUser.id,
            status: 'pending',
          }
        )
      }

      return existingConnection
    }

    const conn = await this.connectionRepository.createConnection({
      requestedBy: actorUser.id,
      status: 'pending',
      userA: actorUser.id,
      userB: targetUserId,
    })

    await notificationService.sendConnectionReqReceived(targetUserId, actorUser)

    return conn
  }

  async respondToConnectionRequest(
    connectionId: string,
    userId: string,
    action: 'accept' | 'reject'
  ) {
    const connection = await this.connectionRepository.findPendingConnection(
      connectionId,
      userId
    )

    if (!connection) {
      throw new Error('Connection request not found or already processed')
    }

    if (action === 'accept') {
      return await this.connectionRepository.acceptConnection(connectionId)
    } else {
      return await this.connectionRepository.rejectConnection(connectionId)
    }
  }
}

export default new ConnectionService()
