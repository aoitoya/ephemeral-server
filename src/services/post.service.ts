import { db } from '../db/connection.js'
import { posts } from '../db/schema.js'

export interface CreatePostInput {
  content: string
  topics: string[]
  userId: string
}

class PostService {
  async createPost(input: CreatePostInput) {
    const [post] = await db.insert(posts).values(input).returning()

    return post
  }
}

export default PostService
