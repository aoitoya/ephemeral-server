import { Request, Response } from 'express'

import { ConnectionService } from '../services/connection.service.js'
import { GetConnectionsQuery } from '../validations/connection.validation.js'

class ConnectionController {
  private connectionService: ConnectionService

  constructor() {
    this.connectionService = new ConnectionService()
  }

  actionConnection = async (req: Request, res: Response) => {
    const { action, requestId } = req.body as {
      action: 'accept' | 'reject'
      requestId: string
    }
    const currentUser = req.session.user

    if (!currentUser) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    await this.connectionService.respondToConnectionRequest(
      requestId,
      currentUser.id,
      action
    )

    const message =
      action === 'accept'
        ? 'Connection request accepted'
        : 'Connection request rejected'

    res.json({ message })
  }

  getConnections = async (req: Request, res: Response) => {
    const { reqBy, status = 'active' } = req.query as GetConnectionsQuery

    const currentUser = req.session.user

    if (!currentUser) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    const connections = await this.connectionService.getConnections(
      currentUser.id,
      status,
      reqBy
    )

    res.json(connections)
  }

  getOnlineConnections = async (req: Request, res: Response) => {
    const currentUser = req.session.user

    if (!currentUser) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    const connections = await this.connectionService.getOnlineConnections(
      currentUser.id
    )

    res.json(connections)
  }

  removeConnection = async (req: Request, res: Response) => {
    const { connectionId } = req.params as { connectionId: string }
    const currentUser = req.session.user

    if (!currentUser) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    await this.connectionService.removeConnection(connectionId, currentUser.id)

    res.json({ message: 'Connection removed successfully' })
  }

  requestConnection = async (req: Request, res: Response) => {
    const { recipientId } = req.body as { recipientId: string }
    const currentUser = req.session.user

    if (!currentUser) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    await this.connectionService.requestConnection(currentUser.id, recipientId)

    res.status(201).json({ message: 'Connection request sent' })
  }
}

export default ConnectionController
