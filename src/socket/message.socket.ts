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
import { userSocketMap } from './socket.js'

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
  private io: Server
  private userRepository: UserRepository

  constructor(io: Server) {
    this.connectionService = new ConnectionService()
    this.userRepository = new UserRepository()
    this.chatMessageRepository = new ChatMessageRepository()
    this.io = io
  }

  public init() {
    this.initializeSessionMiddleware()
    this.initializeSocketEvents()
  }

  private async broadcastActiveUsers(socket: Socket) {
    const currentUser = (socket.request as AuthenticatedRequest).session.user

    const connections = await this.connectionService.getOnlineConnections(
      currentUser.id
    )

    for (const connection of connections) {
      const roomId = userSocketMap.get(connection.id)

      if (roomId) {
        this.io.to(roomId).emit('user:active', {
          id: connection.id,
          username: connection.username,
        })
      }
    }
  }

  private getRoomID(room: Room, userId: string) {
    if (room.type === 'group') {
      return room.id
    }

    return [userId, room.id].sort((a, b) => a.localeCompare(b)).join(':')
  }

  private initializeChatHandler(socket: Socket) {
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

      this.io.to(roomID).emit('chat:message', message)
    })
  }

  private initializeSessionMiddleware() {
    this.io.use(wrap(sessionMiddleware))
    this.io.use(authMiddleware)
  }

  private initializeSocketEvents() {
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
    userSocketMap.set(user.id, socket.id)
    await this.userRepository.setStatus(user.id, isOneline)
  }
}

export default MessageService
