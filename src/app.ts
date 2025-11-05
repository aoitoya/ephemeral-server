import express from 'express'
import helmet from 'helmet'

import errorHandler from './middleware/errorHandler.js'
import userRouter from './routes/user.routes.js'

const app = express()

app.use(helmet())
app.use(express.json())

app.use('/api/v1/users', userRouter)

app.use(errorHandler)

export default app
