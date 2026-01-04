import { sql } from 'drizzle-orm'

import logger from '../config/logger.js'
import { db } from '../db/connection.js'

class EngagementScheduler {
  private interval: NodeJS.Timeout | null = null

  start() {
    this.interval = setInterval(
      () => {
        this.updateEngagementCache().catch(console.error)
      },
      2 * 60 * 1000
    )
  }

  stop() {
    if (this.interval) {
      clearInterval(this.interval)
      this.interval = null
    }
  }

  private async updateEngagementCache() {
    try {
      const result = await db.execute(
        sql`SELECT refresh_engagement_cache_smart()`
      )
      logger.info('Engagement cache updated:', result.rows[0])
    } catch (error) {
      logger.error('Failed to update engagement cache:', error)
    }
  }
}

export const engagementScheduler = new EngagementScheduler()
