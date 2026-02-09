import cookieParser from 'cookie-parser'
import cors from 'cors'
import express from 'express'
import helmet from 'helmet'
import pino from 'pino'
import { pinoHttp } from 'pino-http'

import env from './config/env.js'
import { authenticateToken } from './middleware/auth.middleware.js'
import errorHandler from './middleware/errorHandler.js'
import { globalLimiter } from './middleware/rateLimit.middleware.js'
import { sessionMiddleware } from './middleware/session.middleware.js'
import connectionRouter from './modules/connections/connection.routes.js'
import mediaRouter from './modules/media/media.routes.js'
import postRouter from './modules/posts/post.routes.js'
import userRouter from './modules/users/user.routes.js'

const app = express()

const corsOptions = {
  allowedHeaders: ['Content-Type', 'Authorization', 'x-xsrf-token'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  origin: ['http://localhost:5173'],
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
    contentSecurityPolicy: {
      directives: {
        connectSrc: ["'self'"],
        defaultSrc: ["'self'"],
        fontSrc: ["'self'"],
        frameSrc: ["'none'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        mediaSrc: ["'self'"],
        objectSrc: ["'none'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
      },
      reportOnly: env.NODE_ENV !== 'production',
      useDefaults: true,
    },
    crossOriginEmbedderPolicy: false,
    frameguard: {
      action: 'deny',
    },
    hsts: {
      includeSubDomains: true,
      maxAge: 31536000,
      preload: true,
    },
    xContentTypeOptions: true,
    xDnsPrefetchControl: false,
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
