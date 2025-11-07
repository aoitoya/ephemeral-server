import { eq, sql } from 'drizzle-orm'

import { db } from '../db/connection.js'
import { comments, posts, votes } from '../db/schema.js'

export type CreateCommentInput = {
  content: string
  userId: string
} & (
  | {
      commentId: string
    }
  | {
      postId: string
    }
)

export interface CreateCommentReplyInput {
  commentId: string
  content: string
  userId: string
}

export interface CreatePostInput {
  content: string
  topics: string[]
  userId: string
}

export type CreateVoteInput = {
  type: 'downvote' | 'upvote'
  userId: string
} & (
  | {
      commentId: string
    }
  | {
      postId: string
    }
)

class PostService {
  async createComment(input: CreateCommentInput) {
    const [comment] = await db.insert(comments).values(input).returning()

    return comment
  }

  async createPost(input: CreatePostInput) {
    const [post] = await db.insert(posts).values(input).returning()

    return post
  }

  async getPosts() {
    const rows = await db.execute(sql`
      SELECT
        to_jsonb(p)                               AS post,
        jsonb_build_object(
          'id', u.id,
          'username', u.username
        ) AS author,
        COALESCE(c_arr.comments, '[]'::jsonb)     AS comments
      FROM posts p
      JOIN users u ON u.id = p.user_id
      LEFT JOIN LATERAL (
        SELECT jsonb_agg(to_jsonb(c) ORDER BY c.created_at DESC) AS comments
        FROM (
          SELECT
            c.id,
            c.content,
            c.created_at,
            jsonb_build_object(
              'id', cu.id,
              'name', cu.username
            ) AS commenter
          FROM comments c
          JOIN users cu ON cu.id = c.user_id
          WHERE c.post_id = p.id
          ORDER BY c.created_at DESC
          LIMIT 10
        ) c
      ) c_arr ON true
      ORDER BY p.created_at DESC
      LIMIT 10 OFFSET 0;
`)

    return rows.rows
  }

  async vote(input: CreateVoteInput) {
    return await db.transaction(async (tx) => {
      const inserted = await tx.insert(votes).values(input).returning()

      if (inserted.length === 0) {
        throw new Error('Already voted')
      }

      if ('postId' in input) {
        const [post] = await tx
          .update(posts)
          .set(
            input.type === 'upvote'
              ? { upvotes: sql`${posts.upvotes} + 1` }
              : { downvotes: sql`${posts.downvotes} + 1` }
          )
          .where(eq(posts.id, input.postId))
          .returning()

        return post
      }

      if ('commentId' in input) {
        const [comment] = await tx
          .update(comments)
          .set(
            input.type === 'upvote'
              ? { upvotes: sql`${comments.upvotes} + 1` }
              : { downvotes: sql`${comments.downvotes} + 1` }
          )
          .where(eq(comments.id, input.commentId))
          .returning()

        return comment
      }
    })
  }
}

export default PostService
