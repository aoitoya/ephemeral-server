import { z } from 'zod'

export const createCommentSchema = z.object({
  content: z.string().min(1, 'Content cannot be empty'),
  postId: z.string().min(1, 'Post id cannot be empty'),
})

export const createPostSchema = z.object({
  content: z.string().min(1, 'Content cannot be empty'),
  topics: z.array(z.string().min(1, 'Topic cannot be empty')),
})

export type CreateCommentInput = z.infer<typeof createCommentSchema>
export type CreatePostInput = z.infer<typeof createPostSchema>
