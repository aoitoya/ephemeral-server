import { type Request, type Response } from 'express'

import type {
  CreateCommentInput,
  CreatePostInput,
  CreateVoteInput,
} from './post.validation.js'

import {
  AuthenticationError,
  ValidationError,
} from '../../shared/errors/index.js'
import MediaService from '../media/media.service.js'
import PostService from './post.service.js'

class PostController {
  private readonly mediaService: MediaService
  private readonly postService: PostService

  constructor() {
    this.mediaService = new MediaService()
    this.postService = new PostService()
  }

  createComment = async (req: Request, res: Response) => {
    const user = req.session.user
    const { commentId, content, postId } = req.body as CreateCommentInput

    if (!user) {
      throw new AuthenticationError('No user id found')
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
    const file = req.file
    const user = req.session.user

    if (!user) {
      throw new AuthenticationError('No user id found')
    }

    let mediaKey: string | undefined
    if (file) {
      mediaKey = await this.mediaService.uploadImage(file)
    }

    const post = await this.postService.createPost({
      content,
      mediaKey,
      topics,
      userId: user.id,
    })

    return res.status(201).json(post)
  }

  getAll = async (req: Request, res: Response) => {
    const user = req.session.user

    const posts = await this.postService.getPosts(user?.id)

    return res.status(200).json(posts)
  }

  getComments = async (req: Request, res: Response) => {
    const postId = req.query.postId as string
    const commentId = req.query.commentId as string
    const user = req.session.user

    if (commentId) {
      const comments = await this.postService.getCommentReplies(
        commentId,
        user?.id
      )

      return res.status(200).json(comments)
    }

    if (postId) {
      const comments = await this.postService.getComments(postId, user?.id)

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
      throw new AuthenticationError('No user id found')
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

    throw new ValidationError('Either commentId or postId must be provided')
  }
}

export default PostController
