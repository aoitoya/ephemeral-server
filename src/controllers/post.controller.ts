import { type Response } from 'express'

import type { AuthenticatedRequest } from '../middleware/auth.middleware.js'
import type { CreatePostInput } from '../validations/post.validation.js'

import PostService from '../services/post.service.js'

class PostController {
  private readonly postService: PostService

  constructor() {
    this.postService = new PostService()
  }

  createPost = async (
    req: AuthenticatedRequest<CreatePostInput>,
    res: Response
  ) => {
    const { content, topics } = req.body
    const { userId } = req

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' })
    }

    const post = await this.postService.createPost({
      content,
      topics,
      userId,
    })

    return res.status(201).json(post)
  }
}

export default PostController
