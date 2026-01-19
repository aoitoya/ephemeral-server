import { and, asc, count, desc, eq, sql } from 'drizzle-orm'

import { db } from '../../db/connection.js'
import {
  comments,
  engagementHourly,
  posts,
  users,
  Vote,
  votes,
} from '../../db/schema.js'
import {
  AuthorizationError,
  DatabaseError,
  NotFoundError,
} from '../../shared/errors/index.js'

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

const ENGAGEMENT_WEIGHTS = {
  '-comment': -2,
  '-downvote': 4,
  '-upvote': -3,
  comment: 2,
  downvote: -4,
  upvote: 3,
} as const

type EngagementType = keyof typeof ENGAGEMENT_WEIGHTS

class PostService {
  async createComment(input: CreateCommentInput) {
    const comment = await db.transaction(async (tx) => {
      const [created] = await tx.insert(comments).values(input).returning()

      if ('postId' in input) {
        await this.updateHourlyEngagement({
          postId: input.postId,
          tx,
          type: 'comment',
        })
      }

      return created
    })

    return comment
  }

  async createPost(input: CreatePostInput) {
    const [post] = await db.insert(posts).values(input).returning()
    return post
  }

  async getCommentReplies(commentId: string, userId?: string) {
    const rows = await db
      .select()
      .from(comments)
      .where(eq(comments.commentId, commentId))
      .orderBy(asc(comments.createdAt))
      .leftJoin(users, eq(comments.userId, users.id))
      .leftJoin(
        votes,
        and(eq(comments.id, votes.commentId), eq(votes.userId, userId ?? ''))
      )

    return rows.map((r) => ({
      ...r.comments,
      author: r.users,
      userVote: r.votes?.type,
      votes: r.votes,
    }))
  }

  async getComments(postId: string, userId?: string) {
    const query = db
      .select()
      .from(comments)
      .where(eq(comments.postId, postId))
      .orderBy(desc(comments.createdAt))
      .leftJoin(users, eq(comments.userId, users.id))

    if (userId) {
      const rows = await query.leftJoin(
        votes,
        and(eq(comments.id, votes.commentId), eq(votes.userId, userId))
      )

      return rows.map((r) => ({
        ...r.comments,
        author: r.users,
        userVote: r.votes?.type,
      }))
    }

    const rows = await query
    return rows.map((r) => ({
      ...r.comments,
      author: r.users,
    }))
  }

  async getPosts(currentUserId?: string) {
    const commentCounts = db.$with('comment_counts').as(
      db
        .select({
          count: count().as('count'),
          postId: comments.postId,
        })
        .from(comments)
        .groupBy(comments.postId)
    )

    const query = db
      .with(commentCounts)
      .select({
        author: {
          id: users.id,
          username: users.username,
        },
        commentCount: sql<number>`COALESCE(${commentCounts.count}, 0)`,
        content: posts.content,
        createdAt: posts.createdAt,
        downvotes: posts.downvotes,
        id: posts.id,
        score: posts.score,
        topics: posts.topics,
        upvotes: posts.upvotes,
        userId: posts.userId,
      })
      .from(posts)
      .leftJoin(commentCounts, eq(commentCounts.postId, posts.id))
      .leftJoin(users, eq(posts.userId, users.id))

    if (currentUserId) {
      query.leftJoin(
        votes,
        and(eq(votes.postId, posts.id), eq(votes.userId, currentUserId))
      )
    }

    const rows = await query.orderBy(desc(posts.score))

    return rows
  }

  async vote(input: CreateVoteInput) {
    try {
      return await db.transaction(async (tx) => {
        const { type, userId } = input
        const isPostVote = 'postId' in input
        const id = isPostVote ? input.postId : input.commentId

        const table = isPostVote ? posts : comments
        const contentResults = await tx
          .select({ userId: table.userId })
          .from(table)
          .where(eq(table.id, id))

        if (contentResults.length === 0) {
          throw new NotFoundError(
            isPostVote ? 'Post not found' : 'Comment not found'
          )
        }

        const content = contentResults[0]
        if (content.userId === userId) {
          throw new AuthorizationError('Cannot vote on your own content')
        }

        const voteCondition = isPostVote
          ? eq(votes.postId, id)
          : eq(votes.commentId, id)

        const voteWhere = and(eq(votes.userId, userId), voteCondition)
        const existingVotes = await tx.select().from(votes).where(voteWhere)

        if (existingVotes.length === 0) {
          return this.handleNewVote(tx, input, isPostVote, id)
        }

        const existingVote = existingVotes[0]

        if (existingVote.type === type) {
          return this.handleVoteRemoval(tx, input, existingVote, isPostVote, id)
        }

        return this.handleVoteUpdate(tx, input, existingVote, isPostVote, id)
      })
    } catch (error) {
      // Re-throw custom errors as-is, wrap database errors
      if (
        error instanceof AuthorizationError ||
        error instanceof NotFoundError
      ) {
        throw error
      }
      throw new DatabaseError(
        'Failed to process vote',
        error instanceof Error ? error : undefined
      )
    }
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
    const downvotesColumn = isPostVote ? posts.downvotes : comments.downvotes
    const upvotesColumn = isPostVote ? posts.upvotes : comments.upvotes

    const downvotesValue =
      type === 'downvote' ? sql`${downvotesColumn} + 1` : downvotesColumn
    const upvotesValue =
      type === 'upvote' ? sql`${upvotesColumn} + 1` : upvotesColumn

    const [result] = await tx
      .update(table)
      .set({
        downvotes: downvotesValue,
        upvotes: upvotesValue,
      })
      .where(eq(table.id, id))
      .returning()

    if (isPostVote) {
      await this.updateHourlyEngagement({ postId: id, tx, type })
    }

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
    const downvotesColumn = isPostVote ? posts.downvotes : comments.downvotes
    const upvotesColumn = isPostVote ? posts.upvotes : comments.upvotes

    const downvotesValue =
      type === 'downvote' ? sql`${downvotesColumn} - 1` : downvotesColumn
    const upvotesValue =
      type === 'upvote' ? sql`${upvotesColumn} - 1` : upvotesColumn

    const [result] = await tx
      .update(table)
      .set({
        downvotes: downvotesValue,
        upvotes: upvotesValue,
      })
      .where(eq(table.id, id))
      .returning()

    if (isPostVote) {
      await this.updateHourlyEngagement({ postId: id, tx, type: `-${type}` })
    }

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
        downvotes: isPostVote
          ? sql`${posts.downvotes} + ${downvoteIncrement}`
          : sql`${comments.downvotes} + ${downvoteIncrement}`,
        upvotes: isPostVote
          ? sql`${posts.upvotes} + ${upvoteIncrement}`
          : sql`${comments.upvotes} + ${upvoteIncrement}`,
      })
      .where(eq(table.id, id))
      .returning()

    if (isPostVote) {
      await this.updateHourlyEngagement({
        postId: id,
        tx,
        type: `-${existingVote.type}`,
      })
      await this.updateHourlyEngagement({ postId: id, tx, type })
    }

    return result
  }

  private async updateHourlyEngagement({
    postId,
    tx,
    type,
  }: {
    postId: string
    tx?: Transaction
    type: EngagementType
  }) {
    await (tx ?? db)
      .insert(engagementHourly)
      .values({
        hour: sql`date_trunc('hour', now())`,
        points: ENGAGEMENT_WEIGHTS[type],
        postId,
      })
      .onConflictDoUpdate({
        set: {
          points: sql`${engagementHourly.points} + excluded.points`,
        },
        target: [engagementHourly.postId, engagementHourly.hour],
      })
  }
}

export default PostService
