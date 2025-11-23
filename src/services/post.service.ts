import { and, asc, desc, eq, sql } from 'drizzle-orm'

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
      .orderBy(asc(comments.createdAt))
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
    const rows = await db
      .select({
        author: {
          id: users.id,
          username: users.username,
        },
        commentCount: sql<string>`
        (select count(*) from "comments" c where c."post_id" = ${posts.id})
        `,
        content: posts.content,
        createdAt: posts.createdAt,
        downvotes: posts.downvotes,
        id: posts.id,
        topics: posts.topics,
        upvotes: posts.upvotes,
        userId: posts.userId,
        userVote: sql<null | string>`
        (select v."type" from "votes" v
         where v."post_id" = ${posts.id} and v."user_id" = ${currentUserId} limit 1)
      `,
      })
      .from(posts)
      .leftJoin(users, eq(posts.userId, users.id))
      .orderBy(desc(posts.createdAt))
      .limit(10)

    return rows.map((r) => ({
      ...r,
      commentCount: Number(r.commentCount) || 0,
    }))
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
