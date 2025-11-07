import { type Response } from 'express'

import type { AuthenticatedRequest } from '../middleware/auth.middleware.js'
import type {
  CreateCommentInput,
  CreatePostInput,
  CreateVoteInput,
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
    const { commentId, content, postId } = req.body

    if (!userId) {
      return res.status(401).json({ message: 'No user id found' })
    }

    if (postId) {
      const comment = await this.postService.createComment({
        content,
        postId,
        userId,
      })

      return res.status(201).json(comment)
    }

    if (commentId) {
      const comment = await this.postService.createComment({
        commentId,
        content,
        userId,
      })

      return res.status(201).json(comment)
    }

    return res
      .status(400)
      .json({ message: 'Either commentId or postId must be provided' })
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

  vote = async (req: AuthenticatedRequest<CreateVoteInput>, res: Response) => {
    const { userId } = req
    const { commentId, postId, type } = req.body

    if (!userId) {
      return res.status(401).json({ message: 'No user id found' })
    }

    if (commentId) {
      const post = await this.postService.vote({ commentId, type, userId })
      return res.status(200).json(post)
    }

    if (postId) {
      const post = await this.postService.vote({ postId, type, userId })
      return res.status(200).json(post)
    }

    return res
      .status(400)
      .json({ message: 'Either commentId or postId must be provided' })
  }
}

export default PostController
