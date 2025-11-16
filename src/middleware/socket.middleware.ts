import type { NextFunction, Request, RequestHandler, Response } from 'express'
import type { Socket } from 'socket.io'

export const wrapExpressMiddleware =
  (middleware: RequestHandler) =>
  (socket: Socket, next: (err?: Error) => void): void => {
    const req = socket.request as Request
    const res = {} as Response
    middleware(req, res, next as NextFunction)
  }

export const socketAuthMiddleware = (
  socket: Socket,
  next: (err?: Error) => void
) => {
  const req = socket.request as Request

  if ('session' in req) {
    const session = (
      req as unknown as {
        session?: { user?: { id: string; username: string } }
      }
    ).session
    if (session?.user) {
      next()
      return
    }
  }

  next(new Error('Unauthorized'))
}
