import { z } from 'zod'

export const createCommentSchema = z
  .object({
    commentId: z.string().min(1, 'Comment id cannot be empty').optional(),
    content: z.string().min(1, 'Content cannot be empty'),
    postId: z.string().min(1, 'Post id cannot be empty').optional(),
  })
  .refine((data) => !data.commentId !== !data.postId, {
    message: 'Either commentId or postId must be provided',
    path: ['base'],
  })
  .refine((data) => !(data.commentId && data.postId), {
    message: 'Cannot provide both commentId and postId',
    path: ['base'],
  })

const VoteType = z.enum(['upvote', 'downvote'])

export const createVoteSchema = z
  .object({
    commentId: z.string().min(1, 'Comment id cannot be empty').optional(),
    postId: z.string().min(1, 'Post id cannot be empty').optional(),
    type: VoteType,
  })
  .refine((data) => !data.commentId !== !data.postId, {
    message: 'Either commentId or postId must be provided',
    path: ['base'],
  })

export const createPostSchema = z.object({
  content: z.string().min(1, 'Content cannot be empty'),
  topics: z.array(z.string().min(1, 'Topic cannot be empty')),
})

export type CreateCommentInput = z.infer<typeof createCommentSchema>
export type CreatePostInput = z.infer<typeof createPostSchema>
export type CreateVoteInput = z.infer<typeof createVoteSchema>
