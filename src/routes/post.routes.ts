import { Router } from 'express'

import PostController from '../controllers/post.controller.js'
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
  validateRequestBody(createPostSchema),
  postController.createPost
)

postRouter.get('/', postController.getAll)

postRouter.post(
  '/comments',
  validateRequestBody(createCommentSchema),
  postController.createComment
)

postRouter.post(
  '/vote',
  validateRequestBody(createVoteSchema),
  postController.vote
)

export default postRouter
