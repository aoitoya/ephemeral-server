import { Router } from 'express'

import PostController from '../controllers/post.controller.js'
import { authenticateToken } from '../middleware/auth.middleware.js'
import { validateRequestBody } from '../middleware/validate.middleware.js'
import {
  createCommentSchema,
  createPostSchema,
} from '../validations/post.validation.js'

const postRouter = Router()
const postController = new PostController()

postRouter.post(
  '/',
  authenticateToken,
  validateRequestBody(createPostSchema),
  postController.createPost
)
postRouter.get('/', authenticateToken, postController.getPosts)
postRouter.post(
  '/comments',
  authenticateToken,
  validateRequestBody(createCommentSchema),
  postController.createComment
)

export default postRouter
