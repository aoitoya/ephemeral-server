import cookieParser from 'cookie-parser'
import cors from 'cors'
import express from 'express'
import helmet from 'helmet'

import errorHandler from './middleware/errorHandler.js'
import postRouter from './routes/post.routes.js'
import userRouter from './routes/user.routes.js'

const app = express()

const corsOptions = {
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  origin: '*',
}

// eslint-disable-next-line sonarjs/cors
app.use(cors(corsOptions))
app.use(helmet())
app.use(express.json())
app.use(cookieParser())

app.use('/api/v1/users', userRouter)
app.use('/api/v1/posts', postRouter)

app.use(errorHandler)

export default app
