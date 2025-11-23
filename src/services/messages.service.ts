import type { Request } from 'express'
import type { Server as HTTPServer } from 'node:http'
import type { Socket } from 'socket.io'

import { Server } from 'socket.io'
import { z } from 'zod'

import { sessionMiddleware } from '../middleware/session.middleware.js'
import {
  socketAuthMiddleware as authMiddleware,
  wrapExpressMiddleware as wrap,
} from '../middleware/socket.middleware.js'

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
  private io: Server | undefined

  public init(server: HTTPServer) {
    this.io = new Server(server, {
      cors: {
        allowedHeaders: ['Content-Type', 'Authorization', 'x-xsrf-token'],
        credentials: true,
        methods: ['GET', 'POST', 'OPTIONS'],
        origin: ['http://localhost:5173'],
      },
    })
    this.initializeSessionMiddleware()
    this.initializeSocketEvents()
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

      const user = (socket.request as AuthenticatedRequest).session.user
      const roomID = this.getRoomID(parsedRoom.data, user.id)
      await socket.join(roomID)
    })

    socket.on('chat:message', (data) => {
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

    this.io.on('connection', (socket: Socket) => {
      this.initializeChatHandler(socket)
    })
  }
}

const messageService = new MessageService()

export default messageService
