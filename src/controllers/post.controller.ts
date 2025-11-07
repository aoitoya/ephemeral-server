import { type Response } from 'express'

import type { AuthenticatedRequest } from '../middleware/auth.middleware.js'
import type {
  CreateCommentInput,
  CreatePostInput,
} from '../validations/post.validation.js'

import PostService from '../services/post.service.js'

class PostController {
  private readonly postService: PostService

  constructor() {
    this.postService = new PostService()
  }

  createComment = async (
    req: AuthenticatedRequest<CreateCommentInput>,
    res: Response
  ) => {
    const { userId } = req
    const { content, postId } = req.body

    if (!userId) {
      return res.status(401).json({ message: 'No user id found' })
    }

    const comment = await this.postService.createComment({
      content,
      postId,
      userId,
    })

    return res.status(201).json(comment)
  }

  createPost = async (
    req: AuthenticatedRequest<CreatePostInput>,
    res: Response
  ) => {
    const { content, topics } = req.body
    const { userId } = req

    if (!userId) {
      return res.status(401).json({ message: 'No user id found' })
    }

    const post = await this.postService.createPost({
      content,
      topics,
      userId,
    })

    return res.status(201).json(post)
  }

  getPosts = async (req: AuthenticatedRequest, res: Response) => {
    const { userId } = req

    if (!userId) {
      return res.status(401).json({ message: 'No user id found' })
    }

    const posts = await this.postService.getPosts()

    return res.status(200).json(posts)
  }
}

export default PostController
