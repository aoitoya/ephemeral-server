import type { Request } from 'express'
import type { Socket } from 'socket.io'

import { Server } from 'socket.io'
import { z } from 'zod'

import { sessionMiddleware } from '../middleware/session.middleware.js'
import {
  socketAuthMiddleware as authMiddleware,
  wrapExpressMiddleware as wrap,
} from '../middleware/socket.middleware.js'
import { ChatMessageRepository } from '../repositories/chatMessage.repository.js'
import UserRepository from '../repositories/user.repository.js'
import { ConnectionService } from '../services/connection.service.js'
import { getIO } from './socket.js'

type AuthenticatedRequest = Request & {
  session: {
    user: {
      id: string
      username: string
    }
  }
}

const RoomSchema = z.object({
  id: z.string().min(1),
  type: z.enum(['group', 'single']),
})

const MessageSchema = z.object({
  content: z.string().min(1),
  room: RoomSchema,
})

type Room = z.infer<typeof RoomSchema>

class MessageService {
  private chatMessageRepository: ChatMessageRepository
  private connectionService: ConnectionService
  private io: null | Server
  private userRepository: UserRepository

  constructor() {
    this.connectionService = new ConnectionService()
    this.userRepository = new UserRepository()
    this.chatMessageRepository = new ChatMessageRepository()
    this.io = getIO()
  }

  public init() {
    this.initializeSessionMiddleware()
    this.initializeSocketEvents()
  }

  private async broadcastActiveUsers(socket: Socket) {
    const io = this.io
    if (!io) {
      throw new Error('Socket.io instance not initialized')
    }

    const currentUser = (socket.request as AuthenticatedRequest).session.user

    // Get all active connections for this user
    const connections = await this.connectionService.getConnections(
      currentUser.id,
      'active'
    )

    // Get all online users
    const allUsers = await this.userRepository.getAll()
    const onlineUsers = allUsers.filter((u) => u.isOnline)

    // Broadcast to each connected user's room
    for (const connection of connections) {
      const roomID = this.getRoomID(
        { id: connection.user.id, type: 'single' },
        currentUser.id
      )
      io.to(roomID).emit('users:active', {
        onlineUsers: onlineUsers.map(
          ({ id, isOnline, lastOnline, username }) => ({
            id,
            isOnline,
            lastOnline,
            username,
          })
        ),
      })
    }
  }

  private getRoomID(room: Room, userId: string) {
    if (room.type === 'group') {
      return room.id
    }

    return [userId, room.id].sort((a, b) => a.localeCompare(b)).join(':')
  }

  private initializeChatHandler(socket: Socket) {
    const io = this.io
    if (!io) {
      throw new Error('Socket.io instance not initialized')
    }

    socket.on('chat:join', async (data) => {
      const parsedRoom = RoomSchema.safeParse(data)
      if (!parsedRoom.success) {
        socket.emit('chat:error', { message: 'Invalid room data' })
        return
      }

      const room = parsedRoom.data
      const user = (socket.request as AuthenticatedRequest).session.user
      const roomID = this.getRoomID(room, user.id)
      await socket.join(roomID)

      if (room.type === 'group') {
        const messages = await this.chatMessageRepository.getMessages(room.id)
        socket.emit('chat:messages', messages)
      } else {
        const messages = await this.chatMessageRepository.getMessages(
          room.id,
          user.id
        )
        socket.emit('chat:messages', messages)
      }
    })

    socket.on('chat:message', async (data) => {
      const parsedMsg = MessageSchema.safeParse(data)
      if (!parsedMsg.success) {
        socket.emit('chat:error', { message: 'Invalid message data' })
        return
      }

      const user = (socket.request as AuthenticatedRequest).session.user
      const room = parsedMsg.data.room
      const roomID = this.getRoomID(room, user.id)

      const message = {
        content: parsedMsg.data.content,
        createdAt: new Date().toISOString(),
        from: user,
        id: Date.now().toString(),
      }

      await this.chatMessageRepository.addMessage({
        content: message.content,
        recipentId: room.id,
        senderId: user.id,
      })

      io.to(roomID).emit('chat:message', message)
    })
  }

  private initializeSessionMiddleware() {
    if (!this.io) {
      throw new Error('Socket.io instance not initialized')
    }

    this.io.use(wrap(sessionMiddleware))
    this.io.use(authMiddleware)
  }

  private initializeSocketEvents() {
    if (!this.io) {
      throw new Error('Socket.io instance not initialized')
    }

    this.io.on('connection', async (socket: Socket) => {
      this.initializeChatHandler(socket)
      await this.setUserStatus(socket, true)

      // Broadcast active users to all connections
      await this.broadcastActiveUsers(socket)

      socket.on('disconnect', async () => {
        await this.setUserStatus(socket, false)
        // Broadcast updated active users to all connections
        await this.broadcastActiveUsers(socket)
      })
    })
  }

  private async setUserStatus(socket: Socket, isOneline: boolean) {
    const user = (socket.request as AuthenticatedRequest).session.user
    await this.userRepository.setStatus(user.id, isOneline)
  }
}

export default MessageService
