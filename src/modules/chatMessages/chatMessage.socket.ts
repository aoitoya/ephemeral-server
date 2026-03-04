import type { Request } from 'express'
import type { Socket } from 'socket.io'

import { Server } from 'socket.io'
import { z } from 'zod'

import { sessionMiddleware } from '../../middleware/session.middleware.js'
import {
  socketAuthMiddleware as authMiddleware,
  wrapExpressMiddleware as wrap,
} from '../../middleware/socket.middleware.js'
import { userSocketMap } from '../../socket/socket.js'
import { ConnectionService } from '../connections/connection.service.js'
import UserRepository from '../users/user.repository.js'
import { ChatMessageRepository } from './chatMessage.repository.js'

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

  /**
   * Broadcasts the current user's online status to all their connections.
   * When a user connects or disconnects, this notifies all connected contacts
   * by emitting a 'user:active' event to each contact's socket room.
   */
  private async broadcastActiveUsers(socket: Socket, isOnline: boolean) {
    // Get the authenticated user from the socket session
    const currentUser = (socket.request as AuthenticatedRequest).session.user

    // Retrieve all connections that should receive the online status update
    const connections = await this.connectionService.getOnlineConnections(
      currentUser.id
    )

    // Emit the active status to each connected user's room
    for (const connection of connections) {
      // Look up the socket room ID for this connection
      const roomId = userSocketMap.get(connection.id)

      // If the connection is currently connected, emit the active event
      if (roomId) {
        this.io.to(roomId).emit(isOnline ? 'user:online' : 'user:offline', {
          id: currentUser.id,
          username: currentUser.username,
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
        recipientId: room.id,
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

      // Broadcast user online to all connections
      await this.broadcastActiveUsers(socket, true)

      socket.on('disconnect', async () => {
        await this.setUserStatus(socket, false)
        // Broadcast user offline to all connections
        await this.broadcastActiveUsers(socket, false)
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
