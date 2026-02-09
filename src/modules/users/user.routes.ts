import { Router } from 'express'

import { authenticateToken } from '../../middleware/auth.middleware.js'
import { validateCsrf } from '../../middleware/csrf.middleware.js'
import { authLimiter } from '../../middleware/rateLimit.middleware.js'
import { validateRequestBody } from '../../middleware/validate.middleware.js'
import UserController from './user.controller.js'
import { createUserSchema, loginSchema } from './user.validation.js'

const userRouter = Router()
const userController = new UserController()

userRouter.post(
  '/register',
  validateRequestBody(createUserSchema),
  userController.register
)
userRouter.post(
  '/login',
  authLimiter,
  validateRequestBody(loginSchema),
  userController.login
)
userRouter.post(
  '/refresh-token',
  authLimiter,
  validateCsrf,
  userController.refreshToken
)
userRouter.post('/logout', authLimiter, validateCsrf, userController.logout)

userRouter.get('/me', authenticateToken, userController.getMe)

export default userRouter
