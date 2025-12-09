import { Router } from 'express'

import PostController from '../controllers/post.controller.js'
import { authenticateToken } from '../middleware/auth.middleware.js'
import { validateRequestBody } from '../middleware/validate.middleware.js'
import {
  createCommentSchema,
  createPostSchema,
  createVoteSchema,
} from '../validations/post.validation.js'

const postRouter = Router()
const postController = new PostController()

postRouter.post(
  '/',
  authenticateToken,
  validateRequestBody(createPostSchema),
  postController.createPost
)

postRouter.get('/', postController.getAll)

postRouter.post(
  '/comments',
  authenticateToken,
  validateRequestBody(createCommentSchema),
  postController.createComment
)

postRouter.get('/comments', postController.getComments)

postRouter.post(
  '/vote',
  authenticateToken,
  validateRequestBody(createVoteSchema),
  postController.vote
)

export default postRouter
