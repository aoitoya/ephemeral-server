import cookieParser from 'cookie-parser'
import cors from 'cors'
import express from 'express'
import helmet from 'helmet'
import pino from 'pino'
import { pinoHttp } from 'pino-http'

import env from './config/env.js'
import { authenticateToken } from './middleware/auth.middleware.js'
import { globalLimiter } from './middleware/rateLimit.middleware.js'
import { sessionMiddleware } from './middleware/session.middleware.js'
import connectionRouter from './modules/connections/connection.routes.js'
import mediaRouter from './modules/media/media.routes.js'
import postRouter from './modules/posts/post.routes.js'
import userRouter from './modules/users/user.routes.js'
import { errorHandler } from './shared/errorHandler.js'

const app = express()

app.set('trust proxy', 1)

const getCorsOrigins = (): string[] => {
  const origins = env.CORS_ORIGINS.split(',')
    .map((o) => o.trim())
    .filter(Boolean)
  return origins
}

const corsOptions = {
  allowedHeaders: ['Content-Type', 'Authorization', 'x-xsrf-token'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  origin: getCorsOrigins(),
}

app.use(
  pinoHttp({
    logger: pino({
      formatters: {
        log: (obj) => ({
          req: obj.req,
        }),
      },
      redact: ['req.headers'],
      transport:
        env.NODE_ENV === 'development'
          ? {
              target: 'pino-pretty',
            }
          : undefined,
    }),
  })
)

app.use(cors(corsOptions))
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
)
app.use(globalLimiter)
app.use(sessionMiddleware)
app.use(express.json())
app.use(cookieParser())

app.use('/api/v1/users', userRouter)
app.use('/api/v1/posts', postRouter)
app.use('/api/v1/connections', authenticateToken, connectionRouter)
app.use('/api/v1/media', mediaRouter)

app.use(errorHandler)

export default app
