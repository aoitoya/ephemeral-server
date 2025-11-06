import { z } from 'zod'

export const createPostSchema = z.object({
  content: z.string().min(1, 'Content cannot be empty'),
  topics: z.array(z.string().min(1, 'Topic cannot be empty')),
})

export type CreatePostInput = z.infer<typeof createPostSchema>
