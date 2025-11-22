import { type Request, type Response } from 'express'

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

  createComment = async (req: Request, res: Response) => {
    const user = req.session.user
    const { commentId, content, postId } = req.body as CreateCommentInput

    if (!user) {
      return res.status(401).json({ message: 'No user id found' })
    }

    if (postId) {
      const comment = await this.postService.createComment({
        content,
        postId,
        userId: user.id,
      })

      return res.status(201).json(comment)
    }

    if (commentId) {
      const comment = await this.postService.createComment({
        commentId,
        content,
        userId: user.id,
      })

      return res.status(201).json(comment)
    }

    return res
      .status(400)
      .json({ message: 'Either commentId or postId must be provided' })
  }

  createPost = async (req: Request, res: Response) => {
    const { content, topics } = req.body as CreatePostInput
    const user = req.session.user

    if (!user) {
      return res.status(401).json({ message: 'No user id found' })
    }

    const post = await this.postService.createPost({
      content,
      topics,
      userId: user.id,
    })

    return res.status(201).json(post)
  }

  getAll = async (req: Request, res: Response) => {
    const user = req.session.user

    if (!user) {
      return res.status(401).json({ message: 'No user id found' })
    }

    const posts = await this.postService.getPosts(user.id)

    return res.status(200).json(posts)
  }

  getComments = async (req: Request, res: Response) => {
    const postId = req.query.postId as string
    const commentId = req.query.commentId as string
    const user = req.session.user

    if (!user) {
      return res.status(401).json({ message: 'No user id found' })
    }

    if (commentId) {
      const comments = await this.postService.getCommentReplies(commentId)

      return res.status(200).json(comments)
    }

    if (postId) {
      const comments = await this.postService.getComments(postId)

      return res.status(200).json(comments)
    }

    return res
      .status(400)
      .json({ message: 'Either commentId or postId must be provided' })
  }

  vote = async (req: Request, res: Response) => {
    const user = req.session.user
    const { commentId, postId, type } = req.body as CreateVoteInput

    if (!user) {
      return res.status(401).json({ message: 'No user id found' })
    }

    if (commentId) {
      const post = await this.postService.vote({
        commentId,
        type,
        userId: user.id,
      })
      return res.status(200).json(post)
    }

    if (postId) {
      const post = await this.postService.vote({
        postId,
        type,
        userId: user.id,
      })
      return res.status(200).json(post)
    }

    return res
      .status(400)
      .json({ message: 'Either commentId or postId must be provided' })
  }
}

export default PostController
