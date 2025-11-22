import { and, desc, eq, sql } from 'drizzle-orm'

import { db } from '../db/connection.js'
import { comments, posts, users, Vote, votes } from '../db/schema.js'

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

type Transaction = Parameters<Parameters<typeof db.transaction>[0]>[0]

class PostService {
  async createComment(input: CreateCommentInput) {
    const [comment] = await db.insert(comments).values(input).returning()

    return comment
  }

  async createPost(input: CreatePostInput) {
    const [post] = await db.insert(posts).values(input).returning()

    return post
  }

  async getCommentReplies(commentId: string) {
    const rows = await db
      .select()
      .from(comments)
      .where(eq(comments.commentId, commentId))
      .orderBy(desc(comments.createdAt))
      .leftJoin(users, eq(comments.userId, users.id))
      .leftJoin(votes, eq(comments.id, votes.commentId))

    return rows.map((r) => ({
      ...r.comments,
      author: r.users,
      userVote: r.votes?.type,
    }))
  }

  async getComments(postId: string) {
    const rows = await db
      .select()
      .from(comments)
      .where(eq(comments.postId, postId))
      .orderBy(desc(comments.createdAt))
      .leftJoin(users, eq(comments.userId, users.id))
      .leftJoin(votes, eq(comments.id, votes.commentId))

    return rows.map((r) => ({
      ...r.comments,
      author: r.users,
      userVote: r.votes?.type,
    }))
  }

  async getPosts(currentUserId: string) {
    const rows = await db.execute(sql`
    SELECT
      to_jsonb(p)                               AS post,
      jsonb_build_object(
        'id', u.id,
        'username', u.username
      ) AS author,
      COALESCE(c_arr.comments, '[]'::jsonb)     AS comments,
      v_arr.user_vote                           AS user_vote
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
          ) AS author
        FROM comments c
        JOIN users cu ON cu.id = c.user_id
        WHERE c.post_id = p.id
        ORDER BY c.created_at DESC
        LIMIT 10
      ) c
    ) c_arr ON true
    LEFT JOIN LATERAL (
      SELECT v.type::text AS user_vote
      FROM votes v
      WHERE v.post_id = p.id
        AND v.user_id = ${currentUserId}
      LIMIT 1
    ) v_arr ON true
    ORDER BY p.created_at DESC
    LIMIT 10 OFFSET 0;
  `)

    return rows.rows
  }

  async vote(input: CreateVoteInput) {
    return db.transaction(async (tx) => {
      const { type, userId } = input
      const isPostVote = 'postId' in input
      const id = isPostVote ? input.postId : input.commentId

      const voteCondition = isPostVote
        ? eq(votes.postId, id)
        : eq(votes.commentId, id)

      const voteWhere = and(eq(votes.userId, userId), voteCondition)
      const existingVote = (
        await tx.select().from(votes).where(voteWhere)
      )[0] as undefined | Vote

      if (!existingVote) {
        return this.handleNewVote(tx, input, isPostVote, id)
      }

      if (existingVote.type === type) {
        return this.handleVoteRemoval(tx, input, existingVote, isPostVote, id)
      }

      return this.handleVoteUpdate(tx, input, existingVote, isPostVote, id)
    })
  }

  private async handleNewVote(
    tx: Transaction,
    input: CreateVoteInput,
    isPostVote: boolean,
    id: string
  ) {
    const { type } = input
    await tx.insert(votes).values(input)

    const table = isPostVote ? posts : comments
    const column = type === 'upvote' ? 'upvotes' : 'downvotes'

    const [result] = await tx
      .update(table)
      .set({ [column]: sql`${table[column]} + 1` })
      .where(eq(table.id, id))
      .returning()

    return result
  }

  private async handleVoteRemoval(
    tx: Transaction,
    input: CreateVoteInput,
    existingVote: Vote,
    isPostVote: boolean,
    id: string
  ) {
    const { type } = input
    await tx.delete(votes).where(eq(votes.id, existingVote.id))

    const table = isPostVote ? posts : comments
    const column = type === 'upvote' ? 'upvotes' : 'downvotes'

    const [result] = await tx
      .update(table)
      .set({ [column]: sql`${table[column]} - 1` })
      .where(eq(table.id, id))
      .returning()

    return result
  }

  private async handleVoteUpdate(
    tx: Transaction,
    input: CreateVoteInput,
    existingVote: Vote,
    isPostVote: boolean,
    id: string
  ) {
    const { type } = input
    await tx.update(votes).set({ type }).where(eq(votes.id, existingVote.id))

    const table = isPostVote ? posts : comments
    const upvoteIncrement = type === 'upvote' ? 1 : -1
    const downvoteIncrement = type === 'downvote' ? 1 : -1

    const [result] = await tx
      .update(table)
      .set({
        downvotes: sql`${table.downvotes} + ${downvoteIncrement}`,
        upvotes: sql`${table.upvotes} + ${upvoteIncrement}`,
      })
      .where(eq(table.id, id))
      .returning()

    return result
  }
}

export default PostService
