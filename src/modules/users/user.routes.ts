import { Router } from 'express'

import { authenticateToken } from '../../middleware/auth.middleware.js'
import { authLimiter } from '../../middleware/rateLimit.middleware.js'
import UserController from './user.controller.js'

const userRouter = Router()
const userController = new UserController()

userRouter.post('/register', userController.register)
userRouter.post('/login', authLimiter, userController.login)
userRouter.post('/refresh-token', authLimiter, userController.refreshToken)

userRouter.get('/', authenticateToken, userController.getAll)
userRouter.get('/me', authenticateToken, userController.getMe)

export default userRouter
