import { avg, desc, eq, sql } from 'drizzle-orm'

import logger from '../config/logger.js'
import { db } from '../db/connection.js'
import { configs, posts } from '../db/schema.js'

class EngagementUpdateScheduler {
  private readonly AVERAGE_SCORE_UPDATE_INTERVAL = 24 * 60 * 60 * 1000
  private averageScoreInterval: NodeJS.Timeout | null = null
  private readonly ENGAGEMENT_UPDATE_INTERVAL = 2 * 60 * 1000
  private engagementInterval: NodeJS.Timeout | null = null
  private readonly TOP_POSTS_LIMIT = 1_000_000

  start() {
    this.initializeAverageScore()
    this.startAverageScoreUpdates()
    this.startEngagementUpdates()
  }

  stop() {
    if (this.engagementInterval) {
      clearInterval(this.engagementInterval)
      this.engagementInterval = null
    }
    if (this.averageScoreInterval) {
      clearInterval(this.averageScoreInterval)
      this.averageScoreInterval = null
    }
  }

  private handleError = (error: unknown) => {
    logger.error('Background service error:', error)
  }

  private initializeAverageScore() {
    db.select()
      .from(configs)
      .where(eq(configs.key, 'AVG_SCORE'))
      .then((res) => {
        if (!res[0]) {
          this.updateAverageScore().catch(this.handleError)
        }
      })
      .catch(this.handleError)
  }

  private startAverageScoreUpdates() {
    this.averageScoreInterval = setInterval(() => {
      this.updateAverageScore().catch(this.handleError)
    }, this.AVERAGE_SCORE_UPDATE_INTERVAL)
  }

  private startEngagementUpdates() {
    this.engagementInterval = setInterval(() => {
      this.updateEngagementCache().catch(this.handleError)
    }, this.ENGAGEMENT_UPDATE_INTERVAL)
  }

  private async updateAverageScore() {
    try {
      const avgScoreResult = await db
        .select({
          avgScore: avg(posts.score).as('avgScore'),
        })
        .from(
          db
            .select({ score: posts.score })
            .from(posts)
            .orderBy(desc(posts.score))
            .limit(this.TOP_POSTS_LIMIT)
            .as('topPosts')
        )

      if (avgScoreResult.length === 0) {
        logger.warn('No posts found for average score calculation')
        return
      }

      await db
        .update(configs)
        .set({ value: avgScoreResult[0].avgScore })
        .where(eq(configs.key, 'AVG_SCORE'))
    } catch (error) {
      logger.error('Error updating average score:', error)
    }
  }

  private async updateEngagementCache() {
    try {
      const result = await db.execute(sql`SELECT update_post_score()`)
      if (result.rows.length === 0) {
        logger.warn('No result from engagement cache update')
        return
      }
      logger.info('Engagement cache updated:', result.rows[0])
    } catch (error) {
      logger.error('Failed to update engagement cache:', error)
    }
  }
}

export const engagementScheduler = new EngagementUpdateScheduler()
