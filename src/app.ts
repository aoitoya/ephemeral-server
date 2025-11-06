import express from 'express'
import helmet from 'helmet'

import errorHandler from './middleware/errorHandler.js'
import postRouter from './routes/post.routes.js'
import userRouter from './routes/user.routes.js'

const app = express()

app.use(helmet())
app.use(express.json())

app.use('/api/v1/users', userRouter)
app.use('/api/v1/posts', postRouter)

app.use(errorHandler)

export default app
