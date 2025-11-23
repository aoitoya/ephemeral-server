import { Router } from 'express'

import UserController from '../controllers/user.controller.js'
import { authenticateToken } from '../middleware/auth.middleware.js'
import { authLimiter } from '../middleware/rateLimit.middleware.js'

const userRouter = Router()
const userController = new UserController()

userRouter.post('/register', userController.register)
userRouter.post('/login', authLimiter, userController.login)
userRouter.post('/refresh-token', authLimiter, userController.refreshToken)

userRouter.get('/', authenticateToken, userController.getAll)

export default userRouter
