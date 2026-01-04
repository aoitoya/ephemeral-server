import { and, asc, count, desc, eq, sql } from 'drizzle-orm'

import { db } from '../../db/connection.js'
import {
  comments,
  engagementHourly,
  pEngagementCache,
  posts,
  users,
  Vote,
  votes,
} from '../../db/schema.js'

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
    const commentCounts = db.$with('comment_counts').as(
      db
        .select({
          count: count().as('count'),
          postId: comments.postId,
        })
        .from(comments)
        .groupBy(comments.postId)
    )

    const feedScore = sql<number>`(
    COALESCE(${pEngagementCache.currentVelocity}, 1)
    * EXP(
        -EXTRACT(EPOCH FROM (NOW() - ${posts.createdAt})) / 3600.0 / 6.0
      )
    * LN(GREATEST(${posts.upvotes} + 1, 1))
  )`.as('feed_score')

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
        feedScore: feedScore,
        id: posts.id,
        topics: posts.topics,
        upvotes: posts.upvotes,
        userId: posts.userId,
        userVote: votes.type,
      })
      .from(posts)
      .leftJoin(pEngagementCache, eq(pEngagementCache.postId, posts.id))
      .leftJoin(commentCounts, eq(commentCounts.postId, posts.id))
      .leftJoin(users, eq(posts.userId, users.id))
      .leftJoin(
        votes,
        and(eq(votes.postId, posts.id), eq(votes.userId, currentUserId))
      )
      .orderBy(desc(feedScore))

    return await query
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
    const column = type === 'upvote' ? 'upvotes' : 'downvotes'

    const [result] = await tx
      .update(table)
      .set({ [column]: sql`${table[column]} - 1` })
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
        downvotes: sql`${table.downvotes} + ${downvoteIncrement}`,
        upvotes: sql`${table.upvotes} + ${upvoteIncrement}`,
      })
      .where(eq(table.id, id))
      .returning()

    if (isPostVote) {
      // Remove old vote engagement and add new vote engagement
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
    type:
      | '-comment'
      | '-downvote'
      | '-upvote'
      | 'comment'
      | 'downvote'
      | 'upvote'
  }) {
    const WEIGHT = {
      '-comment': -2,
      '-downvote': 4,
      '-upvote': -3,
      comment: 2,
      downvote: -4,
      upvote: 3,
    }

    await (tx ?? db)
      .insert(engagementHourly)
      .values({
        hour: sql`date_trunc('hour', now())`,
        postId,
        score: WEIGHT[type],
      })
      .onConflictDoUpdate({
        set: {
          score: sql`${engagementHourly.score} + excluded.score`,
        },
        target: [engagementHourly.postId, engagementHourly.hour],
      })

    await (tx ?? db)
      .update(pEngagementCache)
      .set({
        nextUpdate: sql`NOW()`,
      })
      .where(eq(pEngagementCache.postId, postId))
  }
}

export default PostService
