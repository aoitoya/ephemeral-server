import cookieParser from 'cookie-parser'
import cors from 'cors'
import express from 'express'
import helmet from 'helmet'
import pino from 'pino'
import { pinoHttp } from 'pino-http'

import { authenticateToken } from './middleware/auth.middleware.js'
import errorHandler from './middleware/errorHandler.js'
import { globalLimiter } from './middleware/rateLimit.middleware.js'
import { sessionMiddleware } from './middleware/session.middleware.js'
import postRouter from './routes/post.routes.js'
import userRouter from './routes/user.routes.js'

const app = express()

const corsOptions = {
  allowedHeaders: ['Content-Type', 'Authorization', 'x-xsrf-token'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  origin: ['http://localhost:5173'],
}

app.use(pinoHttp({ logger: pino({ level: 'info' }) }))
app.use(cors(corsOptions))
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
      },
      reportOnly: true,
      useDefaults: true,
    },
  })
)
app.use(globalLimiter)
app.use(sessionMiddleware)
app.use(express.json())
app.use(cookieParser())

app.use('/api/v1/users', userRouter)
app.use('/api/v1/posts', authenticateToken, postRouter)

app.use(errorHandler)

export default app
