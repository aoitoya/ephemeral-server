import { Server as HTTPServer } from 'http'
import { Server } from 'socket.io'

let io: null | Server = null

export function getIO(): Server {
  if (!io) {
    throw new Error('SocketService not initialized')
  }
  return io
}

export function init(server: HTTPServer) {
  io ??= new Server(server, {
    cors: {
      allowedHeaders: ['Content-Type', 'Authorization', 'x-xsrf-token'],
      credentials: true,
      methods: ['GET', 'POST', 'OPTIONS'],
      origin: ['http://localhost:5173'],
    },
  })
  return io
}
